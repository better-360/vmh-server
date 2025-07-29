import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreateShippingSpeedDto,
  UpdateShippingSpeedDto,
  AssignShippingSpeedToLocationDto,
} from '../../dtos/shipping-speed.dto';
import {
  CreatePackagingOptionDto,
  UpdatePackagingOptionDto,
  AssignPackagingOptionToLocationDto,
} from '../../dtos/packaging-option.dto';
import { CreateCarrierDto, UpdateCarrierDto } from 'src/dtos/carrier.dto';

/**
 * Service for managing shipping (delivery) speed options.
 */
@Injectable()
export class ShippingSpeedService {
  private readonly logger = new Logger(ShippingSpeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateShippingSpeedDto) {
    try {
      return await this.prisma.deliverySpeedOption.create({ data: dto });
    } catch (error) {
      this.logger.error('Failed to create shipping speed option', error);
      throw new BadRequestException('Unable to create shipping speed option.');
    }
  }

  async findAll() {
    try {
      return await this.prisma.deliverySpeedOption.findMany({
        where: { isActive: true, deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error('Failed to fetch shipping speed options', error);
      throw new BadRequestException('Unable to retrieve shipping speed options.');
    }
  }

  async update(id: string, dto: UpdateShippingSpeedDto) {
    const existing = await this.prisma.deliverySpeedOption.findUnique({ where: { id } });
    if (!existing) {
      this.logger.warn(`Shipping speed option not found: ${id}`);
      throw new NotFoundException('Shipping speed option not found.');
    }
    try {
      return await this.prisma.deliverySpeedOption.update({ where: { id }, data: dto });
    } catch (error) {
      this.logger.error(`Failed to update shipping speed option ${id}`, error);
      throw new BadRequestException('Unable to update shipping speed option.');
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.deliverySpeedOption.findUnique({ where: { id } });
    if (!existing) {
      this.logger.warn(`Shipping speed option not found: ${id}`);
      throw new NotFoundException('Shipping speed option not found.');
    }
    try {
      return await this.prisma.deliverySpeedOption.update({
        where: { id },
        data: { isActive: false, deletedAt: new Date() },
      });
    } catch (error) {
      this.logger.error(`Failed to delete shipping speed option ${id}`, error);
      throw new BadRequestException('Unable to delete shipping speed option.');
    }
  }

  async assignToLocation(dto: AssignShippingSpeedToLocationDto) {
    const exists=await this.prisma.deliverySpeedPlanMapping.findUnique({
      where:{
        deliverySpeedId_officeLocationId:{
          deliverySpeedId:dto.deliverySpeedId,
          officeLocationId:dto.officeLocationId
        }
      }
    })
    if(exists){
      throw new ConflictException('Delivery Speed Already Assigned')
    }
    try {

      return await this.prisma.deliverySpeedPlanMapping.create({
        data: {
          deliverySpeedId: dto.deliverySpeedId,
          officeLocationId: dto.officeLocationId,
          price: dto.price ?? 0,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (error) {
      this.logger.error('Failed to assign shipping speed to location', error);
      throw new BadRequestException('Unable to assign shipping speed to location.');
    }
  }

  async removeFromLocation(relationId:string) {
    const mapping = await this.prisma.deliverySpeedPlanMapping.findUnique({
      where: { id:relationId},
    });
   
    if (!mapping) {
      throw new NotFoundException('Shipping speed not found for this location.');
    }
    try {
      return await this.prisma.deliverySpeedPlanMapping.delete({where: { id: mapping.id }});
    } catch (error) {
      this.logger.error('Failed to remove shipping speed from location', error);
      throw new BadRequestException('Unable to remove shipping speed from location.');
    }
  }

  async findAssigned(locationId: string) {
    try {
      const assigned= await this.prisma.deliverySpeedPlanMapping.findMany({
        where: { officeLocationId: locationId, isActive: true, deletedAt: null },
        include: { deliverySpeed: true },
      });
      return assigned;
    } catch (error) {
      this.logger.error('Failed to fetch assigned shipping speeds', error);
      throw new BadRequestException('Unable to retrieve assigned shipping speeds.');
    }
  }
}

/**
 * Service for managing packaging options.
 */
@Injectable()
export class PackagingOptionService {
  private readonly logger = new Logger(PackagingOptionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePackagingOptionDto) {
    try {
      return await this.prisma.packagingTypeOption.create({ data: dto });
    } catch (error) {
      this.logger.error('Failed to create packaging option', error);
      throw new BadRequestException('Unable to create packaging option.');
    }
  }

  async findAll() {
    try {
      return await this.prisma.packagingTypeOption.findMany({ where: { isActive: true, deletedAt: null } });
    } catch (error) {
      this.logger.error('Failed to fetch packaging options', error);
      throw new BadRequestException('Unable to retrieve packaging options.');
    }
  }

  async update(id: string, dto: UpdatePackagingOptionDto) {
    const existing = await this.prisma.packagingTypeOption.findUnique({ where: { id } });
    if (!existing) {
      this.logger.warn(`Packaging option not found: ${id}`);
      throw new NotFoundException('Packaging option not found.');
    }
    try {
      return await this.prisma.packagingTypeOption.update({ where: { id }, data: dto });
    } catch (error) {
      this.logger.error(`Failed to update packaging option ${id}`, error);
      throw new BadRequestException('Unable to update packaging option.');
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.packagingTypeOption.findUnique({ where: { id } });
    if (!existing) {
      this.logger.warn(`Packaging option not found: ${id}`);
      throw new NotFoundException('Packaging option not found.');
    }
    try {
      return await this.prisma.packagingTypeOption.update({
        where: { id },
        data: { isActive: false, deletedAt: new Date() },
      });
    } catch (error) {
      this.logger.error(`Failed to delete packaging option ${id}`, error);
      throw new BadRequestException('Unable to delete packaging option.');
    }
  }

  async assignToLocation(dto: AssignPackagingOptionToLocationDto) {
    try {
      return await this.prisma.packagingTypePlanMapping.create({
        data: {
          packagingTypeId: dto.packagingTypeId,
          officeLocationId: dto.officeLocationId,
          price: dto.price ?? 0,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (error) {
      this.logger.error('Failed to assign packaging option to location', error);
      throw new BadRequestException('Unable to assign packaging option to location.');
    }
  }

  async removeFromLocation(locationId: string, packagingId: string) {
    const mapping = await this.prisma.packagingTypePlanMapping.findFirst({
      where: { officeLocationId: locationId, packagingTypeId: packagingId },
    });
    if (!mapping) {
      this.logger.warn(`Packaging option ${packagingId} not assigned to location ${locationId}`);
      throw new NotFoundException('Packaging option not found for this location.');
    }
    try {
      return await this.prisma.packagingTypePlanMapping.delete({where: { id: mapping.id }});
    } catch (error) {
      this.logger.error('Failed to remove packaging option from location', error);
      throw new BadRequestException('Unable to remove packaging option from location.');
    }
  }

  async findAssigned(locationId: string) {
    try {
      return await this.prisma.packagingTypePlanMapping.findMany({
        where: { officeLocationId: locationId, isActive: true, deletedAt: null },
        include: { packagingType: true },
      });
    } catch (error) {
      this.logger.error('Failed to fetch assigned packaging options', error);
      throw new BadRequestException('Unable to retrieve assigned packaging options.');
    }
  }
}

/**
 * Service for managing carriers and their availability per location.
 */
@Injectable()
export class CarrierService {
  private readonly logger = new Logger(CarrierService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCarrierDto) {
    try {
      return await this.prisma.carrier.create({ data: dto });
    } catch (error) {
      this.logger.error('Failed to create carrier', error);
      throw new BadRequestException('Unable to create carrier.');
    }
  }

  async findAll() {
    try {
      return await this.prisma.carrier.findMany({ where: { isActive: true, deletedAt: null } });
    } catch (error) {
      this.logger.error('Failed to fetch carriers', error);
      throw new BadRequestException('Unable to retrieve carriers.');
    }
  }

  async update(id: string, dto: UpdateCarrierDto) {
    const existing = await this.prisma.carrier.findUnique({ where: { id } });
    if (!existing) {
      this.logger.warn(`Carrier not found: ${id}`);
      throw new NotFoundException('Carrier not found.');
    }
    try {
      return await this.prisma.carrier.update({ where: { id }, data: dto });
    } catch (error) {
      this.logger.error(`Failed to update carrier ${id}`, error);
      throw new BadRequestException('Unable to update carrier.');
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.carrier.findUnique({ where: { id } });
    if (!existing) {
      this.logger.warn(`Carrier not found: ${id}`);
      throw new NotFoundException('Carrier not found.');
    }
    try {
      return await this.prisma.carrier.update({
        where: { id },
        data: { isActive: false, deletedAt: new Date() },
      });
    } catch (error) {
      this.logger.error(`Failed to delete carrier ${id}`, error);
      throw new BadRequestException('Unable to delete carrier.');
    }
  }

  async findAssigned(locationId: string) {
    try {
      return await this.prisma.carrierAvailability.findMany({
        where: { officeLocationId: locationId, isActive: true },
        include: { carrier: true },
      });
    } catch (error) {
      this.logger.error('Failed to fetch assigned carriers', error);
      throw new BadRequestException('Unable to retrieve assigned carriers.');
    }
  }

  async assignToLocation(locationId: string, carrierId: string) {
    const exists = await this.prisma.carrierAvailability.findUnique({
      where: { carrierId_officeLocationId: { carrierId, officeLocationId: locationId } },
    });
    if (exists) {
      this.logger.warn(`Carrier ${carrierId} already assigned to location ${locationId}`);
      throw new ConflictException('Carrier already assigned to this location.');
    }
    try {
      return await this.prisma.carrierAvailability.create({ data: { officeLocationId: locationId, carrierId } });
    } catch (error) {
      this.logger.error('Failed to assign carrier to location', error);
      throw new BadRequestException('Unable to assign carrier to location.');
    }
  }

  async removeFromLocation(relationId: string) {
    const mapping = await this.prisma.carrierAvailability.findUnique({
      where: { id:relationId },
    });
    if (!mapping) {
      this.logger.warn(`Carrier location not assigned`);
      throw new NotFoundException('Carrier not assigned to this location.');
    }
    try {
      return await this.prisma.carrierAvailability.delete({ where: { id: mapping.id } });
    } catch (error) {
      this.logger.error('Failed to remove carrier from location', error);
      throw new BadRequestException('Unable to remove carrier from location.');
    }
  }
}
