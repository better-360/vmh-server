import { HttpException, Injectable } from '@nestjs/common';
import { CreateInitialSubscriptionOrderDto } from 'src/dtos/checkout.dto';
import { PrismaService } from 'src/prisma.service';
import { WorkspaceService } from '../workspace/workspace.service';
import { UserService } from '../user/user.service';
import { RoleType } from '@prisma/client';
import { RegisterDto } from 'src/dtos/auth.dto';
import { HandlerService } from '../handler/handler.service';
import { CreateHandlerDto } from 'src/dtos/handler.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService,private readonly workspaceService:WorkspaceService,private readonly userService:UserService,private readonly handlerService:HandlerService) {}

  async getSystemStats() {
    try {
      const totalUsers = await this.prismaService.user.count();
      const recentUsers = await this.prismaService.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });
      
      const activeTickets = await this.prismaService.ticket.count({
        where: {
          status: {
            notIn: [
              'CLOSED',
              'RESOLVED',
              'CANCELLED',
              'CLOSED_BY_CUSTOMER',
              'CLOSED',
            ],
          },
        },
      });

      const latesTickets = await this.prismaService.ticket.findMany({
        select: {
          id: true,
          ticketNo: true,
          priority: true,
          subject: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });

      return {
        totalUsers,
        activeTickets,
        latesTickets,
        recentUsers,
      };
    } catch (error: any) {
      throw new HttpException(error, 500);
    }
  }


  async createMailHandler(data: CreateHandlerDto) {
    const { firstName, lastName, email } = data;
    const user = await this.userService.createUser(
      email,
      firstName,
      lastName,
      'fakeStripeCustomerId', // Placeholder, replace with actual Stripe customer ID 
    );
    await this.prismaService.userRole.create({
      data: {
        userId: user.id,
        role: RoleType.STAFF
      },
    });
  await this.handlerService.assignUserToOfficeLocation(user.id,data.officeLocationId)
  }


async generateSteNumber(): Promise<string> {
    const steNumber = Math.random().toString(36).substring(2, 2 + 6);
    return steNumber;
  }

async createWorkspaceAndMailbox(createOrderDto: CreateInitialSubscriptionOrderDto){
const { officeLocationId, planPriceId, addons,email,firstName,lastName } = createOrderDto;

const user= await this.userService.createUser(
  email,
  firstName,
  lastName,
  'fakeStripeCustomerId', // Placeholder, replace with actual Stripe customer ID
);

const planPrice=await this.prismaService.planPrice.findUnique({
  where: { id: planPriceId },
  include: { plan: true },
});

const generatedSteNumber = await this.generateSteNumber();

const mailbox= await this.prismaService.mailbox.create({
  data: {
    workspaceId: user.workspaces[0].workspaceId,
    officeLocationId,
    planPriceId,
    planId: planPrice.plan.id,
    status: 'ACTIVE',
    isActive: true, 
    steNumber: generatedSteNumber,
    billingCycle: 'MONTHLY',
    startDate: new Date(),
    recipients: {
      create: {
        email: user.email,
        name: user.firstName,
        lastName: user.lastName,
      },
    },
  },
  });
return mailbox;
}

}