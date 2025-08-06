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
import { PriceService } from './price.service';
import { 
  CreatePriceDto, 
  UpdatePriceDto, 
  PriceResponseDto 
} from 'src/dtos/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('prices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new price' })
  @ApiResponse({
    status: 201,
    description: 'Price created successfully',
    type: PriceResponseDto,
  })
  create(@Body() createPriceDto: CreatePriceDto): Promise<PriceResponseDto> {
    return this.priceService.create(createPriceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all prices' })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Prices retrieved successfully',
    type: [PriceResponseDto],
  })
  findAll(
    @Query('productId') productId?: string,
    @Query('active') active?: boolean,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<PriceResponseDto[]> {
    return this.priceService.findAll(productId, active, limit, offset);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active prices' })
  @ApiResponse({
    status: 200,
    description: 'Active prices retrieved successfully',
    type: [PriceResponseDto],
  })
  findActivePrices(): Promise<PriceResponseDto[]> {
    return this.priceService.findActivePrices();
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get prices by product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product prices retrieved successfully',
    type: [PriceResponseDto],
  })
  findByProduct(@Param('productId') productId: string): Promise<PriceResponseDto[]> {
    return this.priceService.findByProduct(productId);
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
    return this.priceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update price' })
  @ApiResponse({
    status: 200,
    description: 'Price updated successfully',
    type: PriceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Price not found' })
  update(
    @Param('id') id: string,
    @Body() updatePriceDto: UpdatePriceDto,
  ): Promise<PriceResponseDto> {
    return this.priceService.update(id, updatePriceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete price' })
  @ApiResponse({ status: 200, description: 'Price deleted successfully' })
  @ApiResponse({ status: 404, description: 'Price not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.priceService.remove(id);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Set price as default for its product' })
  @ApiResponse({
    status: 200,
    description: 'Price set as default successfully',
    type: PriceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Price not found' })
  setAsDefault(@Param('id') id: string): Promise<PriceResponseDto> {
    return this.priceService.setAsDefault(id);
  }

  @Post('recurring')
  @ApiOperation({ summary: 'Create a recurring price' })
  @ApiResponse({
    status: 201,
    description: 'Recurring price created successfully',
    type: PriceResponseDto,
  })
  createRecurringPrice(
    @Body() data: {
      productId: string;
      unitAmount: number;
      currency: string;
      interval: string;
      intervalCount?: number;
      name?: string;
    },
  ): Promise<PriceResponseDto> {
    return this.priceService.createRecurringPrice(
      data.productId,
      data.unitAmount,
      data.currency,
      data.interval,
      data.intervalCount,
      data.name,
    );
  }
}