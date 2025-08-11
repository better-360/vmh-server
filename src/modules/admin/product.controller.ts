import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProductService } from '../product/product.service';
import { 
  CreateProductDto, 
  UpdateProductDto, 
  ProductResponseDto 
} from 'src/dtos/items.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Admin Product Management')
@Public()
@Controller('admin/products')
export class AdminProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productService.createProduct(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'type', required: false, enum: ['ADDON', 'PRODUCT', 'OTHER'] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: [ProductResponseDto],
  })
  findAll(
    @Query('type') type?: string,
    @Query('isActive') isActive?: boolean,
  ): Promise<ProductResponseDto[]> {
    return this.productService.findAll(type, isActive);
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
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto){
    return this.productService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  deleteProduct(@Param('id') id: string){
    return this.productService.deleteProduct(id);
  }

}