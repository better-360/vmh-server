import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreateOfficeLocationDto,
  UpdateOfficeLocationDto,
  OfficeLocationQueryDto,
} from 'src/dtos/location.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LocationService {
  private readonly logger = new Logger('LocationService');

  constructor(private readonly prisma: PrismaService) {}

  // =====================
  // OFFICE LOCATION OPERATIONS
  // =====================

  async getOfficeLocations(query?: OfficeLocationQueryDto) {
    const {
      search,
      country,
      state,
      city,
      page = 1,
      limit = 10,
    } = query || {};
    const skip = (page - 1) * limit;
    const where: Prisma.OfficeLocationWhereInput = {
      isActive: true,
      isDeleted: false,
      ...(country && { country: { contains: country, mode: 'insensitive' } }),
      ...(state && { state: { contains: state, mode: 'insensitive' } }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(search && {
        OR: [
          { label: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { state: { contains: search, mode: 'insensitive' } },
          { addressLine: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [locations, total] = await Promise.all([
      this.prisma.officeLocation.findMany({
        where,
        skip,
        take: limit,
        include: {
          plans: {
            where: { isActive: true, isDeleted: false },
            select: { id: true, name: true, slug: true, isActive: true },
          },
          workspaceAddresses: {
            select: { 
              id: true, 
              steNumber: true, 
              isActive: true,
              workspace: {
                select: { id: true, name: true, isActive: true },
              },
            },
          },
          _count: {
            select: {
              plans: { where: { isActive: true, isDeleted: false } },
              workspaceAddresses: { where: { isActive: true } },
              workspaceSubscriptions: { where: { isActive: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.officeLocation.count({ where }),
    ]);

    return {
      data: locations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getActiveOfficeLocations() {
    return await this.prisma.officeLocation.findMany({
      where: { 
        isActive: true, 
        deletedAt: null 
      },
      include: {
        plans: {
          where: { isActive: true, isDeleted: false },
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: {
            plans: { where: { isActive: true, isDeleted: false } },
            workspaceAddresses: { where: { isActive: true } },
          },
        },
      },
      orderBy: [
        { label: 'asc' },
        { city: 'asc' },
      ],
    });
  }

  async getOfficeLocationById(id: string) {
    const location = await this.prisma.officeLocation.findFirst({
      where: { id },
      include: {
        plans: {
          where: { isActive: true, isDeleted: false },
          include: {
            prices: {
              where: { isActive: true, isDeleted: false },
              select: { id: true, amount: true, currency: true, billingCycle: true },
            },
            features: {
              where: { isActive: true, isDeleted: false },
              include: {
                feature: {
                  select: { id: true, name: true, description: true },
                },
              },
            },
          },
        },
        workspaceAddresses: {
          include: {
            workspace: {
              select: { id: true, name: true, isActive: true },
            },
          },
        },
        workspaceSubscriptions: {
          where: { isActive: true },
          include: {
            workspace: {
              select: { id: true, name: true },
            },
            plan: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    if (!location) {
      throw new NotFoundException('Office location not found');
    }

    return location;
  }

  async createOfficeLocation(data: CreateOfficeLocationDto) {
    try {
      // Check if location with same label already exists
      const existingLocation = await this.prisma.officeLocation.findFirst({
        where: { 
          label: data.label,
          deletedAt: null,
        },
      });

      if (existingLocation) {
        throw new ConflictException('Office location with this label already exists');
      }

      return await this.prisma.officeLocation.create({
        data,
        include: {
          plans: {
            where: { isActive: true, isDeleted: false },
            select: { id: true, name: true, slug: true },
          },
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create office location');
    }
  }

  async updateOfficeLocation(id: string, data: UpdateOfficeLocationDto) {
    await this.getOfficeLocationById(id); // Check if exists

    try {
      // Check if label already exists for other locations
      if (data.label) {
        const existingLocation = await this.prisma.officeLocation.findFirst({
          where: { 
            label: data.label, 
            id: { not: id },
            deletedAt: null,
          },
        });

        if (existingLocation) {
          throw new ConflictException('Office location with this label already exists');
        }
      }

      return await this.prisma.officeLocation.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          plans: {
            where: { isActive: true, isDeleted: false },
            select: { id: true, name: true, slug: true },
          },
          workspaceAddresses: {
            select: { 
              id: true, 
              steNumber: true, 
              isActive: true,
              workspace: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to update office location');
    }
  }

  async deleteOfficeLocation(id: string) {
    const location = await this.getOfficeLocationById(id); // Check if exists

    try {
      // Check if location has active plans or workspace addresses
      const hasActivePlans = location.plans && location.plans.length > 0;
      const hasActiveAddresses = location.workspaceAddresses && location.workspaceAddresses.length > 0;

      if (hasActivePlans || hasActiveAddresses) {
        throw new BadRequestException(
          'Cannot delete office location that has active plans or workspace addresses'
        );
      }

      return await this.prisma.officeLocation.update({
        where: { id },
        data: {
          isActive: false,
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete office location');
    }
  }

  async getLocationStats(id: string) {
    const location = await this.getOfficeLocationById(id);

    const stats = await this.prisma.officeLocation.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            plans: { where: { isActive: true, isDeleted: false } },
            workspaceAddresses: { where: { isActive: true } },
            workspaceSubscriptions: { where: { isActive: true } },
            workspaceFeatureUsages: true,
          },
        },
      },
    });

    return {
      location: {
        id: location.id,
        label: location.label,
        city: location.city,
        state: location.state,
        country: location.country,
      },
      statistics: {
        totalActivePlans: stats._count.plans,
        totalActiveAddresses: stats._count.workspaceAddresses,
        totalActiveSubscriptions: stats._count.workspaceSubscriptions,
        totalFeatureUsages: stats._count.workspaceFeatureUsages,
      },
    };
  }
}
