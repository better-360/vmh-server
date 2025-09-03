import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ActionStatus, MailStatus, MailType, Prisma } from '@prisma/client';
import { UpdateActionStatusDto,QueryMailActionsDto, CreateMailActionRequestDto } from 'src/dtos/mail-actions.dto';
import { PrismaService } from 'src/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from 'src/common/enums/event.enum';
import { ConsolidateMailItemsDto, CreateConsolidationRequestDto } from 'src/dtos/mail.dto';

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
        officeLocationId:mail.mailbox.officeLocationId,
        status: ActionStatus.IN_PROGRESS,
      },
    });
     await this.prisma.mail.update({
      where:{id:mail.id},
      data:{
        status:MailStatus.IN_PROCESS
      }
    })
  
    return { action: created };
  });

  this.eventEmitter.emit(Events.MAIL_ACTION_CREATED, { mail, type: dto.type, action });
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


  private calculateVolumetricWeight(box:any, divisor = 5000): number {
    // 5000 is the divisor for cm^3 to kg conversion
    if (!box || !box.length || !box.width || !box.height) {
      throw new Error('Invalid box dimensions provided');
    }
    return (box.length * box.width * box.height) / divisor;
  }

  // Helper method to get consolidation requests
  async getConsolidationRequests(officeLocationId?: string, status?: ActionStatus) {
    const where: any = {};
    if (officeLocationId) {
      where.officeLocationId = officeLocationId;
    }
    if (status) {
      where.status = status;
    }

    return await this.prisma.consolidationAction.findMany({
      where,
      include: {
        mails: true,
        createdPackageMail: true,
      },
      orderBy: {
        requestedAt: 'desc'
      }
    });
  }

  // Helper method to get consolidation request by ID
  async getConsolidationRequestById(id: string) {
    const request = await this.prisma.consolidationAction.findUnique({
      where: { id },
      include: {
        mails: {
          include: {
            mailbox: {
              include: {
                workspace: true
              }
            }
          }
        },
        createdPackageMail: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Consolidation request not found');
    }

    return request;
  }

  // Helper method to cancel consolidation request
  async cancelConsolidationRequest(requestId: string, reason?: string) {
    const request = await this.getConsolidationRequestById(requestId);

    if (request.status === ActionStatus.DONE) {
      throw new BadRequestException('Cannot cancel completed consolidation request');
    }

    return await this.prisma.$transaction(async (tx) => {
      // Update consolidation request status
      const updatedRequest = await tx.consolidationAction.update({
        where: { id: requestId },
        data: {
          status: ActionStatus.FAILED,
          completedAt: new Date(),
        },
        include: {
          mails: true,
        },
      });

      // Reset mail statuses back to their original state
      await tx.mail.updateMany({
        where: { id: { in: request.mails.map(m => m.id) } },
        data: {
          status: MailStatus.PENDING, // or whatever the appropriate status should be
        },
      });

      // Emit cancellation event
      this.eventEmitter.emit(Events.MAIL_CONSOLIDATION_CANCELLED, {
        consolidationRequest: updatedRequest,
        reason,
        mails: request.mails,
      });

      return updatedRequest;
    });
  }

  // Helper method to validate consolidation eligibility
  private async validateConsolidationEligibility(mailIds: string[]) {
    const mails = await this.prisma.mail.findMany({
      where: { 
        id: { in: mailIds },
        parentMailId: null // Only top-level mails can be consolidated
      },
      include: {
        actions: {
          where: {
            status: { in: [ActionStatus.PENDING, ActionStatus.IN_PROGRESS] }
          }
        },
        mailbox: true
      }
    });

    // Check if all requested mails exist
    if (mails.length !== mailIds.length) {
      throw new NotFoundException('One or more mails not found or already consolidated');
    }

    // Check for active actions
    const mailsWithActions = mails.filter(mail => mail.actions.length > 0);
    if (mailsWithActions.length > 0) {
      throw new BadRequestException('Some mails have active actions and cannot be consolidated');
    }

    // Check mail types consistency
    const mailTypes = [...new Set(mails.map(mail => mail.type))];
    if (mailTypes.length > 1) {
      throw new BadRequestException('All mails must have the same type for consolidation');
    }

    // Check office location consistency
    const officeLocations = [...new Set(mails.map(mail => mail.mailbox.officeLocationId))];
    if (officeLocations.length > 1) {
      throw new BadRequestException('All mails must be from the same office location');
    }

    return mails;
  }


async createConsolidationRequest(dto: CreateConsolidationRequestDto, userId: string, ability: any) {
  const { mailIds } = dto;

  if (mailIds.length < 2) {
    throw new BadRequestException('At least two mails are required for consolidation');
  }

  // Use helper method for validation
  const mails = await this.validateConsolidationEligibility(mailIds);

  // Validate user permissions
  const isAdmin = ability.can('manage', 'all') || ability.can('manage', 'MailEntity');
  if (!isAdmin) {
    // Get workspace members for permission check
    const mailsWithWorkspace = await this.prisma.mail.findMany({
      where: { id: { in: mailIds } },
      include: { 
        mailbox: { 
          include: { 
            workspace: { include: { members: true } } 
          } 
        }
      }
    });

    for (const mail of mailsWithWorkspace) {
      const isMember = mail.mailbox.workspace.members.some(member => member.userId === userId);
      if (!isMember) {
        throw new BadRequestException('You are not allowed to create consolidation request for these mails');
      }
    }
  }

  // Create consolidation request
  const consolidationRequest = await this.prisma.consolidationAction.create({
    data: {
      officeLocationId: mails[0].mailbox.officeLocationId,
      status: ActionStatus.IN_PROGRESS,
      mails: {
        connect: mailIds.map(id => ({ id }))
      }
    },
    include: {
      mails: {
        include: {
          mailbox: true
        }
      }
    }
  });

  // Update mail statuses to IN_PROCESS
  await this.prisma.mail.updateMany({
    where: { id: { in: mailIds } },
    data: { status: MailStatus.IN_PROCESS }
  });

  // Emit event
  this.eventEmitter.emit(Events.MAIL_CONSOLIDATION_REQUESTED, { 
    consolidationRequest, 
    mails,
    instructions: dto.instructions
  });

  return consolidationRequest;
}


async completeConsolidationRequest(requestId: string, data: ConsolidateMailItemsDto) {
  const request = await this.prisma.consolidationAction.findUnique({
    where: { id: requestId },
    include: { 
      mails: {
        include: {
          mailbox: true
        }
      }
    },
  });
  
  if (!request) throw new NotFoundException('Consolidation request not found');
  if (request.status !== ActionStatus.IN_PROGRESS) {
    throw new BadRequestException('Consolidation request is not in progress');
  }
  if (request.mails.length < 2) {
    throw new BadRequestException('At least two mails are required for consolidation');
  }

  return await this.prisma.$transaction(async (tx) => {
    // Get the first mail's mailbox info for the consolidated package
    const firstMail = request.mails[0];
    
    // Calculate volumeCm3 if dimensions are provided
    let volumeCm3: number | undefined;
    if (data.width && data.height && data.length) {
      volumeCm3 = data.width * data.height * data.length;
    }

    // Create consolidated package mail
    const packageMail = await tx.mail.create({
      data: {
        mailboxId: firstMail.mailboxId,
        receivedAt: new Date(),
        senderName: data.senderName,
        type: MailType.CONSOLIDATED,
        status: MailStatus.CONSOLIDATED,
        width: data.width,
        height: data.height,
        length: data.length,
        weight: data.weight,
        volumeDesi: data.volumeDesi,
        volumeCm3: volumeCm3,
        photoUrls: data.photoUrls || [],
        isScanned: true,
      },
    });

    // Update all original mails to be contained in the new package
    await tx.mail.updateMany({
      where: { id: { in: request.mails.map(m => m.id) } },
      data: {
        parentMailId: packageMail.id,
        status: MailStatus.CONSOLIDATED,
      },
    });

    // Update consolidation request
    const updatedRequest = await tx.consolidationAction.update({
      where: { id: requestId },
      data: {
        status: ActionStatus.DONE,
        completedAt: new Date(),
        createdPackageMailId: packageMail.id,
      },
      include: {
        mails: {
          include: {
            mailbox: true
          }
        },
        createdPackageMail: true,
      },
    });

    // Emit consolidation completed event
    this.eventEmitter.emit(Events.MAIL_CONSOLIDATION_COMPLETED, {
      consolidationRequest: updatedRequest,
      packageMail,
      originalMails: request.mails,
      notes: data.notes,
    });

    return {
      consolidationRequest: updatedRequest,
      packageMail,
    };
  });
}
}
