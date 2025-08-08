import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { 
  CreateProductDto, 
  UpdateProductDto, 
  ProductResponseDto 
} from 'src/dtos/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('products')
@Public()
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'type', required: false, enum: ['ADDON', 'PRODUCT', 'OTHER'] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: [ProductResponseDto],
  })
  findAll(
    @Query('type') type?: string,
    @Query('isActive') isActive?: boolean,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ProductResponseDto[]> {
    return this.productService.findAll(type, isActive, limit, offset);
  }

  @Get('addons')
  @ApiOperation({ summary: 'Get all addon products' })
  @ApiResponse({
    status: 200,
    description: 'Addon products retrieved successfully',
    type: [ProductResponseDto],
  })
  findAddons(): Promise<ProductResponseDto[]> {
    return this.productService.findAddons();
  }

  @Get('products')
  @ApiOperation({ summary: 'Get all standalone products' })
  @ApiResponse({
    status: 200,
    description: 'Standalone products retrieved successfully',
    type: [ProductResponseDto],
  })
  findProducts(): Promise<ProductResponseDto[]> {
    return this.productService.findProducts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.productService.remove(id);
  }

  @Post(':id/features/:featureId')
  @ApiOperation({ summary: 'Add feature to product' })
  @ApiResponse({ status: 201, description: 'Feature added to product successfully' })
  @ApiResponse({ status: 404, description: 'Product or feature not found' })
  addFeature(
    @Param('id') productId: string,
    @Param('featureId') featureId: string,
    @Body('includedLimit') includedLimit?: number,
  ) {
    return this.productService.addFeature(productId, featureId, includedLimit);
  }

  @Delete(':id/features/:featureId')
  @ApiOperation({ summary: 'Remove feature from product' })
  @ApiResponse({ status: 200, description: 'Feature removed from product successfully' })
  @ApiResponse({ status: 404, description: 'Product feature relationship not found' })
  removeFeature(
    @Param('id') productId: string,
    @Param('featureId') featureId: string,
  ): Promise<void> {
    return this.productService.removeFeature(productId, featureId);
  }
}