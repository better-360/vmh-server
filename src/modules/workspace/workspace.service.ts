import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { 
  CreateWorkspaceDto, 
  UpdateWorkspaceDto, 
  AddWorkspaceMemberDto, 
  UpdateWorkspaceMemberDto,
  CreateWorkspaceAddressDto,
  UpdateWorkspaceAddressDto,
  CreateWorkspaceDeliveryAddressDto,
  UpdateWorkspaceDeliveryAddressDto,
  InviteToWorkspaceDto,
  CreateWorkspaceSubscriptionDto,
  WorkspaceQueryDto,
  WorkspaceRole
} from "src/dtos/workspace.dto";
import { WorkspaceRole as PrismaWorkspaceRole } from "@prisma/client";

@Injectable()
export class WorkspaceService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}    

    // Workspace CRUD operasyonları
    async createWorkspace(userId: string, createWorkspaceDto: CreateWorkspaceDto) {
        const workspace = await this.prisma.workspace.create({
            data: {
                name: createWorkspaceDto.name,
                members: {
                    create: {
                        userId,
                        role: PrismaWorkspaceRole.OWNER
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });

        return workspace;
    }

    async getWorkspaceById(id: string, userId?: string) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id },
            include: {
                members: {
                    where: { isDeleted: false },
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                profileImage: true
                            }
                        }
                    }
                },
                addresses: {
                    where: { isActive: true },
                    include: {
                        officeLocation: true
                    }
                },
                deliveryAddresses: true,
                subscriptions: {
                    where: { isActive: true },
                    include: {
                        plan: {
                            include: {
                                officeLocation: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        members: { where: { isDeleted: false } },
                        tickets: true,
                        invoices: true
                    }
                }
            }
        });

        if (!workspace) {
            throw new NotFoundException('Workspace bulunamadı');
        }

        // Kullanıcının bu workspace'e erişimi var mı kontrol et
        if (userId) {
            const userMembership = workspace.members.find(m => m.userId === userId);
            if (!userMembership) {
                throw new ForbiddenException('Bu workspace\'e erişim yetkiniz yok');
            }
        }

        return workspace;
    }

    async getUserWorkspaces(userId: string, query: WorkspaceQueryDto) {
        const { page = 1, limit = 10, search, isActive } = query;
        const skip = (page - 1) * limit;

        const whereClause: any = {
            members: {
                some: {
                    userId,
                    isDeleted: false
                }
            }
        };

        if (search) {
            whereClause.name = {
                contains: search,
                mode: 'insensitive'
            };
        }

        if (isActive !== undefined) {
            whereClause.isActive = isActive;
        }

        const [workspaces, total] = await Promise.all([
            this.prisma.workspace.findMany({
                where: whereClause,
                skip,
                take: limit,
                include: {
                    members: {
                        where: { 
                            userId,
                            isDeleted: false 
                        },
                        select: {
                            role: true
                        }
                    },
                    _count: {
                        select: {
                            members: { where: { isDeleted: false } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.workspace.count({ where: whereClause })
        ]);

        return {
            workspaces: workspaces.map(workspace => ({
                ...workspace,
                userRole: workspace.members[0]?.role,
                memberCount: workspace._count.members
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async updateWorkspace(id: string, userId: string, updateWorkspaceDto: UpdateWorkspaceDto) {
        // Kullanıcının bu workspace'i güncelleyebilme yetkisi var mı kontrol et
        await this.checkUserPermission(id, userId, [PrismaWorkspaceRole.OWNER]);

        const workspace = await this.prisma.workspace.update({
            where: { id },
            data: updateWorkspaceDto,
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });

        return workspace;
    }

    async deleteWorkspace(id: string, userId: string) {
        // Sadece owner silebilir
        await this.checkUserPermission(id, userId, [PrismaWorkspaceRole.OWNER]);

        // Soft delete
        await this.prisma.workspace.update({
            where: { id },
            data: { 
                isActive: false,
                members: {
                    updateMany: {
                        where: { workspaceId: id },
                        data: { 
                            isDeleted: true,
                            deletedAt: new Date()
                        }
                    }
                }
            }
        });

        return { message: 'Workspace başarıyla silindi' };
    }

    // Workspace üye yönetimi
    async addWorkspaceMember(workspaceId: string, userId: string, addMemberDto: AddWorkspaceMemberDto) {
        // Sadece owner üye ekleyebilir
        await this.checkUserPermission(workspaceId, userId, [PrismaWorkspaceRole.OWNER]);

        // Kullanıcı var mı kontrol et
        const user = await this.prisma.user.findUnique({
            where: { email: addMemberDto.email }
        });

        if (!user) {
            throw new NotFoundException('Kullanıcı bulunamadı');
        }

        // Zaten üye mi kontrol et
        const existingMember = await this.prisma.workspaceMember.findFirst({
            where: {
                workspaceId,
                userId: user.id,
                isDeleted: false
            }
        });

        if (existingMember) {
            throw new BadRequestException('Kullanıcı zaten bu workspace\'in üyesi');
        }

        const member = await this.prisma.workspaceMember.create({
            data: {
                workspaceId,
                userId: user.id,
                role: addMemberDto.role as PrismaWorkspaceRole
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        profileImage: true
                    }
                }
            }
        });

        return member;
    }

    async updateWorkspaceMember(workspaceId: string, memberId: string, userId: string, updateMemberDto: UpdateWorkspaceMemberDto) {
        // Sadece owner üye güncelleyebilir
        await this.checkUserPermission(workspaceId, userId, [PrismaWorkspaceRole.OWNER]);

        const member = await this.prisma.workspaceMember.update({
            where: { 
                id: memberId,
                workspaceId,
                isDeleted: false
            },
            data: {
                role: updateMemberDto.role as PrismaWorkspaceRole
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        profileImage: true
                    }
                }
            }
        });

        return member;
    }

    async removeWorkspaceMember(workspaceId: string, memberId: string, userId: string) {
        // Sadece owner üye çıkarabilir veya kişi kendini çıkarabilir
        const member = await this.prisma.workspaceMember.findUnique({
            where: { id: memberId }
        });

        if (!member) {
            throw new NotFoundException('Üye bulunamadı');
        }

        if (member.userId !== userId) {
            await this.checkUserPermission(workspaceId, userId, [PrismaWorkspaceRole.OWNER]);
        }

        // Owner kendini çıkaramaz
        if (member.role === PrismaWorkspaceRole.OWNER && member.userId === userId) {
            throw new BadRequestException('Workspace sahibi kendini çıkaramaz');
        }

        await this.prisma.workspaceMember.update({
            where: { id: memberId },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });

        return { message: 'Üye başarıyla çıkarıldı' };
    }

    // Workspace adres yönetimi
    async createWorkspaceAddress(workspaceId: string, userId: string, createAddressDto: CreateWorkspaceAddressDto) {
        await this.checkUserPermission(workspaceId, userId, [PrismaWorkspaceRole.OWNER, PrismaWorkspaceRole.MEMBER]);

        // Eğer varsayılan adres olarak işaretlenmişse, diğer varsayılan adresleri kaldır
        if (createAddressDto.isDefault) {
            await this.prisma.workspaceAddress.updateMany({
                where: { workspaceId, isDefault: true },
                data: { isDefault: false }
            });
        }

        const address = await this.prisma.workspaceAddress.create({
            data: {
                workspaceId,
                officeLocationId: createAddressDto.officeLocationId,
                steNumber: createAddressDto.steNumber,
                isDefault: createAddressDto.isDefault || false
            },
            include: {
                officeLocation: true
            }
        });

        return address;
    }

    async updateWorkspaceAddress(workspaceId: string, addressId: string, userId: string, updateAddressDto: UpdateWorkspaceAddressDto) {
        await this.checkUserPermission(workspaceId, userId, [PrismaWorkspaceRole.OWNER, PrismaWorkspaceRole.MEMBER]);

        // Eğer varsayılan adres olarak işaretlenmişse, diğer varsayılan adresleri kaldır
        if (updateAddressDto.isDefault) {
            await this.prisma.workspaceAddress.updateMany({
                where: { 
                    workspaceId, 
                    isDefault: true,
                    id: { not: addressId }
                },
                data: { isDefault: false }
            });
        }

        const address = await this.prisma.workspaceAddress.update({
            where: { 
                id: addressId,
                workspaceId 
            },
            data: updateAddressDto,
            include: {
                officeLocation: true
            }
        });

        return address;
    }

    async deleteWorkspaceAddress(workspaceId: string, addressId: string, userId: string) {
        await this.checkUserPermission(workspaceId, userId, [PrismaWorkspaceRole.OWNER]);

        await this.prisma.workspaceAddress.update({
            where: { 
                id: addressId,
                workspaceId 
            },
            data: {
                isActive: false,
                deletedAt: new Date()
            }
        });

        return { message: 'Adres başarıyla silindi' };
    }

    // Workspace teslimat adresi yönetimi
    async createWorkspaceDeliveryAddress(workspaceId: string, userId: string, createDeliveryAddressDto: CreateWorkspaceDeliveryAddressDto) {
        await this.checkUserPermission(workspaceId, userId, [PrismaWorkspaceRole.OWNER, PrismaWorkspaceRole.MEMBER]);

        // Eğer varsayılan adres olarak işaretlenmişse, diğer varsayılan adresleri kaldır
        if (createDeliveryAddressDto.isDefault) {
            await this.prisma.workspaceDeliveryAddress.updateMany({
                where: { workspaceId, isDefault: true },
                data: { isDefault: false }
            });
        }

        const deliveryAddress = await this.prisma.workspaceDeliveryAddress.create({
            data: {
                workspaceId,
                ...createDeliveryAddressDto
            }
        });

        return deliveryAddress;
    }

    async updateWorkspaceDeliveryAddress(workspaceId: string, deliveryAddressId: string, userId: string, updateDeliveryAddressDto: UpdateWorkspaceDeliveryAddressDto) {
        await this.checkUserPermission(workspaceId, userId, [PrismaWorkspaceRole.OWNER, PrismaWorkspaceRole.MEMBER]);

        // Eğer varsayılan adres olarak işaretlenmişse, diğer varsayılan adresleri kaldır
        if (updateDeliveryAddressDto.isDefault) {
            await this.prisma.workspaceDeliveryAddress.updateMany({
                where: { 
                    workspaceId, 
                    isDefault: true,
                    id: { not: deliveryAddressId }
                },
                data: { isDefault: false }
            });
        }

        const deliveryAddress = await this.prisma.workspaceDeliveryAddress.update({
            where: { 
                id: deliveryAddressId,
                workspaceId 
            },
            data: updateDeliveryAddressDto
        });

        return deliveryAddress;
    }

    async deleteWorkspaceDeliveryAddress(workspaceId: string, deliveryAddressId: string, userId: string) {
        await this.checkUserPermission(workspaceId, userId, [PrismaWorkspaceRole.OWNER]);

        await this.prisma.workspaceDeliveryAddress.delete({
            where: { 
                id: deliveryAddressId,
                workspaceId 
            }
        });

        return { message: 'Teslimat adresi başarıyla silindi' };
    }

    // Workspace abonelik yönetimi
    async createWorkspaceSubscription(workspaceId: string, userId: string, createSubscriptionDto: CreateWorkspaceSubscriptionDto) {
        await this.checkUserPermission(workspaceId, userId, [PrismaWorkspaceRole.OWNER]);

        // Aynı lokasyon için aktif abonelik var mı kontrol et
        const existingSubscription = await this.prisma.workspaceSubscription.findFirst({
            where: {
                workspaceId,
                officeLocationId: createSubscriptionDto.officeLocationId,
                isActive: true
            }
        });

        if (existingSubscription) {
            throw new BadRequestException('Bu lokasyon için zaten aktif bir abonelik var');
        }

        const subscription = await this.prisma.workspaceSubscription.create({
            data: {
                workspaceId,
                officeLocationId: createSubscriptionDto.officeLocationId,
                planId: createSubscriptionDto.planId,
                billingCycle: createSubscriptionDto.billingCycle as any,
                startDate: new Date()
            },
            include: {
                plan: {
                    include: {
                        officeLocation: true
                    }
                }
            }
        });

        return subscription;
    }

    // Yardımcı metodlar
    private async checkUserPermission(workspaceId: string, userId: string, allowedRoles: PrismaWorkspaceRole[]) {
        const member = await this.prisma.workspaceMember.findFirst({
            where: {
                workspaceId,
                userId,
                isDeleted: false
            }
        });

        if (!member) {
            throw new ForbiddenException('Bu workspace\'e erişim yetkiniz yok');
        }

        if (!allowedRoles.includes(member.role)) {
            throw new ForbiddenException('Bu işlem için yetkiniz yok');
        }

        return member;
    }

    async getWorkspaceMembers(workspaceId: string, userId: string) {
        await this.checkUserPermission(workspaceId, userId, [PrismaWorkspaceRole.OWNER, PrismaWorkspaceRole.MEMBER]);

        const members = await this.prisma.workspaceMember.findMany({
            where: {
                workspaceId,
                isDeleted: false
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        profileImage: true
                    }
                }
            },
            orderBy: { joinedAt: 'asc' }
        });

        return members;
    }

    async getWorkspaceAddresses(workspaceId: string, userId: string) {
        await this.checkUserPermission(workspaceId, userId, [PrismaWorkspaceRole.OWNER, PrismaWorkspaceRole.MEMBER]);

        const addresses = await this.prisma.workspaceAddress.findMany({
            where: {
                workspaceId,
                isActive: true
            },
            include: {
                officeLocation: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return addresses;
    }

    async getWorkspaceDeliveryAddresses(workspaceId: string, userId: string) {
        await this.checkUserPermission(workspaceId, userId, [PrismaWorkspaceRole.OWNER, PrismaWorkspaceRole.MEMBER]);

        const deliveryAddresses = await this.prisma.workspaceDeliveryAddress.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' }
        });

        return deliveryAddresses;
    }

    async getWorkspaceSubscriptions(workspaceId: string, userId: string) {
        await this.checkUserPermission(workspaceId, userId, [PrismaWorkspaceRole.OWNER, PrismaWorkspaceRole.MEMBER]);

        const subscriptions = await this.prisma.workspaceSubscription.findMany({
            where: { workspaceId },
            include: {
                plan: {
                    include: {
                        officeLocation: true,
                        features: {
                            include: {
                                feature: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return subscriptions;
    }
}