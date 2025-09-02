import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Ticket, TicketStatus } from '@prisma/client';
import { CreateTicketDto, EditTicketStatusDto, FirstTicketMessageDto, TicketMessageDto } from 'src/dtos/support.dto';
import { PrismaService } from 'src/prisma.service';
import { EmailService } from '../email/email.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from 'src/common/enums/event.enum';
import { ContextDto } from 'src/dtos/user.dto';

@Injectable()
export class SupportService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getAllTickets(): Promise<Ticket[]> {
    return this.prismaService.ticket.findMany({
      include: {
        user:{select:{
                    id:true,
                    firstName:true,
                    lastName:true,
                    telephone:true,
                    email:true,
                    profileImage:true,
                }} ,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserTickets(userId: string): Promise<Ticket[]> {
    return await this.prismaService.ticket.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }, // isteğe bağlı sıralama
    });
  }

  async editTicketStatus(
    userId: string,
    ticketId: string,
    status: EditTicketStatusDto['status'],
    priority: EditTicketStatusDto['priority']
  ): Promise<Ticket> {
    // Bilet Bulunamıyorsa Hata Fırlat
    const ticket = await this.prismaService.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
    }

    // Kullanıcı ve Rolleri Al
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Yetki Kontrolü
    const isAdmin = user.roles.some((role) => role.role === 'ADMIN' || role.role ==="STAFF" || role.role ==="SUPERADMIN");
    const isOwner = ticket.userId === userId;

    if (!isAdmin && !isOwner) {
      throw new HttpException(
        'You do not have permission to update this ticket',
        HttpStatus.FORBIDDEN,
      );
    }

