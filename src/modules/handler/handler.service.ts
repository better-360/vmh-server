import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {  MailActionType, Prisma, RoleType, TaskStatus } from '@prisma/client';
import { ListActionRequestsQueryDto } from 'src/dtos/handler.dto';
import { isValidUUID } from 'src/utils/validate';



@Injectable()
export class HandlerService {
    private readonly RECENT_LIMIT = 5;

  constructor(private prisma: PrismaService) {
  }

  async assignUserToOfficeLocation(userId: string, officeLocationId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const location = await this.prisma.officeLocation.findUnique({
      where: { id: officeLocationId },
    });
    if (!location) throw new NotFoundException('Office location not found');

    // Ensure user has STAFF or ADMIN role to handle mails
    const hasHandlerRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        role: { in: [RoleType.STAFF, RoleType.ADMIN, RoleType.SUPERADMIN] },
      },
    });
    if (!hasHandlerRole)
      throw new BadRequestException('User is not STAFF/ADMIN');

    // Upsert unique per user
    const assignment = await this.prisma.mailHandlerAssignment.upsert({
      where: { userId },
      update: { officeLocationId, isActive: true },
      create: { userId, officeLocationId },
      include: { officeLocation: true, user: true },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { assignedLocationId: officeLocationId },
    });
    return assignment;
  }

  async revokeUserFromOfficeLocation(userId: string) {
    const existing = await this.prisma.mailHandlerAssignment.findUnique({
      where: { userId },
    });
    if (!existing) throw new NotFoundException('Assignment not found');
    await this.prisma.mailHandlerAssignment.delete({ where: { userId } });
    return { success: true };
  }

  async listHandlersByOfficeLocation(officeLocationId: string) {
    const location = await this.prisma.officeLocation.findUnique({
      where: { id: officeLocationId },
    });
    if (!location) throw new NotFoundException('Office location not found');
    return this.prisma.mailHandlerAssignment.findMany({
      where: { officeLocationId, isActive: true },
      include: { user: true },
    });
  }

  async getAssignmentByUser(userId: string) {
    const assignment = await this.prisma.mailHandlerAssignment.findUnique({
      where: { userId },
      include: { officeLocation: true },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return assignment;
  }

  async setAssignmentActive(userId: string, isActive: boolean) {
    const assignment = await this.prisma.mailHandlerAssignment.findUnique({
      where: { userId },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return this.prisma.mailHandlerAssignment.update({
      where: { userId },
      data: { isActive },
    });
  }

  // service
async getCustomers(officeLocationId: string) {
  return this.prisma.mailbox.findMany({
    where: {
      isActive: true,
      officeLocationId,
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      steNumber: true,
      status: true,
      billingCycle: true,
      startDate: true,
      // (isteğe bağlı) stripeSubscriptionId: true,
      plan: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      planPrice: {
        select: {
          id: true,
          amount: true,
          currency: true,
          description: true,
        },
      },
      officeLocation: {
        select: {
          id: true,
          label: true,
          city: true,
          state: true,
          zipCode: true,
        },
      },
      // UI’de alıcı sayısını göstermek için count yeterli,
      // ancak liste de istenirse minimal alanları seçiyoruz.
      _count: {
        select: { recipients: true },
      },
      recipients: {
        select: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          isDefault: true,
          isConfirmed: true,
          isActive: true,
        },
      },
      workspace: {
        select: {
          id: true,
          name: true,
          members: {
            select: {
              role: true,
              isDefault: true,
              joinedAt: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  telephone: true,
                  profileImage: true,
                  notifications: true,
                  emailConfirmed: true,
                  stripeCustomerId: true,
                  lastLogin: true,
                  isActive: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

async getCustomerDetails(mailboxId:string) {
  // 1) mailbox + özet bilgiler (tek sorgu)
  const mailbox = await this.prisma.mailbox.findUnique({
    where: { id: mailboxId },
    select: {
      id: true,
      steNumber: true,
      status: true,
      billingCycle: true,
      startDate: true,
      endDate: true,
      workspaceId: true,
      officeLocation: { select: { id: true, label: true, city: true, state: true, zipCode: true } },
      plan: { select: { id: true, name: true, slug: true } },
      planPrice: { select: { id: true, amount: true, currency: true, description: true } },
      _count: {
        select: {
          mails: true,
          tickets: true,
          recipients: true,
        },
      },
    },
  });

  if (!mailbox) {
    throw new NotFoundException('Mailbox not found');
  }

  // 2) paralel istekler
  const [mails, tickets, members, actions] = await this.prisma.$transaction([
    // 2a) mails (son aksiyonla birlikte)
    this.prisma.mail.findMany({
      where: { mailboxId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        receivedAt: true,
        type: true,
        status: true,
        isScanned: true,
        isForwarded: true,
        isShereded: true,
        trackingNumber: true,
        trackingUrl: true,
        senderName: true,
        carrier: true,
        photoUrls: true,
        width: true,
        height: true,
        length: true,
        weight: true,
        actions: {
          take: 1,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            type: true,
            status: true,
            requestedAt: true,
            completedAt: true,
            updatedAt: true,
          },
        },
      },
    }),

    // 2b) tickets (son 2 mesaj ile)
    this.prisma.ticket.findMany({
      where: { mailboxId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        subject: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        messages: {
          take: 2,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            createdAt: true,
            message:true,
            attachments:true,
            user:{select:{
              id:true,
              firstName:true,
              lastName:true,
              email:true,
            }}
          },
        },
      },
    }),

    // 2c) workspace members (Owner önce)
    this.prisma.workspaceMember.findMany({
      where: { workspaceId: mailbox.workspaceId },
      select: {
        role: true,
        isDefault: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            telephone: true,
            isActive: true,
            emailConfirmed: true,
            notifications: true,
            stripeCustomerId: true,
            lastLogin: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // Prisma enum sıralaması için OWNER < ADMIN < MEMBER beklenir
        { isDefault: 'desc' },
      ],
    }),

    // 2d) aksiyon istekleri (mail bazından bağımsız, en güncelden)
    this.prisma.mailAction.findMany({
      where: { mail: { mailboxId } },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        type: true,
        status: true,
        requestedAt: true,
        completedAt: true,
        updatedAt: true,
        meta: true,
        mailId: true,
      },
    }),
  ]);

  // 3) UI-friendly shape (tek yerde topla)
  const result = {
    mailbox: {
      id: mailbox.id,
      steNumber: mailbox.steNumber,
      status: mailbox.status,
      billingCycle: mailbox.billingCycle,
      startedAt: mailbox.startDate,
      endedAt: mailbox.endDate,
      locationLabel: mailbox.officeLocation?.label,
      location: mailbox.officeLocation,
      plan: mailbox.plan,
      planPrice: mailbox.planPrice,
      counters: {
        mails: mailbox._count.mails,
        tickets: mailbox._count.tickets,
        recipients: mailbox._count.recipients,
      },
    },

    mails: mails.map((m) => ({
      id: m.id,
      receivedAt: m.receivedAt,
      type: m.type,
      status: m.status,
      isScanned: m.isScanned,
      isForwarded: m.isForwarded,
      isShereded: m.isShereded,
      trackingNumber: m.trackingNumber,
      trackingUrl: m.trackingUrl,
      senderName: m.senderName,
      carrier: m.carrier,
      photoUrls: m.photoUrls,
      dims: { w: m.width, h: m.height, l: m.length, kg: m.weight },
      lastAction: m.actions?.[0] || null,
    })),

    tickets: tickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      user: {
        id: t.user?.id,
        name: [t.user?.firstName, t.user?.lastName].filter(Boolean).join(' ') || undefined,
        email: t.user?.email,
        profileImage: t.user?.profileImage ?? undefined,
      },
      lastMessages: t.messages, // son 2
    })),

    members: members.map((wm) => ({
      role: wm.role,
      isDefault: wm.isDefault,
      joinedAt: wm.joinedAt,
      user: {
        id: wm.user.id,
        name: [wm.user.firstName, wm.user.lastName].filter(Boolean).join(' ') || undefined,
        email: wm.user.email,
        profileImage: wm.user.profileImage ?? undefined,
        telephone: wm.user.telephone ?? undefined,
        isActive: wm.user.isActive,
        emailConfirmed: wm.user.emailConfirmed,
        notifications: wm.user.notifications,
        stripeCustomerId: wm.user.stripeCustomerId ?? undefined,
        lastLogin: wm.user.lastLogin ?? undefined,
      },
    })),

    // Aksiyonlar: “Timeline” veya “inbox” görünümü için
    actionRequests: actions,
  };

  return result;
}


async listActionRequestsByType(officeLocationId:string,input: ListActionRequestsQueryDto) {
  const {
    type,
    status,
  } = input;

  // ortak where (officeLocation üzerinden join)
  const baseWhere: any = {
    mail: { mailbox: { officeLocationId } },
  };
  if (status) baseWhere.status = status;

  // === MODE A: Tek tip + sayfalama
  if (type) {
    const where = { ...baseWhere, type };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.mailAction.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          type: true,
          status: true,
          requestedAt: true,
          completedAt: true,
          updatedAt: true,
          meta: true,
          mailId: true,
          mail: {
            select: {
              id: true,
              receivedAt: true,
              type: true,
              status: true,
              isScanned: true,
              isForwarded: true,
              isShereded: true,
              senderName: true,
              trackingNumber: true,
              mailbox: { select: { id: true, steNumber: true } },
            },
          },
        },
      }),
      this.prisma.mailAction.count({ where }),
    ]);
    return {
      mode: 'single',
      type,
      total,
      items,
    };
  }

  // === MODE B: Tüm tipler ayrı ayrı (grouped)
  // toplamlar (her tipe kaç adet düştüğü)
  const grouped = await this.prisma.mailAction.groupBy({
    by: ['type'],
    _count: { _all: true },
    where: baseWhere,
  });

  const totals: Record<string, number> = {};
  for (const g of grouped) totals[g.type] = g._count._all;

  // tüm enum tiplerini sırala; olmayanlara 0 koy
  const allTypes: MailActionType[] = Object.values(MailActionType);

  // her tip için son N kaydı paralel çek
  const queries = allTypes.map((t) =>
    this.prisma.mailAction.findMany({
      where: { ...baseWhere, type: t },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        type: true,
        status: true,
        requestedAt: true,
        completedAt: true,
        updatedAt: true,
        meta: true,
        mailId: true,
        mail: {
          select: {
            id: true,
            receivedAt: true,
            type: true,
            status: true,
            senderName: true,
            trackingNumber: true,
            photoUrls:true,
            carrier:true,
            senderAddress:true,
            mailbox: { select: { id: true, steNumber: true } },
          },
        },
      },
    }),
  );

  const lists = await this.prisma.$transaction(queries);

  const groups = allTypes.map((t, i) => ({
    type: t,
    total: totals[t] || 0,
    items: lists[i],
  }));

  return {
    mode: 'grouped',
    officeLocationId,
    totals,
    groups,
  };
}

