import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { Prisma } from '@prisma/client';
import {
  CreatePackageDto,
  UpdatePackageDto,
  PackageQueryDto,
  CreatePackageItemDto,
  UpdatePackageItemDto,
  PackageItemQueryDto,
  BulkCreatePackageItemsDto,
  BulkUpdatePackageItemsDto,
  PackageStatus,
} from 'src/dtos/package.dto';

@Injectable()
export class PackageService {
    private readonly logger = new Logger('PackageService');

    constructor(
        private readonly prisma: PrismaService,
    ) {}    

    // =====================
    // PACKAGE OPERATIONS
    // =====================

    /**
     * Get packages with pagination and filtering
     */
     // TODO:Add User and Workspace control for this function
    async getPackages(query?: PackageQueryDto) {
        const {
            workspaceAddressId,
            officeLocationId,
            type,
            status,
            steNumber,
            senderName,
            carrier,
            isShereded,
            isForwarded,
            receivedAtStart,
            receivedAtEnd,
            page = 1,
            limit = 10,
        } = query || {};

        const skip = (page - 1) * limit;
        const where: Prisma.PackageWhereInput = {
            ...(workspaceAddressId && { workspaceAddressId }),
            ...(officeLocationId && { officeLocationId }),
            ...(type && { type }),
            ...(status && { status }),
            ...(steNumber && { steNumber: { contains: steNumber, mode: 'insensitive' } }),
            ...(senderName && { senderName: { contains: senderName, mode: 'insensitive' } }),
            ...(carrier && { carrier: { contains: carrier, mode: 'insensitive' } }),
            ...(isShereded !== undefined && { isShereded }),
            ...(isForwarded !== undefined && { isForwarded }),
            ...(receivedAtStart && receivedAtEnd && {
                receivedAt: {
                    gte: new Date(receivedAtStart),
                    lte: new Date(receivedAtEnd),
                },
            }),
        };

        const [packages, total] = await Promise.all([
            this.prisma.package.findMany({
                where,
                skip,
                take: limit,
                include: {
                    items: {
                        where: { isDeleted: false },
                        orderBy: { createdAt: 'asc' },
                    },
                    workspaceAddress: {
                        select: { 
                            id: true, 
                            steNumber: true,
                            workspace: {
                                select: { id: true, name: true }
                            }
                        },
                    },
                    officeLocation: {
                        select: { id: true, label: true, city: true, state: true },
                    },
                    actions: {
                        orderBy: { requestedAt: 'desc' },
                        take: 5, // Last 5 actions
                    },
                    forwardRequests: {
                        where: { status: { not: 'CANCELLED' } },
                        include: {
                            carrier: true,
                        },
                        orderBy: { createdAt: 'desc' },
                    },
                },
                orderBy: { receivedAt: 'desc' },
            }),
            this.prisma.package.count({ where }),
        ]);

        return {
            data: packages,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get package by ID
     */
     // TODO:Add User and Workspace control for this function
    async getPackageById(id: string) {
        const package_ = await this.prisma.package.findUnique({
            where: { id },
            include: {
                items: {
                    where: { isDeleted: false },
                    orderBy: { createdAt: 'asc' },
                },
                actions: {
                    orderBy: { requestedAt: 'desc' },
                },
                workspaceAddress: {
                    include: {
                        workspace: {
                            select: { id: true, name: true }
                        }
                    }
                },
                officeLocation: true,
                forwardRequests: {
                    include: {
                        carrier: true,
                        deliveryAddress: true,
                        deliverySpeedOption: true,
                        packagingTypeOption: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!package_) {
            throw new NotFoundException('Package not found');
        }

        return package_;
    }

    /**
     * Get package by STE number
     */
    async getPackageBySteNumber(steNumber: string, officeLocationId: string) {
        const package_ = await this.prisma.package.findUnique({
            where: {
                steNumber_officeLocationId: {
                    steNumber,
                    officeLocationId,
                },
            },
            include: {
                items: {
                    where: { isDeleted: false },
                    orderBy: { createdAt: 'asc' },
                },
                workspaceAddress: {
                    include: {
                        workspace: {
                            select: { id: true, name: true }
                        }
                    }
                },
                officeLocation: true,
            },
        });

        if (!package_) {
            throw new NotFoundException('Package not found');
        }

        return package_;
    }

    /**
     * Create a new package
     */
    async createPackage(createPackageDto: CreatePackageDto) {
        try {
            // Check if workspace address exists
            const workspaceAddress = await this.prisma.workspaceAddress.findUnique({
                where: { id: createPackageDto.workspaceAddressId },
            });
            if (!workspaceAddress) {
                throw new NotFoundException('Workspace address not found');
            }

            // Check if office location exists
            const officeLocation = await this.prisma.officeLocation.findUnique({
                where: { id: createPackageDto.officeLocationId },
            });
            if (!officeLocation) {
                throw new NotFoundException('Office location not found');
            }

            // Check if package with same STE number already exists in this location
            const existingPackage = await this.prisma.package.findUnique({
                where: {
                    steNumber_officeLocationId: {
                        steNumber: createPackageDto.steNumber,
                        officeLocationId: createPackageDto.officeLocationId,
                    },
                },
            });

            if (existingPackage) {
                throw new ConflictException('Package with this STE number already exists in this location');
            }

            const package_ = await this.prisma.package.create({
                data: {
                    ...createPackageDto,
                    receivedAt: new Date(createPackageDto.receivedAt),
                },
                include: {
                    items: true,
                    workspaceAddress: {
                        include: {
                            workspace: {
                                select: { id: true, name: true }
                            }
                        }
                    },
                    officeLocation: true,
                },
            });

            this.logger.log(`Created package: ${package_.steNumber} (${package_.id})`);
            return package_;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ConflictException('Package with this STE number already exists');
                }
            }
            this.logger.error('Failed to create package', error);
            throw new BadRequestException('Failed to create package');
        }
    }

    /**
     * Update package
     */
    async updatePackage(id: string, updatePackageDto: UpdatePackageDto) {
        try {
            await this.getPackageById(id); // Check if exists

            const package_ = await this.prisma.package.update({
                where: { id },
                data: {
                    ...updatePackageDto,
                    ...(updatePackageDto.receivedAt && { receivedAt: new Date(updatePackageDto.receivedAt) }),
                    updatedAt: new Date(),
                },
                include: {
                    items: {
                        where: { isDeleted: false },
                        orderBy: { createdAt: 'asc' },
                    },
                    workspaceAddress: {
                        include: {
                            workspace: {
                                select: { id: true, name: true }
                            }
                        }
                    },
                    officeLocation: true,
                },
            });

            this.logger.log(`Updated package: ${package_.steNumber} (${package_.id})`);
            return package_;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error('Failed to update package', error);
            throw new BadRequestException('Failed to update package');
        }
    }

    /**
     * Mark package as shredded
     */
    async markPackageAsShredded(id: string) {
        try {
            const package_ = await this.updatePackage(id, { 
                isShereded: true, 
                status: PackageStatus.COMPLETED, 
            });

            this.logger.log(`Marked package as shredded: ${package_.steNumber} (${package_.id})`);
            return package_;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mark package as forwarded
     */
    async markPackageAsForwarded(id: string) {
        try {
            const package_ = await this.updatePackage(id, { 
                isForwarded: true, 
                status: PackageStatus.COMPLETED 
            });

            this.logger.log(`Marked package as forwarded: ${package_.steNumber} (${package_.id})`);
            return package_;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get packages by workspace address ID
     */
    async getPackagesByWorkspaceAddressId(workspaceAddressId: string, query?: PackageQueryDto) {
        return this.getPackages({ ...query, workspaceAddressId });
    }

    /**
     * Get packages by office location ID
     */
    async getPackagesByOfficeLocationId(officeLocationId: string, query?: PackageQueryDto) {
        return this.getPackages({ ...query, officeLocationId });
    }

    // =====================
    // PACKAGE ITEM OPERATIONS
    // =====================

    /**
     * Get package items with filtering
     */
    async getPackageItems(query?: PackageItemQueryDto) {
        const {
            packageId,
            search,
            isShereded,
            isForwarded,
            isDeleted = false,
            page = 1,
            limit = 10,
        } = query || {};

        const skip = (page - 1) * limit;
        const where: Prisma.PackageItemWhereInput = {
            isDeleted,
            ...(packageId && { packageId }),
            ...(isShereded !== undefined && { isShereded }),
            ...(isForwarded !== undefined && { isForwarded }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [items, total] = await Promise.all([
            this.prisma.packageItem.findMany({
                where,
                skip,
                take: limit,
                include: {
                    package: {
                        select: { 
                            id: true, 
                            steNumber: true, 
                            type: true, 
                            status: true,
                            workspaceAddress: {
                                select: {
                                    steNumber: true,
                                    workspace: {
                                        select: { name: true }
                                    }
                                }
                            }
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.packageItem.count({ where }),
        ]);

        return {
            data: items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get package item by ID
     */
     // TODO:Add User and Workspace control for this function
    async getPackageItemById(id: string) {
        
        const item = await this.prisma.packageItem.findUnique({
            where: { id },
            include: {
                package: {
                    include: {
                        workspaceAddress: {
                            include: {
                                workspace: {
                                    select: { id: true, name: true }
                                }
                            }
                        },
                        officeLocation: true,
                    },
                },
            },
        });

        if (!item) {
            throw new NotFoundException('Package item not found');
        }

        return item;
    }

    /**
     * Get items by package ID
     */
    async getItemsByPackageId(packageId: string) {
        // TODO:Add User and Workspace control for this function
        const items = await this.prisma.packageItem.findMany({
            where: {
                packageId,
                isDeleted: false,
            },
            orderBy: { createdAt: 'asc' },
        });

        return items;
    }

    /**
     * Create package item
     */
    async createPackageItem(createPackageItemDto: CreatePackageItemDto) {
        try {
            // Check if package exists
            const package_ = await this.prisma.package.findUnique({
                where: { id: createPackageItemDto.packageId },
            });
            if (!package_) {
                throw new NotFoundException('Package not found');
            }

            const item = await this.prisma.packageItem.create({
                data: createPackageItemDto,
                include: {
                    package: {
                        select: { 
                            id: true, 
                            steNumber: true, 
                            type: true, 
                            status: true 
                        },
                    },
                },
            });

            this.logger.log(`Created package item: ${item.name} (${item.id})`);
            return item;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error('Failed to create package item', error);
            throw new BadRequestException('Failed to create package item');
        }
    }

    /**
     * Bulk create package items
     */
    async bulkCreatePackageItems(bulkCreatePackageItemsDto: BulkCreatePackageItemsDto) {
        try {
            const { packageId, items } = bulkCreatePackageItemsDto;

            // Check if package exists
            const package_ = await this.prisma.package.findUnique({
                where: { id: packageId },
            });
            if (!package_) {
                throw new NotFoundException('Package not found');
            }

            const itemsData = items.map(item => ({
                ...item,
                packageId,
            }));

            const createdItems = await this.prisma.packageItem.createMany({
                data: itemsData,
            });

            this.logger.log(`Bulk created ${createdItems.count} package items for package ${packageId}`);
            
            // Return the created items with full details
            return await this.getItemsByPackageId(packageId);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error('Failed to bulk create package items', error);
            throw new BadRequestException('Failed to bulk create package items');
        }
    }

    /**
     * Update package item
     */
    async updatePackageItem(id: string, updatePackageItemDto: UpdatePackageItemDto) {
        try {
            await this.getPackageItemById(id); // Check if exists

            const item = await this.prisma.packageItem.update({
                where: { id },
                data: {
                    ...updatePackageItemDto,
                    updatedAt: new Date(),
                },
                include: {
                    package: {
                        select: { 
                            id: true, 
                            steNumber: true, 
                            type: true, 
                            status: true 
                        },
                    },
                },
            });

            this.logger.log(`Updated package item: ${item.name} (${item.id})`);
            return item;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error('Failed to update package item', error);
            throw new BadRequestException('Failed to update package item');
        }
    }

    /**
     * Bulk update package items
     */
    async bulkUpdatePackageItems(bulkUpdatePackageItemsDto: BulkUpdatePackageItemsDto) {
        try {
            const { items } = bulkUpdatePackageItemsDto;

            const updatePromises = items.map(item => {
                const { id, ...updateData } = item;
                return this.prisma.packageItem.update({
                    where: { id },
                    data: {
                        ...updateData,
                        updatedAt: new Date(),
                    },
                });
            });

            const updatedItems = await Promise.all(updatePromises);

            this.logger.log(`Bulk updated ${updatedItems.length} package items`);
            return updatedItems;
        } catch (error) {
            this.logger.error('Failed to bulk update package items', error);
            throw new BadRequestException('Failed to bulk update package items');
        }
    }

    /**
     * Soft delete package item
     */
    async deletePackageItem(id: string) {
        try {
            await this.getPackageItemById(id); // Check if exists

            const item = await this.prisma.packageItem.update({
                where: { id },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            this.logger.log(`Deleted package item: ${item.name} (${item.id})`);
            return { message: 'Package item deleted successfully' };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error('Failed to delete package item', error);
            throw new BadRequestException('Failed to delete package item');
        }
    }

    /**
     * Mark package item as shredded
     */
    async markPackageItemAsShredded(id: string) {
        try {
            const item = await this.updatePackageItem(id, { 
                isShereded: true 
            });

            this.logger.log(`Marked package item as shredded: ${item.name} (${item.id})`);
            return item;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mark package item as forwarded
     */
    async markPackageItemAsForwarded(id: string) {
        try {
            const item = await this.updatePackageItem(id, { 
                isForwarded: true 
            });

            this.logger.log(`Marked package item as forwarded: ${item.name} (${item.id})`);
            return item;
        } catch (error) {
            throw error;
        }
    }
}