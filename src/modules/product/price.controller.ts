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
import { PriceService } from './price.service';
import { 
  CreatePriceDto, 
  PriceResponseDto,
  ProductResponseDto
} from 'src/dtos/items.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Public()
@ApiTags('Price Management')
@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Post(':productId')
  @ApiOperation({ summary: 'Create a new price' })
  @ApiResponse({
    status: 201,
    description: 'Price created successfully',
    type: ProductResponseDto,
  })
  create(@Body() createPriceDto: CreatePriceDto, @Param('productId') productId: string) {
    return this.priceService.createPrice(productId, createPriceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all prices' })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Prices retrieved successfully',
    type: [PriceResponseDto],
  })
  findAll(
    @Query('productId') productId?: string,
    @Query('active') active?: boolean,
  ): Promise<PriceResponseDto[]> {
    return this.priceService.findAllPrices(productId, active);
  }



  @Get('product/:productId')
  @ApiOperation({ summary: 'Get prices by product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product prices retrieved successfully',
    type: [PriceResponseDto],
  })
  findByProduct(@Param('productId') productId: string): Promise<PriceResponseDto[]> {
    return this.priceService.findAllPrices(productId, true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get price by ID' })
  @ApiResponse({
    status: 200,
    description: 'Price retrieved successfully',
    type: PriceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Price not found' })
  findOne(@Param('id') id: string): Promise<PriceResponseDto> {
    return this.priceService.findPriceById(id);
  }


  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete price' })
  @ApiResponse({ status: 200, description: 'Price deleted successfully' })
  @ApiResponse({ status: 404, description: 'Price not found' })
  deletePrice(@Param('id') id: string) {
    return this.priceService.deletePrice(id);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Set price as default for its product' })
  @ApiResponse({
    status: 200,
    description: 'Price set as default successfully',
    type: PriceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Price not found' })
  setAsDefault(@Param('id') id: string) {
    return this.priceService.setAsDefault(id);
  }

}