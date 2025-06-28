import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService) {}

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
}
