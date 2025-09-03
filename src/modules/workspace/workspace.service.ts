import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { 
  CreateWorkspaceDto, 
  UpdateWorkspaceDto, 
  CreateWorkspaceMemberDto,
  UpdateWorkspaceMemberDto,
  WorkspaceResponseDto,
  WorkspaceMemberResponseDto,
} from 'src/dtos/workspace.dto';
import { Prisma, RoleType, WorkspaceRole } from '@prisma/client';

@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger('WorkspaceService');

  constructor(private readonly prisma: PrismaService) {}


  async getAllWorkspaces(): Promise<WorkspaceResponseDto[]> {
    try {
      const workspaces = await this.prisma.workspace.findMany({

        include: {
          members: true,
          mailboxes: true,
        },
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
      });

      return workspaces;
    }
      catch (error) {
      this.logger.error(`Failed to get all workspaces: ${error.message}`);
      throw new BadRequestException('Failed to get workspaces');
    }
  }
          
  async createWorkspace(createWorkspaceDto: CreateWorkspaceDto, ownerId: string): Promise<WorkspaceResponseDto> {
    try {
        const workspace = await this.prisma.workspace.create({
            data: {
          ...createWorkspaceDto,
              members: {
              create: {
              userId: ownerId,
              role: WorkspaceRole.OWNER,
              isDefault: true,
            },
          },
            },
            include: {
                members: {
                    include: {
                        user: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
          },
          mailboxes: {
            include: {
              plan: {
                select: { id: true, name: true, slug: true },
              },
              officeLocation: {
                select: { id: true, label: true, city: true, state: true },
              },
            },
          },
        },
      });
      if(!workspace){
        throw new BadRequestException('Failed to create workspace');
      }
      const workspaceBalance = await this.prisma.workspaceBalance.create({
        data: {
          workspaceId: workspace.id,
          stripeCustomerId: `cus_temp_${workspace.id}`, // Temporary
          currentBalance: 0,
          currentDebt: 0,
          isActive: true,
        },
      });

      this.logger.log(`Workspace created successfully: ${workspace.id}`);
        return workspace;
    } catch (error) {
      this.logger.error(`Failed to create workspace: ${error.message}`);
      throw new BadRequestException('Failed to create workspace');
    }
    }

  async getWorkspaceById(id: string, userId: string): Promise<WorkspaceResponseDto> {
    try {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id },
            include: {
            
                members: {
                    include: {
                        user: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
            where: { isDeleted: false },
          },
          mailboxes: {
                    include: {
              plan: {
                select: { id: true, name: true, slug: true },
              },
              deliveryAddresses:true,
              officeLocation: {
                select: { id: true, label: true, city: true, state: true },
              },
            },
          },
        },
      });

      if (!workspace || workspace.isDeleted) {
        throw new NotFoundException('Workspace not found');
      }

        return workspace;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get workspace: ${error.message}`);
      throw new BadRequestException('Failed to get workspace');
    }
  }

  async getUserWorkspaces(userId: string): Promise<WorkspaceResponseDto[]> {
    try {
      const workspaces = await this.prisma.workspace.findMany({
        where: {
          isDeleted: false,
            members: {
                some: {
                    userId,
              isDeleted: false,
            },
          },
        },
                include: {
                    members: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
            where: { isDeleted: false },
          },
          mailboxes: {
            include: {
              plan: {
                select: { id: true, name: true, slug: true },
              },
              officeLocation: {
                select: { id: true, label: true, city: true, state: true },
              },
            },
                    },
                    _count: {
                        select: {
              mailboxes: {
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return workspaces;
    } catch (error) {
      this.logger.error(`Failed to get user workspaces: ${error.message}`);
      throw new BadRequestException('Failed to get user workspaces');
    }
  }

  async updateWorkspace(id: string, updateWorkspaceDto: UpdateWorkspaceDto, userId: string): Promise<WorkspaceResponseDto> {
    try {
      const workspace = await this.getWorkspaceById(id, userId);

      // Check if user has permission to update
      const userMembership = workspace.members.find(m => m.userId === userId);
      if (!userMembership || !['OWNER'].includes(userMembership.role)) {
        throw new BadRequestException('Insufficient permissions to update workspace');
      }

      const updatedWorkspace = await this.prisma.workspace.update({
            where: { id },
            data: updateWorkspaceDto,
            include: {
                members: {
                    include: {
                        user: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
            where: { isDeleted: false },
          },
          mailboxes: {
            include: {
              plan: {
                select: { id: true, name: true, slug: true },
              },
              officeLocation: {
                select: { id: true, label: true, city: true, state: true },
              },
            },
          },
        },
      });

      this.logger.log(`Workspace updated successfully: ${updatedWorkspace.id}`);
      return updatedWorkspace;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to update workspace: ${error.message}`);
      throw new BadRequestException('Failed to update workspace');
    }
  }

  async deleteWorkspace(id: string, userId: string): Promise<void> {
    try {
      const workspace = await this.getWorkspaceById(id, userId);

      // Check if user is owner
      const userMembership = workspace.members.find(m => m.userId === userId);
      if (!userMembership || userMembership.role !== WorkspaceRole.OWNER) {
        throw new BadRequestException('Only workspace owner can delete workspace');
      }

      // Check if workspace has active mailboxes
      const activeMailboxes = await this.prisma.mailbox.count({
        where: {
          workspaceId: id,
        },
      });

      if (activeMailboxes > 0) {
        throw new ConflictException('Cannot delete workspace with active mailboxes');
      }

        await this.prisma.workspace.update({
            where: { id },
            data: { 
          isDeleted: true,
          deletedAt: new Date(),
                isActive: false,
        },
      });

      this.logger.log(`Workspace deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to delete workspace: ${error.message}`);
      throw new BadRequestException('Failed to delete workspace');
    }
  }

  async getWorkspaceMembers(workspaceId: string, userId: string): Promise<WorkspaceMemberResponseDto[]> {
    const workspace = await this.getWorkspaceById(workspaceId, userId);
    return workspace.members;
  }

  async addWorkspaceMember(workspaceId: string, createMemberDto: CreateWorkspaceMemberDto, userId: string): Promise<WorkspaceMemberResponseDto> {
    try {
      const workspace = await this.getWorkspaceById(workspaceId, userId);

      // Check if user has permission to add members
      const userMembership = workspace.members.find(m => m.userId === userId);
      if (!userMembership || !['OWNER'].includes(userMembership.role)) {
        throw new BadRequestException('Insufficient permissions to add members');
      }

      // Check if user is already a member
      const existingMember = await this.prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          userId: createMemberDto.userId,
          isDeleted: false,
        },
      });

      if (existingMember) {
        throw new ConflictException('User is already a member of this workspace');
      }

      // Verify the user exists
        const user = await this.prisma.user.findUnique({
        where: { id: createMemberDto.userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const member = await this.prisma.workspaceMember.create({
            data: {
                workspaceId,
          userId: createMemberDto.userId,
          role: createMemberDto.role || WorkspaceRole.MEMBER,
            },
            include: {
                user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          workspace: {
            select: { id: true, name: true },
          },
        },
      });

      this.logger.log(`Member added to workspace: ${member.id}`);
      return member;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to add workspace member: ${error.message}`);
      throw new BadRequestException('Failed to add workspace member');
    }
  }

  async updateWorkspaceMember(workspaceId: string, memberId: string, updateMemberDto: UpdateWorkspaceMemberDto, userId: string): Promise<WorkspaceMemberResponseDto> {
    try {
      const workspace = await this.getWorkspaceById(workspaceId, userId);

      // Check if user has permission to update members
      const userMembership = workspace.members.find(m => m.userId === userId);
      if (!userMembership || !['OWNER'].includes(userMembership.role)) {
        throw new BadRequestException('Insufficient permissions to update members');
      }

      const existingMember = await this.prisma.workspaceMember.findUnique({
        where: { id: memberId },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      if (!existingMember || existingMember.workspaceId !== workspaceId) {
        throw new NotFoundException('Member not found');
      }

      // Cannot change role of workspace owner
      if (existingMember.role === WorkspaceRole.OWNER && updateMemberDto.role && updateMemberDto.role !== WorkspaceRole.OWNER) {
        throw new BadRequestException('Cannot change role of workspace owner');
      }

      const updatedMember = await this.prisma.workspaceMember.update({
        where: { id: memberId },
        data: updateMemberDto,
            include: {
                user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          workspace: {
            select: { id: true, name: true },
          },
        },
      });

      this.logger.log(`Workspace member updated: ${updatedMember.id}`);
      return updatedMember;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to update workspace member: ${error.message}`);
      throw new BadRequestException('Failed to update workspace member');
    }
  }

  async removeWorkspaceMember(workspaceId: string, memberId: string, userId: string): Promise<void> {
    try {
      const workspace = await this.getWorkspaceById(workspaceId, userId);

      // Check if user has permission to remove members
      const userMembership = workspace.members.find(m => m.userId === userId);
      if (!userMembership || !['OWNER'].includes(userMembership.role)) {
        throw new BadRequestException('Insufficient permissions to remove members');
      }

      const existingMember = await this.prisma.workspaceMember.findUnique({
        where: { id: memberId },
      });

      if (!existingMember || existingMember.workspaceId !== workspaceId) {
        throw new NotFoundException('Member not found');
      }

      // Cannot remove workspace owner
      if (existingMember.role === WorkspaceRole.OWNER) {
        throw new BadRequestException('Cannot remove workspace owner');
        }

        await this.prisma.workspaceMember.update({
            where: { id: memberId },
            data: {
                isDeleted: true,
          deletedAt: new Date(),
        },
      });

      this.logger.log(`Member removed from workspace: ${memberId}`);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to remove workspace member: ${error.message}`);
      throw new BadRequestException('Failed to remove workspace member');
    }
  }

  async getWorkspaceStatistics(workspaceId: string, userId: string) {
    try {
      await this.getWorkspaceById(workspaceId, userId);

      const [
        totalMailboxes,
        activeMailboxes,
        totalMembers,
        totalMails,
        pendingMails,
      ] = await Promise.all([
        this.prisma.mailbox.count({
          where: { workspaceId },
        }),
        this.prisma.mailbox.count({
          where: { workspaceId },
        }),
        this.prisma.workspaceMember.count({
          where: { workspaceId, isDeleted: false },
        }),
        this.prisma.mail.count({
                where: { 
            mailbox: { workspaceId },
          },
        }),
        this.prisma.mail.count({
            where: { 
            mailbox: { workspaceId },
            status: 'PENDING',
          },
        }),
      ]);

      return {
        mailboxes: {
          total: totalMailboxes,
          active: activeMailboxes,
        },
        members: {
          total: totalMembers,
        },
        deliveryAddresses: {
          total: 0, // Not tracked at workspace level
        },
        mails: {
          total: totalMails,
          pending: pendingMails,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get workspace statistics: ${error.message}`);
      throw new BadRequestException('Failed to get workspace statistics');
    }
  }


}