    // Bilet Durumu Kontrolü
    if (!isAdmin && ticket.status === 'CLOSED') {
      throw new HttpException(
        'Cannot edit a ticket that is already closed',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Geçersiz Durum Kontrolü
    if (!Object.values(TicketStatus).includes(status)) {
      throw new HttpException(
        'Invalid ticket status',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Bileti Güncelle
    const editedticket = await this.prismaService.ticket.update({
      where: { id: ticketId },
      data: { status, priority: priority },
    });

    if (editedticket.status === TicketStatus.RESOLVED) {
      const ticketUser = await this.prismaService.user.findUnique({ where: { id: editedticket.userId } });
      
      // Event emitter ile mail gönderme
      this.eventEmitter.emit(Events.TICKET_RESOLVED, {
        email: ticketUser.email,
        fullName: `${ticketUser.firstName} ${ticketUser.lastName}`,
        ticket_subject: ticket.subject,
        ticket_number: `${ticket.ticketNo}`
      });
    }
    return editedticket;
  }

  async createTicket(userId: string, context:ContextDto, data: CreateTicketDto): Promise<Ticket> {
  const { message, ...ticketData } = data;
  const mailbox = await this.prismaService.mailbox.findUnique({
    where:{id:context.mailboxId},
    include:{officeLocation:true}
  })
    const ticket = await this.prismaService.ticket.create({
      data: {
        ...ticketData,
        workspaceId: context.workspaceId,
        officeLocationId: mailbox.officeLocationId,
        messages: {
          create: {
            message: message.message,
            userId,
            fromStaff: false,
            attachments: message.attachments ? { create: message.attachments.map(att => ({
              ...att,
              uploadedBy: { connect: { id: userId } },
            })) } : undefined,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
        mailbox: context.mailboxId
          ? {
              connect: {
                id: context.mailboxId,
              },
            }
          : undefined,
      },
    });
    return ticket;
  }

  async getTicketById(ticketId: string) {
    const ticket = await this.prismaService.ticket.findUnique({
      where: { id: ticketId },
      include: {
        messages: {
          include: {
            user:{select:{
                    id:true,
                    firstName:true,
                    lastName:true,
                    telephone:true,
                    email:true,
                    profileImage:true,
                }},
            attachments: true,
          },
          orderBy: { createdAt: 'asc' },
        },
       user:{select:{
                    id:true,
                    firstName:true,
                    lastName:true,
                    telephone:true,
                    email:true,
                    profileImage:true,
                }},
        mailbox: true,
      },
    });
    if (!ticket) {
      throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
    }
    console.log('ticket',ticket)
    return {
            ...ticket,
            messages: await this.formatMessages(ticket.messages),
        };
  }

  async addMessageFromStaff(
    userId: string,
    ticketMessage: TicketMessageDto,
  ): Promise<Ticket> {
        // Ticket'ı bul
    const ticket = await this.prismaService.ticket.findUnique({
      where: { id: ticketMessage.ticketId },
    });

    if (!ticket) {
      throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
    }

    // Kullanıcı ve Rolleri Al
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Yetki Kontrolü
    const isAuthorized = user.roles.some((role) => role.role === 'ADMIN'|| role.role === 'STAFF');

    if (!isAuthorized) {
      throw new HttpException(
        'You do not have permission to add a message as staff',
        HttpStatus.FORBIDDEN,
      );
    }



    // Attachments varsa, bunları işlemden geçirelim:
    let attachmentsData = undefined;
    if (ticketMessage.attachments) {
      // Eğer attachments tek bir obje ise, array'e çeviriyoruz
      const attachmentsArray = Array.isArray(ticketMessage.attachments)
        ? ticketMessage.attachments
        : [ticketMessage.attachments];
      
      // Her attachment için, "uploadedBy" alanını ekliyoruz.
      attachmentsData = attachmentsArray.map((att) => ({
        ...att,
        uploadedBy: { connect: { id: userId } },
      }));
    }

    // Ticket güncelleme: Yeni mesajı ekle (staff olarak işaretle)
    return this.prismaService.ticket.update({
      where: { id: ticketMessage.ticketId },
      data: {
        messages: {
          create: {
            message: ticketMessage.message,
            userId,
            fromStaff: true, // Staff tarafından gönderildiği için true
            attachments: attachmentsData ? { create: attachmentsData } : undefined,
          },
        },
      },
    });
  }

  async addMessage(
    userId: string,
    ticketMessage: TicketMessageDto,
  ): Promise<Ticket> {
    // Ticket'ı bul
    const ticket = await this.prismaService.ticket.findUnique({
      where: { id: ticketMessage.ticketId },
      include: { user: true },
    });
  
    if (!ticket) {
      throw new Error('Ticket not found');
    }
  
    // Sadece ticket sahibi mesaj ekleyebilsin
    if (ticket.userId !== userId) {
      throw new Error('You are not allowed to add a message to this ticket');
    }
  
    // Attachments varsa, bunları işlemden geçirelim:
    let attachmentsData = undefined;
    if (ticketMessage.attachments) {
      // Eğer attachments tek bir obje ise, array'e çeviriyoruz
      const attachmentsArray = Array.isArray(ticketMessage.attachments)
        ? ticketMessage.attachments
        : [ticketMessage.attachments];
      
      // Her attachment için, "uploadedBy" alanını ekliyoruz.
      attachmentsData = attachmentsArray.map((att) => ({
        ...att,
        uploadedBy: { connect: { id: userId } },
      }));
    }
  
    // Ticket güncelleme: Yeni mesajı ekle
    return this.prismaService.ticket.update({
      where: { id: ticketMessage.ticketId },
      data: {
        messages: {
          create: {
            message: ticketMessage.message,
            userId,
            fromStaff: false,
            attachments: attachmentsData ? { create: attachmentsData } : undefined,
          },
        },
      },
    });
  }

  async getTicketsByOfficeLocation(officeLocationId: string) {
    return this.prismaService.ticket.findMany({
      where: { mailbox: { officeLocationId } },
      include: { user:{omit: {password: true}}, mailbox: {include:{plan:true,planPrice:true}},},
      orderBy: { createdAt: 'desc' },
    });
  }


  async getTicketMessages(ticketId: string) {
    return this.prismaService.ticketMessage.findMany({
      where: { ticketId },
      include: {
        user: {omit: {password: true}},
        attachments: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async formatMessages(messages: any[]) {
        return messages.map(message => {
            return {
                message: message.message,
                fromStaff: message.fromStaff,
                createdAt: message.createdAt,
                user: message.user,
                attachments: message.attachments?.map(a => ({
                    name: a.name,
                    url: a.url,
                    type: a.type,
                })),
            }
        });
    }
}
