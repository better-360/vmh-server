import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ActionStatus, MailActionType, Prisma } from '@prisma/client';
import { UpdateActionStatusDto,CreateMailActionDto,CompleteForwardDto, CancelForwardDto,QueryMailActionsDto, ForwarMeta } from 'src/dtos/mail-actions.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MailActionsService {
  constructor(private readonly prisma: PrismaService) {}

  async listActions(q: QueryMailActionsDto) {
    const {
      type, status, mailboxId, officeLocationId, search,
      from, to, sort = 'requestedAt', order = 'desc',
    } = q;

    const where: Prisma.MailActionWhereInput = {
      ...(type && { type }),
      ...(status && { status }),
      ...(from || to ? {
        requestedAt: {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(to) }),
        },
      } : {}),
      ...(search ? {
        OR: [
          { mail: { steNumber: { contains: search, mode: 'insensitive' } } },
          { mail: { trackingNumber: { contains: search, mode: 'insensitive' } } },
          { mail: { senderName: { contains: search, mode: 'insensitive' } } },
        ],
      } : {}),
      ...(mailboxId && { mail: { mailboxId } }),
      ...(officeLocationId && { mail: { mailbox: { officeLocationId } } }),
    };

    const [items] = await this.prisma.$transaction([
      this.prisma.mailAction.findMany({
        where,
        include: {
          mail: {
            select: {
              id: true,
              steNumber: true,
              mailboxId: true,
              trackingNumber: true,
              currentStatus: true,
              isForwarded: true,
              isShereded: true,
              senderName: true,
            },
          },
        },
        orderBy: { [sort]: order },
      })
    ]);

    return items
  }

  async getActionById(id: string) {
    const act = await this.prisma.mailAction.findUnique({
      where: { id },
      include: {
        mail: true,
      },
    });
    if (!act) throw new NotFoundException('Action not found');
    return act;
  }

  async createAction(dto: CreateMailActionDto) {
    const mail = await this.prisma.mail.findUnique({ where: { id: dto.mailId } });
    if (!mail) throw new NotFoundException('Mail not found');

    const isForward = dto.type === MailActionType.FORWARD;

    if (isForward) {
      if (!dto.meta?.forward) {
        throw new BadRequestException('FORWARD requires meta.forward payload');
      }
      const fwd = dto.meta.forward as ForwarMeta;
      if(!fwd.mailboxId || !fwd.officeLocationId || !fwd.deliveryAddressId || !fwd.deliverySpeedOptionId || !fwd.packagingTypeOptionId) {
        throw new BadRequestException('FORWARD meta requires mailboxId, officeLocationId, deliveryAddressId, deliverySpeedOptionId, and packagingTypeOptionId');
      }


      return await this.prisma.$transaction(async (tx) => {
        // 1) ForwardingRequest oluştur
        const forwarding = await tx.forwardingRequest.create({
          data: {
            mailId: dto.mailId,
            mailboxId: fwd.mailboxId,
            officeLocationId: fwd.officeLocationId,
            deliveryAddressId: fwd.deliveryAddressId,
            deliverySpeedOptionId: fwd.deliverySpeedOptionId,
            packagingTypeOptionId: fwd.packagingTypeOptionId,
            carrierId: fwd.carrierId ?? null,
            shippingCost: 0,
            packagingCost: 0,
            totalCost: 0,
          },
        });

        // 2) Action kaydı
        const action = await tx.mailAction.create({
          data: {
            mailId: dto.mailId,
            type: MailActionType.FORWARD,
            status: ActionStatus.PENDING,
            meta: { forwardingRequestId: forwarding.id, ...dto.meta },
          },
        });

        // 3) (opsiyonel) Mail.status’i güncelle (örn. “IN_PROGRESS” gibi)
        await tx.mail.update({
          where: { id: dto.mailId },
          data: { status: 'IN_PROGRESS' as any },
        });

        return { action, forwarding };
      });
    }

    // Diğer aksiyonlar için tek kayıt
    const action = await this.prisma.mailAction.create({
      data: {
      mailId: dto.mailId,
        type: dto.type,
        status: ActionStatus.PENDING,
        meta: dto.meta ?? {},
      },
    });

    // İsteğe göre flag’leri pratikçe güncelle
    const patch: Prisma.MailUpdateInput = {};
    if (dto.markShredded) patch.isShereded = true;
    if (dto.markJunk) patch.currentStatus = 'JUNK' as any;
    if (dto.markHold) patch.currentStatus = 'HOLD' as any;
    if (dto.markScanned) patch.currentStatus = 'SCANNED' as any;

    if (Object.keys(patch).length) {
      await this.prisma.mail.update({ where: { id: dto.mailId }, data: patch });
    }

    return { action };
  }

  async updateActionStatus(id: string, dto: UpdateActionStatusDto) {
    const action = await this.prisma.mailAction.findUnique({
      where: { id },
      include: { mail: true },
    });
    if (!action) throw new NotFoundException('Action not found');

    const nextData: Prisma.MailActionUpdateInput = {
      status: dto.status,
      ...(dto.status === ActionStatus.DONE && { completedAt: new Date() }),
      ...(dto.status !== ActionStatus.DONE && { completedAt: null }),
      ...(dto.reason && { meta: { ...(action.meta as any), reason: dto.reason } }),
    };

    const updated = await this.prisma.mailAction.update({
      where: { id },
      data: nextData,
    });

    // Non-forward tamamlandıysa mail flag/state güncellemeleri
    if (updated.type !== MailActionType.FORWARD && dto.status === ActionStatus.DONE) {
      const mailPatch: Prisma.MailUpdateInput = {};
      if (updated.type === MailActionType.SHRED) mailPatch.isShereded = true;
      if (updated.type === MailActionType.JUNK) mailPatch.currentStatus = 'JUNK' as any;
      if (updated.type === MailActionType.HOLD) mailPatch.currentStatus = 'HOLD' as any;
      if (updated.type === MailActionType.SCAN) mailPatch.currentStatus = 'SCANNED' as any;

      if (Object.keys(mailPatch).length) {
        await this.prisma.mail.update({ where: { id: updated.mailId }, data: mailPatch });
      }
    }

    return updated;
  }

  async completeForward(id: string, body: CompleteForwardDto) {
    // Action + meta.forwardingRequestId bul
    const action = await this.prisma.mailAction.findUnique({
      where: { id },
    });
    if (!action) throw new NotFoundException('Action not found');
    if (action.type !== MailActionType.FORWARD) {
      throw new BadRequestException('Not a FORWARD action');
    }

    const forwardingRequestId = (action.meta as any)?.forwardingRequestId as string | undefined;
    if (!forwardingRequestId) {
      throw new BadRequestException('Missing forwardingRequestId in action.meta');
    }

    return await this.prisma.$transaction(async (tx) => {
      // Maliyet hesap – dış servisten veya dahili kurallardan alabilirsiniz
      const shippingCost = body.shippingCost ?? 0;
      const packagingCost = body.packagingCost ?? 0;
      const totalCost = body.totalCost ?? (shippingCost + packagingCost);

      // ForwardingRequest güncelle
      const forwarding = await tx.forwardingRequest.update({
        where: { id: forwardingRequestId },
        data: {
          carrierId: body.carrierId ?? undefined,
          trackingCode: body.trackingCode ?? undefined,
          shippingCost, packagingCost, totalCost,
          status: 'COMPLETED' as any,
          paymentStatus: 'CHARGED' as any, // ödeme akışınıza göre
          completedAt: new Date(),
        },
      });

      // Action DONE
      const updatedAction = await tx.mailAction.update({
        where: { id },
        data: { status: ActionStatus.DONE, completedAt: new Date() },
      });

      // Mail güncelle
      await tx.mail.update({
        where: { id: action.mailId },
        data: {
          isForwarded: true,
          currentStatus: 'FORWARDED' as any,
          trackingNumber: body.trackingCode ?? undefined,
        },
      });

      return { action: updatedAction, forwarding };
    });
  }

  async cancelForward(id: string, dto: CancelForwardDto) {
    const action = await this.prisma.mailAction.findUnique({ where: { id } });
    if (!action) throw new NotFoundException('Action not found');
    if (action.type !== MailActionType.FORWARD) {
      throw new BadRequestException('Not a FORWARD action');
    }

    const forwardingRequestId = (action.meta as any)?.forwardingRequestId as string | undefined;
    if (!forwardingRequestId) {
      throw new BadRequestException('Missing forwardingRequestId in action.meta');
    }

    return await this.prisma.$transaction(async (tx) => {
      const forwarding = await tx.forwardingRequest.update({
        where: { id: forwardingRequestId },
        data: {
          status: 'CANCELLED' as any,
          cancelledAt: new Date(),
        },
      });

      const updatedAction = await tx.mailAction.update({
        where: { id },
        data: {
          status: ActionStatus.FAILED,
          meta: { ...(action.meta as any), cancelReason: dto.reason },
        },
      });

      // Mail’i stok durumuna çekmek isteyebilirsiniz
      await tx.mail.update({
        where: { id: action.mailId },
        data: { currentStatus: 'IN_WAREHOUSE' as any },
      });

      return { action: updatedAction, forwarding };
    });
  }

  private calculateVolumetricWeight(box:any, divisor = 5000): number {
    // 5000 is the divisor for cm^3 to kg conversion
    if (!box || !box.length || !box.width || !box.height) {
      throw new Error('Invalid box dimensions provided');
    }
    return (box.length * box.width * box.height) / divisor;
  }

}


