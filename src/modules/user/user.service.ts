import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Mailbox, MailHandlerAssignment, OfficeLocation, RoleType, User, Workspace, WorkspaceMember } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  ChangeEmailDto,
  LoginDto,
  SetActiveContextDto,
  UpdateUserDto,
} from 'src/dtos/user.dto';
import { IUser } from 'src/common/interfaces/user.interface';
import { randomBytes } from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from 'src/common/enums/event.enum';
import { WorkspaceService } from '../workspace/workspace.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private eventEmitter: EventEmitter2,
    private readonly workspaceService: WorkspaceService,
    
  ) {}

  private generateRandomPassword(length: number = 20): string {
    return randomBytes(Math.ceil((length * 3) / 4))
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, length);
  }

  private formatUser(
    user: User & { roles: { role: RoleType }[] } & { handlerAssignments: MailHandlerAssignment[] } & {
      workspaces: (WorkspaceMember & {
        workspace: Workspace & {
          mailboxes: (Mailbox & {
            plan: { name: string };
            planPrice: { amount: number };
          })[];
        };
      })[];
    },
  ): IUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      profileImage: user.profileImage || null,
      emailConfirmed: user.emailConfirmed,
      telephoneConfirmed: user.telephoneConfirmed,
      notifications: user.notifications,
      isActive: user.isActive,
      createdAt: user.createdAt,
      telephone: user.telephone || null,
      roles: user.roles.map((role) => role.role),
      assignedLocationId: user.assignedLocationId || null,
      workspaces: user.workspaces.map((member) => ({
        workspaceId: member.workspaceId,
        role: member.role,
        joinedAt: member.joinedAt,
        workspaceName: member.workspace.name,
        mailboxes: member.workspace.mailboxes.map((mailbox) => ({
          id: mailbox.id,
          steNumber: mailbox.steNumber,
          planName: mailbox.plan?.name || null,
          billingCycle: mailbox.billingCycle,
          status: mailbox.status,
          startDate: mailbox.startDate,
          endDate: mailbox.endDate,
        })),
      })),
    };
  }
  

  async findOne(email: string): Promise<User | undefined> {
    return this.prismaService.user.findUnique({
      where: { email },
      include: {
        roles: true,
        handlerAssignments: true,
        workspaces: {
          include: {
            workspace: {
              include: {
                mailboxes: {
                  include: {
                    plan: true,
                    planPrice: true,
                    officeLocation: true,
                  },
                },
              },
            },
          },
        },
        
      },
    });
  }

  async findUserByEmail(email: string): Promise<IUser> {
    const user = await this.prismaService.user.findUnique({
      where: { email, deletedAt: null },
      include: {
        roles: true,
        handlerAssignments: true,
        tasks: true,
        workspaces: {
          include: {
            workspace: {
              include: {
                mailboxes: {
                  include: {
                    plan: true,       
                    planPrice: true,
                    officeLocation: {
                      select: {
                        id: true,
                        label: true,
                        addressLine: true,
                        addressLine2: true,
                        city: true,
                        state: true,
                        country: true,
                        phone: true,
                        email: true,
                        workingHours: true,
                        timezone: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    
    const formattedUser = this.formatUser(user);
    
    // Add context information to user object for JWT payload
    formattedUser.currentWorkspaceId = user.currentWorkspaceId;
    formattedUser.currentMailboxId = user.currentMailboxId;
    formattedUser.currentOfficeLocation = user.workspaces[0].workspace.mailboxes[0]?.officeLocation?? null;
    return formattedUser;
  }

  async checkUserByEmail(
    email: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email, deletedAt: null },
      include: {
        roles: true,
        workspaces: true,
      },
    });

    return user;
  }

  async findUserById(id: string): Promise<IUser> {
    const user = await this.prismaService.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        roles: true,
        handlerAssignments: true,
        tasks: true,
        workspaces: {
          include: {
            workspace: {
              include: {
                mailboxes: {
                  include: {
                    plan: true,
                    planPrice: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    return this.formatUser(user);
  }

  async getAllUsers(): Promise<IUser[]> {
    const users = await this.prismaService.user.findMany({
      where: { deletedAt: null },
      include: { roles: true, handlerAssignments: true, workspaces: true },
    });
    const safeUsers = users.map((user) =>
      this.formatUser(
        user as User & { roles: { role: RoleType }[] } & { handlerAssignments: MailHandlerAssignment[] } & { workspaces: any[] },
      ),
    );
    return safeUsers;
  }


  async createUser(email:string,firstName:string,lastName:string,stripeCustomerId:string): Promise<IUser> {
    const user = await this.findOne(email);
    if (user) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }
    const password = this.generateRandomPassword();
    const hash = await this.hashPassword(password);
    const newUser = await this.prismaService.user.create({
      data: {password: hash,stripeCustomerId,firstName,lastName, email } as any,
      select: {
        email: true,
        id: true,
        firstName: true,
        lastName: true,
      },
    });
    await this.workspaceService.createWorkspace({ name: `${newUser.firstName} ${newUser.lastName || ''}`.trim() }, newUser.id);
    await this.prismaService.userRole.create({
      data: {
        userId: newUser.id,
        role: RoleType.CUSTOMER,
      },
    });
    this.eventEmitter.emit(Events.USER_REGISTERED, {
      email: newUser.email,
      name: `${newUser.firstName} ${newUser.lastName || ''}`.trim(),
      password,
    });
    console.log(`New user created. Email: ${newUser.email},Pass: ${password}`);
    return await this.findUserByEmail(newUser.email);
  }

async changeUserEmail(userId: string, data: ChangeEmailDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    const newEmail = await this.findOne(data.newEmail);

    const compare = await bcrypt.compare(data.currentPassword, user.password);
    if (!compare) {
      throw new HttpException('Password is incorrect', HttpStatus.BAD_REQUEST);
    }
    if (newEmail) {
      throw new HttpException('This email alread using', HttpStatus.CONFLICT);
    }
    try {
      await this.prismaService.user.update({
        where: { id: userId },
        data: { email: data.newEmail },
        include: { roles: true, workspaces: true },
      });
    } catch (error) {
      throw new InternalServerErrorException('Email could not be updated');
    }
    return HttpStatus.OK;
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const updateData = {
      ...updateUserDto,
    };
    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: updateData,
      include: { roles: true, workspaces: true },
    });

    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
  }

  async checkPassword(loginDto: LoginDto): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }

    return bcrypt.compare(loginDto.password, user.password);
  }

  // TOOD: Send email to user before deleting account
  // TODO: Delete user from all tables that have a foreign key to user table before deleting the user itself (cascade delete)
  // TOOD: Soft delete user instead of hard delete

  async deleteUser(id: string): Promise<User> {
    try {
      return await this.prismaService.user.update({
        where: { id },
        data: { isActive: false, deletedAt: new Date() },
      });
    } catch {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
  }

  async harddeleteUser(id: string): Promise<User> {
    try {
      return await this.prismaService.user.delete({
        where: { id },
      });
    } catch {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
  }

  async setNewPassword(userId: string, newPassword: string): Promise<void> {
    const hash = await this.hashPassword(newPassword);
    await this.prismaService.user.update({
      where: { id: userId },
      data: { password: hash },
    });
  }

  async verifyUserEmail(
    email: string,
  ): Promise<{ message: string; status: number }> {
    await this.prismaService.user.update({
      where: { email },
      data: { emailConfirmed: true },
    });
    return { message: 'Email verified', status: HttpStatus.OK };
  }

  async verifyUserPhone(
    email: string,
  ): Promise<{ message: string; status: number }> {
    await this.prismaService.user.update({
      where: { email },
      data: { telephoneConfirmed: true },
    });

    return { message: 'Telephone verified', status: 200 };
  }

  async editRoles(userId: string, newRoles: RoleType[]): Promise<IUser> {
    await this.prismaService.userRole.deleteMany({
      where: { userId: userId },
    });

    const roles = newRoles.map((role) => ({
      userId: userId,
      role,
    }));

    await this.prismaService.userRole.createMany({
      data: roles,
    });

    return await this.findUserById(userId);
  }

  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return bcrypt.hash(password, saltOrRounds);
  }


    async setContext(userId, dto: SetActiveContextDto) {
    const member = await this.prismaService.workspaceMember.findFirst({
      where: { workspaceId: dto.workspaceId, userId },
      select: { workspaceId: true },
    });
    if (!member) throw new Error('Not a member of workspace');

    if (dto.mailboxId) {
      const ok = await this.prismaService.mailbox.findFirst({
        where: { id: dto.mailboxId, workspaceId: dto.workspaceId, isActive: true },
        select: { id: true },
      });
      if (!ok) throw new Error('Mailbox not in workspace');
    }

    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        currentWorkspaceId: dto.workspaceId,
        currentMailboxId: dto.mailboxId ?? null,
      },
    });

    return { ok: true };
  }

  async getContext(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        currentWorkspaceId: true,
        currentMailboxId: true,
        workspaces: {
          where: { workspaceId: { not: null } },
          select: { workspaceId: true, role: true },
        },
      },
    });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return {
      workspaceId: user.currentWorkspaceId,
      mailboxId: user.currentMailboxId,
      workspaces: user.workspaces,
    };
  }
  
}
