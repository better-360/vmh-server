import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreateMailboxDto,
  UpdateMailboxDto,
  MailboxResponseDto,
} from 'src/dtos/mailbox.dto';
import { PermissionAction, Prisma, FormStatus } from '@prisma/client';
import { ContextDto } from 'src/dtos/user.dto';
import { isMemberOfMailbox } from 'src/utils/validate';
import {
  CreateDeliveryAddressDto,
  DeliveryAddressResponseDto,
  UpdateDeliveryAddressDto,
} from 'src/dtos/delivery-address.dto';

@Injectable()
export class MailboxService {
  constructor(private prisma: PrismaService) {}

  async create(
    createMailboxDto: CreateMailboxDto,
  ): Promise<MailboxResponseDto> {
    try {
      // Check if there's already an active mailbox for this workspace-office combination
      const existingMailbox = await this.prisma.mailbox.findFirst({
        where: {
          workspaceId: createMailboxDto.workspaceId,
          officeLocationId: createMailboxDto.officeLocationId,
          isActive: true,
        },
      });

      if (existingMailbox) {
        throw new BadRequestException(
          'An active mailbox already exists for this workspace and office location',
        );
      }

      const steNumber = await this.generateSteNumber();

      // Office location bilgilerini al (form için gerekli)
      const officeLocation = await this.prisma.officeLocation.findUnique({
        where: { id: createMailboxDto.officeLocationId },
      });

      if (!officeLocation) {
        throw new NotFoundException('Office location not found');
      }

      // Default form oluştur (USPS 1583 form)
      const defaultFormData = this.createDefaultFormData(steNumber, officeLocation);

      const mailbox = await this.prisma.mailbox.create({
        data: {
          ...createMailboxDto,
          startDate: new Date(createMailboxDto.startDate),
          endDate: createMailboxDto.endDate
            ? new Date(createMailboxDto.endDate)
            : null,
          steNumber: steNumber,
          forms: { 
            create: [defaultFormData]
          }
        },
        include: {
          workspace: true,
          officeLocation: true,
          plan: true,
          planPrice: true,
          forms: true, // Forms'ları da include et
        },
      });

      console.log(`✅ Mailbox created successfully: ${mailbox.id}`);
      console.log(`📄 USPS 1583 Form created for STE Number: ${steNumber}`);
      console.log(`📋 Form count: ${mailbox.forms?.length || 0}`);

      return mailbox;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'A mailbox with these details already exists',
          );
        }
      }
      throw error;
    }
  }

  async findAll(
    workspaceId?: string,
    officeLocationId?: string,
    isActive?: boolean,
  ): Promise<MailboxResponseDto[]> {
    const where: Prisma.MailboxWhereInput = {};

    if (workspaceId) where.workspaceId = workspaceId;
    if (officeLocationId) where.officeLocationId = officeLocationId;
    if (isActive !== undefined) where.isActive = isActive;

    return this.prisma.mailbox.findMany({
      where,
      include: {
        workspace: true,
        officeLocation: true,
        plan: true,
        planPrice: true,
        deliveryAddresses: true,
        featureUsages: {
          include: {
            feature: true,
          },
        },
        subscriptionItems: true,
        recipients: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<MailboxResponseDto> {
    const mailbox = await this.prisma.mailbox.findUnique({
      where: { id },
      include: {
        workspace: true,
        officeLocation: true,
        plan: {
          include: {
            features: {
              include: {
                feature: true,
              },
            },
          },
        },
        planPrice: true,
        deliveryAddresses: true,
        featureUsages: {
          include: {
            feature: true,
          },
        },
        subscriptionItems: true,
        recipients: true,
        mails: {
          take: 10,
          orderBy: {
            receivedAt: 'desc',
          },
        },
      },
    });

    if (!mailbox) {
      throw new NotFoundException(`Mailbox with ID ${id} not found`);
    }

    return mailbox;
  }

  async update(
    id: string,
    updateMailboxDto: UpdateMailboxDto,
  ): Promise<MailboxResponseDto> {
    try {
      const mailbox = await this.prisma.mailbox.update({
        where: { id },
        data: {
          ...updateMailboxDto,
          endDate: updateMailboxDto.endDate
            ? new Date(updateMailboxDto.endDate)
            : undefined,
        },
        include: {
          workspace: true,
          officeLocation: true,
          plan: true,
          planPrice: true,
          recipients: true,
        },
      });

      return mailbox;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Mailbox with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.mailbox.update({
        where: { id },
        data: {
          isActive: false,
          // Instead of hard delete, we deactivate
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Mailbox with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async findByWorkspace(workspaceId: string): Promise<MailboxResponseDto[]> {
    return this.findAll(workspaceId);
  }

  async findByOfficeLocation(
    officeLocationId: string,
  ): Promise<MailboxResponseDto[]> {
    return this.findAll(undefined, officeLocationId);
  }

  async getActiveMailboxes(): Promise<MailboxResponseDto[]> {
    return this.findAll(undefined, undefined, true);
  }

  async checkFeatureUsage(mailboxId: string, featureId: string): Promise<any> {
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(1); // Start of current month

    const currentPeriodEnd = new Date(currentPeriodStart);
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    currentPeriodEnd.setDate(0); // End of current month

    const usage = await this.prisma.featureUsage.findFirst({
      where: {
        mailBoxId: mailboxId,
        featureId: featureId,
        periodStart: {
          gte: currentPeriodStart,
        },
        periodEnd: {
          lte: currentPeriodEnd,
        },
      },
      include: {
        feature: true,
        mailbox: {
          include: {
            plan: {
              include: {
                features: {
                  where: {
                    featureId: featureId,
                  },
                },
              },
            },
          },
        },
      },
    });

    return usage;
  }

  async incrementFeatureUsage(
    mailboxId: string,
    featureId: string,
  ): Promise<void> {
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(1);

    const currentPeriodEnd = new Date(currentPeriodStart);
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    currentPeriodEnd.setDate(0);

    await this.prisma.featureUsage.upsert({
      where: {
        mailBoxId_featureId_periodStart: {
          mailBoxId: mailboxId,
          featureId: featureId,
          periodStart: currentPeriodStart,
        },
      },
      update: {
        usedCount: {
          increment: 1,
        },
      },
      create: {
        mailBoxId: mailboxId,
        featureId: featureId,
        periodStart: currentPeriodStart,
        periodEnd: currentPeriodEnd,
        usedCount: 1,
      },
    });
  }

  async generateSteNumber(): Promise<string> {
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Check if this STE number already exists
    const existingMailbox = await this.prisma.mailbox.findUnique({
      where: { steNumber: result },
    });

    if (existingMailbox) {
      // If it exists, generate a new one recursively
      return this.generateSteNumber();
    }

    return result;
  }

  /**
   * Creates default form data for a new mailbox (USPS 1583 form)
   */
  private createDefaultFormData(steNumber: string, officeLocation: any) {
    const agentAddress = `${officeLocation.addressLine}${officeLocation.addressLine2 ? ', ' + officeLocation.addressLine2 : ''}, ${officeLocation.city}, ${officeLocation.state} ${officeLocation.zipCode || ''}, ${officeLocation.country || 'US'}`;
    
    return {
      formName: 'USPS_1583',
      formData: {
        "formType": "USPS_1583",
        "title": "Application for Delivery of Mail Through Agent",
        "description": "USPS Form 1583 - Required for mail forwarding authorization",
        "steNumber": steNumber,
        "fields": {
          "applicantName": {
            "value": "",
            "required": true,
            "label": "Name of Applicant (Person or Company)",
            "placeholder": "Enter full legal name"
          },
          "applicantAddress": {
            "value": "",
            "required": true,
            "label": "Address of Applicant",
            "placeholder": "Street, City, State, ZIP Code"
          },
          "agentName": {
            "value": "Virtual Mail Hub",
            "required": true,
            "label": "Name of Agent (Person or Company)",
            "readonly": true
          },
          "agentAddress": {
            "value": agentAddress,
            "required": true,
            "label": "Address of Agent",
            "readonly": true
          },
          "serviceType": {
            "value": "Mail Forwarding and Package Receiving",
            "required": true,
            "label": "Type of Service Requested",
            "readonly": true
          },
          "effectiveDate": {
            "value": "",
            "required": true,
            "label": "Date Service is to Begin",
            "type": "date"
          },
          "applicantSignature": {
            "value": "",
            "required": true,
            "label": "Signature of Applicant",
            "type": "signature"
          },
          "signatureDate": {
            "value": "",
            "required": true,
            "label": "Date of Signature",
            "type": "date"
          },
          "identificationCopy": {
            "value": false,
            "required": true,
            "label": "Copy of Valid Photo ID Attached",
            "type": "boolean"
          },
          "witnessSignature": {
            "value": "",
            "required": false,
            "label": "Witness Signature (if applicable)",
            "type": "signature"
          }
        },
        "metadata": {
          "createdForMailbox": true,
          "autoGenerated": true,
          "version": "1.0",
          "formUrl": "https://www.usps.com/forms/_pdf/ps1583.pdf",
          "instructions": [
            "Complete all required fields",
            "Attach copy of valid photo identification",
            "Sign and date the form",
            "Submit to Virtual Mail Hub for processing"
          ],
          "legalNotice": "I certify that I am authorized to receive mail for the person(s) or company named above."
        }
      },
      status: FormStatus.PENDING,
      isActive: true,
      isCompleted: false,
      isDeleted: false
    };
  }

  /**
   * Get forms for a specific mailbox
   */
  async getMailboxForms(mailboxId: string) {
    return this.prisma.forms.findMany({
      where: {
        mailboxId: mailboxId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update form completion status
   */
  async updateFormStatus(formId: string, isCompleted: boolean) {
    const form = await this.prisma.forms.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    return this.prisma.forms.update({
      where: { id: formId },
      data: {
        isCompleted,
        status: isCompleted ? FormStatus.COMPLETED : FormStatus.PENDING,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Update form data
   */
  async updateFormData(formId: string, formData: any) {
    const form = await this.prisma.forms.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    return this.prisma.forms.update({
      where: { id: formId },
      data: {
        formData: formData,
        updatedAt: new Date(),
      },
    });
  }

  async findBySteNumber(steNumber: string): Promise<MailboxResponseDto[]> {
    try {
      const mailboxes = await this.prisma.mailbox.findMany({
        where: {
          steNumber: {
            contains: steNumber,
            mode: 'insensitive',
          },
          isActive: true,
        },
        include: {
          workspace: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
          officeLocation: true,
          plan: true,
          planPrice: true,
          recipients: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (mailboxes.length === 0) {
        throw new NotFoundException(
          `No mailboxes found for STE number: ${steNumber}`,
        );
      }

      return mailboxes;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to find mailboxes by STE number: ${error.message}`,
      );
    }
  }

  async getMyMails(userId: string, context: ContextDto) {
    if (!(await isMemberOfMailbox(userId, context.mailboxId, this.prisma))) {
      throw new BadRequestException(
        `User with ID ${userId} is not a member of mailbox with ID ${context.mailboxId}`,
      );
    }
    const mailbox = await this.prisma.mailbox.findUnique({
      where: {
        id: context.mailboxId,
        isActive: true,
        workspaceId: context.workspaceId,
      },
      include: {
        workspace: {
          include: {
            members: true,
          },
        },
      },
    });
    if (!mailbox) {
      throw new NotFoundException(
        `Mailbox with ID ${context.mailboxId} not found`,
      );
    }

    const mails = await this.prisma.mail.findMany({
      where: {
        mailboxId: context.mailboxId,
      },
    });
    return mails;
  }

  async getDeliveryAddresses(
    mailboxId: string,
  ): Promise<DeliveryAddressResponseDto[]> {
    const deliveryAddresses = await this.prisma.deliveryAddress.findMany({
      where: { mailBoxId: mailboxId },
    });
    return deliveryAddresses;
  }

  async createDeliveryAddress(
    mailboxId: string,
    createDeliveryAddressDto: CreateDeliveryAddressDto,
  ): Promise<DeliveryAddressResponseDto> {
    const mailbox = await this.prisma.mailbox.findUnique({
      where: { id: mailboxId },
    });
    if (!mailbox) {
      throw new BadRequestException('Mailbox not found');
    }
    const deliveryAddress = await this.prisma.deliveryAddress.create({
      data: {
        ...createDeliveryAddressDto,
        mailBoxId: mailboxId,
      },
      include: {
        mailbox: true,
      },
    });
    return deliveryAddress;
  }

  async updateDeliveryAddress(
    id: string,
    updateDeliveryAddressDto: UpdateDeliveryAddressDto,
    ability: any,
  ): Promise<DeliveryAddressResponseDto> {
    const deliveryAddress = await this.prisma.deliveryAddress.findUnique({
      where: { id },
    });
    if (!deliveryAddress) {
      throw new NotFoundException(`Delivery address with ID ${id} not found`);
    }
    if (!(await ability.can(PermissionAction.UPDATE, deliveryAddress))) {
      throw new ForbiddenException(
        'You are not allowed to update this delivery address',
      );
    }
    const updatedDeliveryAddress = await this.prisma.deliveryAddress.update({
      where: { id },
      data: updateDeliveryAddressDto,
      include: {
        mailbox: true,
      },
    });
    return updatedDeliveryAddress;
  }

  async deleteDeliveryAddress(id: string, ability: any): Promise<void> {
    const deliveryAddress = await this.prisma.deliveryAddress.findUnique({
      where: { id },
    });
    if (!deliveryAddress) {
      throw new NotFoundException(`Delivery address with ID ${id} not found`);
    }
    if (!(await ability.can(PermissionAction.DELETE, deliveryAddress))) {
      throw new ForbiddenException(
        'You are not allowed to delete this delivery address',
      );
    }
    await this.prisma.deliveryAddress.delete({
      where: { id },
    });
  }

  async getMailboxDashboard(mailboxId: string): Promise<any> {
    const mailbox = await this.prisma.mailbox.findUnique({
      where: { id: mailboxId },
      include: {
        plan: {
          include: {
            features: {
              include: {
                feature: true,
              },
            },
          },
        },
        featureUsages: {
          include: {
            feature: true,
          },
        },
        forms: true,
      },
    });

    if (!mailbox) {
      throw new NotFoundException(`Mailbox with ID ${mailboxId} not found`);
    }

    const recentMails = await this.prisma.mail.findMany({
      where: { mailboxId: mailboxId },
      include: {
        recipient: true,
        actions: true,
        forwardRequests: true,
        consulidationRequests: true,
      },
      take: 5,
      orderBy: { receivedAt: 'desc' },
    });
    const recentTasks = await this.prisma.task.findMany({
      where: { mailboxId: mailboxId },
      include: {
        attachments: true,
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
    const usps1583Form = mailbox.forms.find(form => form.formName === 'USPS_1583') || null;
    const dashboardData = {
      plan: mailbox.plan,
      recentTasks,
      recentMails,
      usps1583Form: usps1583Form ? usps1583Form : null,
    };
    return dashboardData;
  }
}
