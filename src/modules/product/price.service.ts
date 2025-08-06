import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { 
  CreatePriceDto, 
  UpdatePriceDto, 
  PriceResponseDto 
} from 'src/dtos/product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PriceService {
  constructor(private prisma: PrismaService) {}

  async create(createPriceDto: CreatePriceDto): Promise<PriceResponseDto> {
    try {
      // If this is set as default, unset other default prices for the same product
      if (createPriceDto.isDefault) {
        await this.prisma.price.updateMany({
          where: {
            productId: createPriceDto.productId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      const price = await this.prisma.price.create({
        data: createPriceDto,
        include: {
          product: true,
          recurring: true,
        },
      });

      return price;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('Invalid product ID or recurring ID provided');
        }
      }
      throw error;
    }
  }

  async findAll(
    productId?: string,
    active?: boolean,
    limit: number = 50,
    offset: number = 0,
  ): Promise<PriceResponseDto[]> {
    const where: Prisma.PriceWhereInput = {};
    
    if (productId) where.productId = productId;
    if (active !== undefined) where.active = active;
    where.isDeleted = false;

    return this.prisma.price.findMany({
      where,
      include: {
        product: true,
        recurring: true,
        planAddons: {
          include: {
            plan: {
              include: {
                officeLocation: true,
              },
            },
          },
        },
      },
      orderBy: {
        unit_amount: 'asc',
      },
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<PriceResponseDto> {
    const price = await this.prisma.price.findUnique({
      where: { id },
      include: {
        product: true,
        recurring: true,
        planAddons: {
          include: {
            plan: {
              include: {
                officeLocation: true,
              },
            },
          },
        },
      },
    });

    if (!price || price.isDeleted) {
      throw new NotFoundException(`Price with ID ${id} not found`);
    }

    return price;
  }

  async update(id: string, updatePriceDto: UpdatePriceDto): Promise<PriceResponseDto> {
    try {
      // If setting as default, unset other defaults for the same product
      if (updatePriceDto.isDefault) {
        const existingPrice = await this.prisma.price.findUnique({
          where: { id },
        });

        if (existingPrice) {
          await this.prisma.price.updateMany({
            where: {
              productId: existingPrice.productId,
              isDefault: true,
              id: { not: id },
            },
            data: {
              isDefault: false,
            },
          });
        }
      }

      const price = await this.prisma.price.update({
        where: { id },
        data: updatePriceDto,
        include: {
          product: true,
          recurring: true,
        },
      });

      return price;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Price with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.price.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          active: false,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Price with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async findByProduct(productId: string): Promise<PriceResponseDto[]> {
    return this.findAll(productId, true);
  }

  async findActivePrices(): Promise<PriceResponseDto[]> {
    return this.findAll(undefined, true);
  }

  async setAsDefault(id: string): Promise<PriceResponseDto> {
    const price = await this.findOne(id);
    
    // Unset other default prices for the same product
    await this.prisma.price.updateMany({
      where: {
        productId: price.productId,
        isDefault: true,
        id: { not: id },
      },
      data: {
        isDefault: false,
      },
    });

    // Set this price as default
    return this.update(id, { isDefault: true });
  }

  async createRecurringPrice(
    productId: string,
    unitAmount: number,
    currency: string,
    interval: string,
    intervalCount: number = 1,
    name?: string,
  ): Promise<PriceResponseDto> {
    try {
      // First create the recurring configuration
      const recurring = await this.prisma.recurring.create({
        data: {
          interval: interval as any,
          intervalCount,
        },
      });

      // Then create the price with recurring
      return this.create({
        productId,
        unit_amount: unitAmount,
        currency,
        recurringId: recurring.id,
        name,
        // priceType field doesn't exist in schema
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('Invalid product ID provided');
        }
      }
      throw error;
    }
  }
}