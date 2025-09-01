import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { 
  CreateMailDto, 
  UpdateMailDto, 
  MailResponseDto,
} from 'src/dtos/mail.dto';
import { Prisma } from '@prisma/client';
import { ContextDto } from 'src/dtos/user.dto';


@Injectable()
export class MailService {
  constructor(private prisma: PrismaService) {}


  async create(createMailDto: CreateMailDto): Promise<MailResponseDto> {
    try {

      const mailbox=await  this.prisma.mailbox.findUnique({
        where: { id: createMailDto.mailboxId },
        include: {
          recipients: true,
        },
      });
      if (!mailbox) {
        throw new BadRequestException('Mailbox not found');
      }

      const recipient=await this.prisma.recipient.findUnique({
        where: { id: createMailDto.recipientId },
      });
      if (!recipient) {
        throw new BadRequestException('Recipient not found');
      }


      const mail = await this.prisma.mail.create({
        data: {
          type: createMailDto.type,
          receivedAt: new Date(createMailDto.receivedAt),
          photoUrls: createMailDto.photoUrls || [],
          senderName: createMailDto.senderName,
          senderAddress: createMailDto.senderAddress,
          carrier: createMailDto.carrier,
          width: createMailDto.width,
          height: createMailDto.height,
          length: createMailDto.length,
          weightKg: createMailDto.weightKg,
          volumeDesi: createMailDto.volumeDesi,
          isShereded: createMailDto.isShereded || false,
          isForwarded: createMailDto.isForwarded || false,
          mailbox: {
            connect: { id: createMailDto.mailboxId }
          },
          recipient: {
            connect: { id: createMailDto.recipientId }
          }
        },
        include: {
          mailbox: {
            include: {
              workspace: true,
              officeLocation: true,
            },
          },
          actions: true,
        },
      });
      return mail;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Mail with this STE number already exists');
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('Invalid mailbox ID provided');
        }
      }
      throw error;
    }
  }

    async findAll(filters: any = {}, userId: string, context: ContextDto, ability?: any): Promise<MailResponseDto[]> {
    const where: Prisma.MailWhereInput = {};

    // Basit authorization kontrolü - CASL kompleksliğini bypass et
    if (ability) {
      // Admin/Staff ise tüm mail'leri görebilir
      const isAdmin = ability.can('manage', 'all') || ability.can('manage', 'MailEntity');
      
      if (!isAdmin) {
        // Customer ise sadece kendi mailbox'ındaki mail'leri görebilir
        if (!context?.mailboxId) {
          throw new BadRequestException('Context mailboxId is required for customers');
        }
        
        console.log(`Customer ${userId} accessing mailbox ${context.mailboxId}`);
        where.mailboxId = context.mailboxId;
      } else {
        console.log(`Admin/Staff ${userId} accessing all mails`);
      }
    } else if (context?.mailboxId) {
      // CASL yoksa fallback - sadece kendi mailbox'ı
      console.log(`Fallback: User ${userId} accessing mailbox ${context.mailboxId}`);
      where.mailboxId = context.mailboxId;
    }

    // Ek filtreler
    if (filters.mailboxId) where.mailboxId = filters.mailboxId;
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;

    const mails = await this.prisma.mail.findMany({
      where,
      include: {
        mailbox: true,
        actions: {
          orderBy: { requestedAt: 'desc' },
        },
        forwardRequests: {
          include: {
            deliveryAddress: true,
            deliverySpeedOption: true,
            packagingTypeOption: true,
            carrier: true,
          },
        },
      },
      orderBy: { receivedAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    });

    return mails;
  }

  async findOne(id: string): Promise<MailResponseDto> {
    const mail = await this.prisma.mail.findUnique({
      where: { id },
      include: {
        mailbox: {
          include: {
            workspace: true,
            officeLocation: true,
            plan: true,
          },
        },
        actions: {
          orderBy: { requestedAt: 'desc' },
        },
        forwardRequests: {
          include: {
            deliveryAddress: true,
            deliverySpeedOption: true,
            packagingTypeOption: true,
            carrier: true,
          },
        },
      },
    });

    if (!mail) {
      throw new NotFoundException(`Mail with ID ${id} not found`);
    }

    return mail;
  }

  async update(id: string, updateMailDto: UpdateMailDto): Promise<MailResponseDto> {
    try {
      const mail = await this.prisma.mail.update({
        where: { id },
        data: {
          ...(updateMailDto.type && { type: updateMailDto.type }),
          ...(updateMailDto.receivedAt && { receivedAt: new Date(updateMailDto.receivedAt) }),
          ...(updateMailDto.senderName !== undefined && { senderName: updateMailDto.senderName }),
          ...(updateMailDto.senderAddress !== undefined && { senderAddress: updateMailDto.senderAddress }),
          ...(updateMailDto.carrier !== undefined && { carrier: updateMailDto.carrier }),
          ...(updateMailDto.width !== undefined && { width: updateMailDto.width }),
          ...(updateMailDto.height !== undefined && { height: updateMailDto.height }),
          ...(updateMailDto.length !== undefined && { length: updateMailDto.length }),
          ...(updateMailDto.weightKg !== undefined && { weightKg: updateMailDto.weightKg }),
          ...(updateMailDto.volumeDesi !== undefined && { volumeDesi: updateMailDto.volumeDesi }),
          ...(updateMailDto.photoUrls !== undefined && { photoUrls: updateMailDto.photoUrls }),
          ...(updateMailDto.isShereded !== undefined && { isShereded: updateMailDto.isShereded }),
          ...(updateMailDto.isForwarded !== undefined && { isForwarded: updateMailDto.isForwarded }),
          ...(updateMailDto.mailboxId && { 
            mailbox: { connect: { id: updateMailDto.mailboxId } }
          }),
        },
        include: {
          mailbox: {
            include: {
              workspace: true,
              officeLocation: true,
            },
          },
          actions: true,
        },
      });

      return mail;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Mail with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.mail.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Mail with ID ${id} not found`);
        }
      }
      throw error;
    }
  }
}