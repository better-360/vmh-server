import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { 
  CreateProductDto, 
  UpdateProductDto, 
  ProductResponseDto 
} from 'src/dtos/product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    try {
      const product = await this.prisma.product.create({
        data: createProductDto,
        include: {
          prices: true,
          productFeature: {
            include: {
              feature: true,
            },
          },
        },
      });

      return product;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Product with this name already exists');
        }
      }
      throw error;
    }
  }

  async findAll(
    type?: string,
    isActive?: boolean,
    limit: number = 50,
    offset: number = 0,
  ): Promise<ProductResponseDto[]> {
    const where: Prisma.ProductWhereInput = {};
    
    if (type) where.type = type as any;
    if (isActive !== undefined) where.isActive = isActive;
    where.isDeleted = false;

    return this.prisma.product.findMany({
      where,
      include: {
        prices: {
          where: {
            isDeleted: false,
          },
          orderBy: {
            unit_amount: 'asc',
          },
        },
        productFeature: {
          include: {
            feature: true,
          },
        },
        planAddon: {
          include: {
            plan: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        prices: {
          where: {
            isDeleted: false,
          },
          include: {
            recurring: true,
          },
        },
        productFeature: {
          include: {
            feature: true,
          },
        },
        planAddon: {
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

    if (!product || product.isDeleted) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
        include: {
          prices: true,
          productFeature: {
            include: {
              feature: true,
            },
          },
        },
      });

      return product;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Product with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.product.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          isActive: false,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Product with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async findByType(type: string): Promise<ProductResponseDto[]> {
    return this.findAll(type, true);
  }

  async findAddons(): Promise<ProductResponseDto[]> {
    return this.findByType('ADDON');
  }

  async findProducts(): Promise<ProductResponseDto[]> {
    return this.findByType('PRODUCT');
  }

  async addFeature(productId: string, featureId: string, includedLimit?: number) {
    try {
      const productFeature = await this.prisma.productFeature.create({
        data: {
          productId,
          featureId,
          includedLimit,
        },
        include: {
          product: true,
          feature: true,
        },
      });

      return productFeature;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('This feature is already added to the product');
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('Invalid product or feature ID');
        }
      }
      throw error;
    }
  }

  async removeFeature(productId: string, featureId: string): Promise<void> {
    try {
      await this.prisma.productFeature.delete({
        where: {
          productId_featureId: {
            productId,
            featureId,
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Product feature relationship not found');
        }
      }
      throw error;
    }
  }
}