async getActionRequestDetails(requestId:string){
return await this.prisma.mailAction.findUnique({
  where:{id:requestId},
  include:{
    mail:{
    include:{recipient:true}
    }
  }
 })
}

async getdashboardStats(officeLocationId:string){
  if(!officeLocationId) throw new BadRequestException('Office location id is required');
  if(!isValidUUID(officeLocationId)) throw new BadRequestException('Invalid office location id');
  const [recentTickets, ticketsGrouped, recentRequests, pendingRequestsGrouped, tasksGrouped] = await this.prisma.$transaction([
    this.prisma.ticket.findMany({
      where: { officeLocationId },
      include: {
        user: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            message: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              }
            },
            attachments: {
              select: { id: true, name: true, url: true }
            }
          }
        },
        _count: { select: { messages: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),

    (this.prisma.ticket as any).groupBy({
      by: ['status'],
      _count: { _all: true },
      where: { officeLocationId } as any,
    }),

    this.prisma.forwardingRequest.findMany({
      where: { officeLocationId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        mail: {
          select: {
            id: true,
            mailboxId: true,
            trackingNumber: true,
            type: true,
            status: true,
            createdAt: true,
          }
        },
        deliveryAddress: true,
        deliverySpeedOption: true,
        packagingTypeOption: true,
        carrier: true,
      }
    }),

    (this.prisma.forwardingRequest as any).groupBy({
      by: ['priority'],
      _count: { _all: true },
      where: {
        officeLocationId,
        status: { in: ['PENDING', 'IN_PROGRESS'] as any },
      } as any,
    }),

    (this.prisma.task as any).groupBy({
      by: ['status'],
      _count: { _all: true },
      where: { officeLocationId } as any,
    }),
  ]);

  const ticketsByStatus: Record<string, number> = {};
  for (const g of ticketsGrouped) ticketsByStatus[g.status] = g._count._all;

  const pendingRequestsByPriority: Record<string, number> = {};
  for (const g of pendingRequestsGrouped) pendingRequestsByPriority[g.priority] = g._count._all;

  const tasksByStatus: Record<string, number> = {};
  for (const g of tasksGrouped) tasksByStatus[g.status] = g._count._all;

  return {
    recentTickets,
    ticketsByStatus,
    recentRequests,
    pendingRequestsByPriority,
    tasksByStatus,
  };
}

