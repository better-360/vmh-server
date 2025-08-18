import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { 
  CreateOfficeLocationDto, 
  UpdateOfficeLocationDto, 
  OfficeLocationResponseDto,
  OfficeLocationQueryDto, 
  ActiveOfficeLocationResponseDto
} from 'src/dtos/location.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LocationService {
  private readonly logger = new Logger('LocationService');

  constructor(private readonly prisma: PrismaService) {}

  async createLocation(createLocationDto: CreateOfficeLocationDto): Promise<OfficeLocationResponseDto> {
    try {
      // Check if location with same label already exists
      const existingLocation = await this.prisma.officeLocation.findFirst({
        where: {
          label: createLocationDto.label,
          isDeleted: false,
        },
      });

      if (existingLocation) {
        throw new ConflictException(`Office location with label "${createLocationDto.label}" already exists`);
      }

      const location = await this.prisma.officeLocation.create({
        data: createLocationDto,
        include: {
          plans: {
            where: { isActive: true, isDeleted: false },
            select: { id: true, name: true, slug: true, isActive: true },
          },
        },
      });

      return location;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Failed to create office location: ${error.message}`);
      throw new BadRequestException('Failed to create office location');
    }
  }

  async getLocations(query?: OfficeLocationQueryDto) {
    try {
      const page = query?.page || 1;
      const limit = query?.limit || 10;
      const skip = (page - 1) * limit;

      const where: Prisma.OfficeLocationWhereInput = {
        isDeleted: false,
      };

      if (query?.search) {
        where.OR = [
          { label: { contains: query.search, mode: 'insensitive' } },
          { city: { contains: query.search, mode: 'insensitive' } },
          { state: { contains: query.search, mode: 'insensitive' } },
          { country: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      if (query?.country) {
        where.country = { contains: query.country, mode: 'insensitive' };
      }

      if (query?.state) {
        where.state = { contains: query.state, mode: 'insensitive' };
      }

      if (query?.city) {
        where.city = { contains: query.city, mode: 'insensitive' };
      }

      const [locations, total] = await Promise.all([
        this.prisma.officeLocation.findMany({
          where,
          include: {
            plans: {
              where: { isActive: true, isDeleted: false },
              select: { id: true, name: true, slug: true, isActive: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip,
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
    } catch (error) {
      this.logger.error(`Failed to get office locations: ${error.message}`);
      throw new BadRequestException('Failed to get office locations');
    }
  }

  async getLocationById(id: string): Promise<OfficeLocationResponseDto> {
    try {
      const location = await this.prisma.officeLocation.findUnique({
        where: { id },
        include: {
          plans: {
            where: { isActive: true, isDeleted: false },
            include: {
              features: {
                include: {
                  feature: {
                    select: { id: true, name: true, description: true },
                  },
                },
                where: {
                  isActive: true,
                  isDeleted: false,
                },
              },
              prices: {
                where: {
                  isActive: true,
                  isDeleted: false,
                },
              },
            },
          },
          mailboxes: {
            include: {
              workspace: {
                select: { id: true, name: true, isActive: true },
              },
              plan: {
                select: { id: true, name: true, slug: true },
              },
            },
            where: {
              isActive: true,
            },
          },
          aviableCarriers: {
            include: {
              carrier: true,
            },
            where: {
              isActive: true,
            },
          },
          deliverySpeedOptions: {
            include: {
              deliverySpeed: true,
            },
            where: {
              isActive: true,
            },
          },
          packagingTypeOptions: {
            include: {
              packagingType: true,
            },
            where: {
              isActive: true,
            },
          },
        },
      });

      if (!location || location.isDeleted) {
        throw new NotFoundException('Office location not found');
      }

      return location;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get office location: ${error.message}`);
      throw new BadRequestException('Failed to get office location');
    }
  }

  async updateLocation(id: string, updateLocationDto: UpdateOfficeLocationDto): Promise<OfficeLocationResponseDto> {
    try {
      const existingLocation = await this.prisma.officeLocation.findUnique({
        where: { id },
      });

      if (!existingLocation || existingLocation.isDeleted) {
        throw new NotFoundException('Office location not found');
      }

      // Check if label is being updated and conflicts with another location
      if (updateLocationDto.label && updateLocationDto.label !== existingLocation.label) {
        const labelConflict = await this.prisma.officeLocation.findFirst({
          where: {
            label: updateLocationDto.label,
            isDeleted: false,
            id: { not: id },
          },
        });

        if (labelConflict) {
          throw new ConflictException(`Office location with label "${updateLocationDto.label}" already exists`);
        }
      }

      const location = await this.prisma.officeLocation.update({
        where: { id },
        data: updateLocationDto,
        include: {
          plans: {
            where: { isActive: true, isDeleted: false },
          },
          mailboxes: {
            where: { isActive: true },
            include: {
              workspace: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      return location;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Failed to update office location: ${error.message}`);
      throw new BadRequestException('Failed to update office location');
    }
  }

  async deleteLocation(id: string): Promise<void> {
    try {
      const location = await this.prisma.officeLocation.findUnique({
        where: { id },
        include: {
          plans: {
            where: { isActive: true, isDeleted: false },
          },
          mailboxes: {
            where: { isActive: true },
          },
        },
      });

      if (!location || location.isDeleted) {
        throw new NotFoundException('Office location not found');
      }

      // Check if location has active plans or mailboxes
      const hasActivePlans = location.plans && location.plans.length > 0;
      const hasActiveMailboxes = location.mailboxes && location.mailboxes.length > 0;

      if (hasActivePlans || hasActiveMailboxes) {
        throw new ConflictException('Cannot delete office location that has active plans or mailboxes');
      }

      await this.prisma.officeLocation.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          isActive: false,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Failed to delete office location: ${error.message}`);
      throw new BadRequestException('Failed to delete office location');
    }
  }

  async getActiveLocations() : Promise<ActiveOfficeLocationResponseDto[]> {
    try {
      return await this.prisma.officeLocation.findMany({
        where: {
          isActive: true,
          isDeleted: false,
        },
        select: {
          id: true,
          label: true,
          city: true,
          state: true,
          country: true,
          isActive: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [
          { country: 'asc' },
          { state: 'asc' },
          { city: 'asc' },
          { label: 'asc' },
        ],
      });
    } catch (error) {
      this.logger.error(`Failed to get active locations: ${error.message}`);
      throw new BadRequestException('Failed to get active locations');
    }
  }

  async getLocationStatistics(id: string) {
    try {
      const location = await this.getLocationById(id);

      const [totalPlans, totalMailboxes] = await Promise.all([
        this.prisma.plan.count({
          where: {
            officeLocationId: id,
            isActive: true,
            isDeleted: false,
          },
        }),
        this.prisma.mailbox.count({
          where: {
            officeLocationId: id,
            isActive: true,
          },
        }),
      ]);

      return {
        location: {
          id: location.id,
          label: location.label,
          city: location.city,
          state: location.state,
          country: location.country,
        },
        statistics: {
          totalActivePlans: totalPlans,
          totalActiveMailboxes: totalMailboxes,
          availableCarriers: location.aviableCarriers?.length || 0,
          deliveryOptions: location.deliverySpeedOptions?.length || 0,
          packagingOptions: location.packagingTypeOptions?.length || 0,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get location statistics: ${error.message}`);
      throw new BadRequestException('Failed to get location statistics');
    }
  }

}