import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { RoleType } from "@prisma/client";

interface Handler{
    id:string;
    name:string;
    lastName:string;
    email:string;
    telephone:string;
}

@Injectable()
export class HandlerService {
  constructor(private prisma: PrismaService) {}

  async assignUserToOfficeLocation(userId: string, officeLocationId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const location = await this.prisma.officeLocation.findUnique({ where: { id: officeLocationId } });
    if (!location) throw new NotFoundException('Office location not found');

    // Ensure user has STAFF or ADMIN role to handle mails
    const hasHandlerRole = await this.prisma.userRole.findFirst({
      where: { userId, role: { in: [RoleType.STAFF, RoleType.ADMIN, RoleType.SUPERADMIN] } },
    });
    if (!hasHandlerRole) throw new BadRequestException('User is not STAFF/ADMIN');

    // Upsert unique per user
    const assignment = await this.prisma.mailHandlerAssignment.upsert({
      where: { userId },
      update: { officeLocationId, isActive: true },
      create: { userId, officeLocationId },
      include: { officeLocation: true, user: true },
    });
    return assignment;
  }

  async revokeUserFromOfficeLocation(userId: string) {
    const existing = await this.prisma.mailHandlerAssignment.findUnique({ where: { userId } });
    if (!existing) throw new NotFoundException('Assignment not found');
    await this.prisma.mailHandlerAssignment.delete({ where: { userId } });
    return { success: true };
  }

  async listHandlersByOfficeLocation(officeLocationId: string) {
    const location = await this.prisma.officeLocation.findUnique({ where: { id: officeLocationId } });
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
    const assignment = await this.prisma.mailHandlerAssignment.findUnique({ where: { userId } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return this.prisma.mailHandlerAssignment.update({ where: { userId }, data: { isActive } });
  }
}