import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ShippingSpeedService, PackagingOptionService, CarrierService } from './shipping.service';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Shipping Speeds')
@Public()
@Controller('shipping/speeds')
export class ShippingSpeedController {
  constructor(private readonly speedService: ShippingSpeedService) {}

  @Get()
  @ApiOperation({ summary: 'List all active shipping speed options' })
  @ApiResponse({ status: 200, description: 'List of shipping speeds.' })
  findAll() {
    return this.speedService.findAll();
  }

  @Get('location/:locationId')
  @ApiOperation({ summary: 'List active shipping speeds for a location' })
  @ApiParam({ name: 'locationId', description: 'Office location ID' })
  @ApiResponse({ status: 200, description: 'List of speeds.' })
  async findAssigned(@Param('locationId') locationId: string) {
    return await this.speedService.findAssigned(locationId);
  }
}

@Public()
@ApiTags('Packaging Options')
@Controller('shipping/packaging')
export class PackagingOptionController {
  constructor(private readonly packagingService: PackagingOptionService) {}

  
  @Get()
  @ApiOperation({ summary: 'List all active packaging options' })
  @ApiResponse({ status: 200, description: 'List of packaging options.' })
  findAll() {
    return this.packagingService.findAll();
  }

  @Get('location/:locationId')
  @ApiOperation({ summary: 'List active packaging options for a location' })
  @ApiParam({ name: 'locationId', description: 'Office location ID' })
  @ApiResponse({ status: 200, description: 'List of packaging options.' })
  findAssigned(@Param('locationId') locationId: string) {
    return this.packagingService.findAssigned(locationId);
  }
}

@Public()
@ApiTags('Carriers')
@Controller('shipping/carriers')
export class CarrierController {
  constructor(private readonly carrierService: CarrierService) {}

  @Get()
  @ApiOperation({ summary: 'List all active carriers' })
  @ApiResponse({ status: 200, description: 'List of carriers.' })
  findAll() {
    return this.carrierService.findAll();
  }

  @Get('location/:locationId')
  @ApiOperation({ summary: 'List active carriers for a location' })
  @ApiParam({ name: 'locationId', description: 'Office location ID' })
  @ApiResponse({ status: 200, description: 'List of carriers.' })
  findAssigned(@Param('locationId') locationId: string) {
    return this.carrierService.findAssigned(locationId);
  }
}
