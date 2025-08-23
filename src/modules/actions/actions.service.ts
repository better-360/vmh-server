import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ActionStatus, MailActionType, MailStatus, Prisma } from '@prisma/client';
import { UpdateActionStatusDto,CreateMailActionDto,CompleteForwardDto, CancelForwardDto,QueryMailActionsDto, ForwarMeta, CreateMailActionRequestDto } from 'src/dtos/mail-actions.dto';
import { PrismaService } from 'src/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from 'src/common/enums/event.enum';

@Injectable()
export class MailActionsService {
  constructor(private readonly prisma: PrismaService, private readonly eventEmitter: EventEmitter2) {}

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
              mailboxId: true,
              trackingNumber: true,
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

async createActionRequest(dto: CreateMailActionRequestDto, userId: string, ability: any){
  const mail = await this.prisma.mail.findUnique({ 
    where: { id: dto.mailId },
    include: { mailbox: { include: { workspace: { include: { members: true } } } } }
  });
  if (!mail) throw new NotFoundException('Mail not found');

  const isAdmin = ability.can('manage', 'all') || ability.can('manage', 'MailEntity');
  if (!isAdmin) {
    // User'ın bu mailbox'ın workspace'inde üye olup olmadığını kontrol et
    const isMember = mail.mailbox.workspace.members.some(member => member.userId === userId);
    if (!isMember) {
      throw new BadRequestException('You are not allowed to create action for this mail');
    }
  }

  const { action } = await this.prisma.$transaction(async (tx) => {
    // 1) Any active action (PENDING or IN_PROGRESS) for this mail blocks new requests
    const active = await tx.mailAction.findFirst({
      where: {
        mailId: dto.mailId,
        status: { in: [ActionStatus.PENDING, ActionStatus.IN_PROGRESS] },
      },
      select: { id: true, type: true, status: true },
    });

    if (active) {
      throw new BadRequestException(
        `There is already an active action (type: ${active.type}) for this mail. Please wait until it is completed.`,
      );
    }

    // 2) Defensive: if another request of the same type slipped in concurrently
    const sameTypeActive = await tx.mailAction.findFirst({
      where: {
        mailId: dto.mailId,
        type: dto.type,
        status: { in: [ActionStatus.PENDING, ActionStatus.IN_PROGRESS] },
      },
      select: { id: true },
    });

    if (sameTypeActive) {
      throw new BadRequestException(
        `There is already an active ${dto.type} action for this mail.`,
      );
    }

    // 3) Create the action
    const created = await tx.mailAction.create({
      data: {
        mailId: dto.mailId,
        type: dto.type,
        status: ActionStatus.PENDING,
      },
    });

    return { action: created };
  });

  this.eventEmitter.emit(Events.MAIL_ACTION_CREATED, { mail, type: dto.type, action });
  return { action };
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
    if (dto.markJunk) patch.status = MailStatus.FORWARDED;
    if (dto.markHold) patch.status = 'HOLD' as any;
    if (dto.markScanned) patch.status = 'SCANNED' as any;

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
          status: 'FORWARDED',
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
        data: { status: 'IN_WAREHOUSE' as any },
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
