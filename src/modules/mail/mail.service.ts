import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { 
  CreateMailDto, 
  UpdateMailDto, 
  MailResponseDto,
  PackageStatus as MailDtoPackageStatus
} from 'src/dtos/mail.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(private prisma: PrismaService) {}

  // Helper method to map Prisma PackageStatus to DTO PackageStatus
  private mapPackageStatus(prismaStatus: any): MailDtoPackageStatus {
    return prismaStatus as MailDtoPackageStatus;
  }

  // Helper method to map Prisma mail data to DTO
  private mapMailToDto(mail: any): MailResponseDto {
    return {
      ...mail,
      currentStatus: this.mapPackageStatus(mail.currentStatus),
      status: this.mapPackageStatus(mail.status),
    } as MailResponseDto;
  }

  async create(createMailDto: CreateMailDto): Promise<MailResponseDto> {
    try {
      const existingMail = await this.prisma.mail.findFirst({
        where: { steNumber: createMailDto.steNumber },
      });

      if (existingMail) {
        throw new BadRequestException(`Mail with STE number ${createMailDto.steNumber} already exists`);
      }

      const mail = await this.prisma.mail.create({
        data: {
          steNumber: createMailDto.steNumber,
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
            connect: { id: createMailDto.subscriptionId }
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

      return this.mapMailToDto(mail);
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

  async findAll(filters: any = {}): Promise<MailResponseDto[]> {
    const where: Prisma.MailWhereInput = {};
    
    if (filters.subscriptionId) where.subscriptionId = filters.subscriptionId;
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.steNumber) {
      where.steNumber = {
        contains: filters.steNumber,
        mode: 'insensitive',
      };
    }

    const mails = await this.prisma.mail.findMany({
      where,
      include: {
        mailbox: {
          include: {
            workspace: true,
            officeLocation: true,
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
      orderBy: { receivedAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    });

    return mails.map(mail => this.mapMailToDto(mail));
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

    return this.mapMailToDto(mail);
  }

  async update(id: string, updateMailDto: UpdateMailDto): Promise<MailResponseDto> {
    try {
      const mail = await this.prisma.mail.update({
        where: { id },
        data: {
          ...(updateMailDto.steNumber && { steNumber: updateMailDto.steNumber }),
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
          ...(updateMailDto.subscriptionId && { 
            mailbox: { connect: { id: updateMailDto.subscriptionId } }
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

      return this.mapMailToDto(mail);
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