async dashboardStats(officeLocationId: string) {
  if (!officeLocationId) throw new BadRequestException('Office location id is required');
  if (!isValidUUID(officeLocationId)) throw new BadRequestException('Invalid office location id');

  const RECENT_LIMIT = 5;

  const [
    recentTickets,
    ticketsGrouped,
    tasksGrouped,
    forwardingRecent,
    mailActionsRecent,
    frPendingGrouped,
    maPendingGrouped,
  ] = await this.prisma.$transaction([
    this.prisma.ticket.findMany({
      where: { officeLocationId },
      orderBy: { createdAt: 'desc' },
      take: RECENT_LIMIT,
      select: {
        id: true,
        subject: true,
        priority: true,
        status: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true, profileImage: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, createdAt: true },
        },
        _count: { select: { messages: true } },
      },
    }),

    (this.prisma.ticket as any).groupBy({
      by: ['status'],
      _count: { _all: true },
      where: { officeLocationId } as any,
    }),

    (this.prisma.task as any).groupBy({
      by: ['status'],
      _count: { _all: true },
      where: { officeLocationId } as any,
    }),

    this.prisma.forwardingRequest.findMany({
      where: { officeLocationId },
      orderBy: { updatedAt: 'desc' },
      take: RECENT_LIMIT,
      select: {
        id: true,
        status: true,
        priority: true,
        updatedAt: true,
        mail: { select: { recipient: { select: { name: true, lastName: true } } } },
      },
    }),

    this.prisma.mailAction.findMany({
      where: { mail: { mailbox: { officeLocationId } } },
      orderBy: { updatedAt: 'desc' },
      take: RECENT_LIMIT,
      select: {
        id: true,
        type: true,
        status: true,
        priority: true,
        updatedAt: true,
        requestedAt: true,
        meta: true,
        mail: { select: { recipient: { select: { name: true, lastName: true } } } },
      },
    }),

    (this.prisma.forwardingRequest as any).groupBy({
      by: ['priority'],
      _count: { _all: true },
      where: {
        officeLocationId,
        status: { in: ['PENDING', 'IN_PROGRESS'] as any },
      } as any,
    }),

    (this.prisma.mailAction as any).groupBy({
      by: ['priority'],
      _count: { _all: true },
      where: {
        mail: { mailbox: { officeLocationId } },
        status: { in: ['PENDING', 'IN_PROGRESS'] as any },
      } as any,
    }),
  ]);

  const ticketsByStatus: Record<string, number> = {};
  for (const g of ticketsGrouped) ticketsByStatus[g.status] = g._count._all;

  const tasksByStatus: Record<string, number> = {};
  for (const g of tasksGrouped) tasksByStatus[g.status] = g._count._all;

  const pendingRequestsByPriority: Record<string, number> = {};
  [...frPendingGrouped, ...maPendingGrouped].forEach((g) => {
    if (g.priority) {
      pendingRequestsByPriority[g.priority] =
        (pendingRequestsByPriority[g.priority] ?? 0) + g._count._all;
    }
  });

  const forwardItems = forwardingRecent.map((x) => ({
    id: x.id,
    type: 'FORWARD' as const,
    status: x.status,
    priority: x.priority,
    updatedAt: x.updatedAt.toISOString(),
    userName: [x.mail?.recipient?.name, x.mail?.recipient?.lastName].filter(Boolean).join(' ') || null,
    meta: null,
  }));

  const actionItems = mailActionsRecent
    .filter((x) => x.type !== 'CHECK_DEPOSIT')
    .map((x) => ({
      id: x.id,
      type: x.type,
      status: x.status,
      priority: x.priority,
      updatedAt: (x.updatedAt ?? x.requestedAt)?.toISOString(),
      userName: [x.mail?.recipient?.name, x.mail?.recipient?.lastName].filter(Boolean).join(' ') || null,
      meta: x.meta,
    }));

  const recentRequests = [...forwardItems, ...actionItems]
    .filter((r) => !!r.updatedAt)
    .sort((a, b) => (a.updatedAt! > b.updatedAt! ? -1 : 1))
    .slice(0, RECENT_LIMIT);

  const mappedTickets = recentTickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    priority: t.priority,
    status: t.status,
    createdAt: t.createdAt,
    user: t.user,
    lastMessage: t.messages[0] ?? null,
    messagesCount: t._count.messages,
  }));

  return {
    recentTickets: mappedTickets,
    ticketsByStatus,
    recentRequests,
    pendingRequestsByPriority,
    tasksByStatus,
  };
}

}