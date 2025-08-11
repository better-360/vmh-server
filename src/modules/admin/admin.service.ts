import { HttpException, Injectable } from '@nestjs/common';
import { CreateInitialSubscriptionOrderDto } from 'src/dtos/checkout.dto';
import { PrismaService } from 'src/prisma.service';
import { WorkspaceService } from '../workspace/workspace.service';

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService,private readonly workspaceService:WorkspaceService) {}

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



async createWorkspaceAndMailbox(createOrderDto: CreateInitialSubscriptionOrderDto){
const { officeLocationId, planPriceId, addons,email,firstName,lastName } = createOrderDto;
const user= await this.prismaService.user.create({
  data: {
    email,
    firstName,
    lastName,
    password: 'defaultPassword', // You should handle password securely
  },
});
const workspace= await this.workspaceService.createWorkspace({name:`${firstName} ${lastName}`},user.id);

const planPrice=await this.prismaService.planPrice.findUnique({
  where: { id: planPriceId },
  include: { plan: true },
});

const mailbox= await this.prismaService.mailbox.create({
  data: {
    workspaceId: workspace.id,
    officeLocationId,
    planPriceId,
    planId: planPrice.plan.id, // Assuming planPriceId is the same as planId
    status: 'ACTIVE',
    isActive: true, 
    steNumber: '1234575', // Example STE number, should be generated or provided
    billingCycle: 'MONTHLY', // Default billing cycle, can be changed later
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

  const addon=this.prismaService.price.findUnique({
    where: { id: planPriceId },
    include: { product: true },
  });


return {
  user,
  workspace,
  mailbox,
  }
}

}