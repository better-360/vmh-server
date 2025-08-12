import { AssignShippingSpeedToLocationDto, CreateShippingSpeedDto, UpdateShippingSpeedDto } from 'src/dtos/shipping-speed.dto';
import { AssignPackagingOptionToLocationDto, CreatePackagingOptionDto, UpdatePackagingOptionDto } from 'src/dtos/packaging-option.dto';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCarrierDto, UpdateCarrierDto } from 'src/dtos/carrier.dto';
import { ShippingSpeedService, PackagingOptionService, CarrierService } from 'src/modules/shipping/shipping.service';
import { Public } from 'src/common/decorators/public.decorator';
@Public()
@ApiTags('Admin Shipping Speeds')
@Controller('admin/shipping/speeds')
export class AdminShippingSpeedController {
  constructor(private readonly speedService: ShippingSpeedService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new shipping speed option' })
  @ApiCreatedResponse({ description: 'Shipping speed option created.' })
  @ApiBadRequestResponse({ description: 'Invalid payload.' })
  create(@Body() dto: CreateShippingSpeedDto) {
    return this.speedService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all active shipping speed options' })
  @ApiResponse({ status: 200, description: 'List of shipping speeds.' })
  findAll() {
    return this.speedService.findAll();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a shipping speed option by ID' })
  @ApiParam({ name: 'id', description: 'ID of the shipping speed option' })
  @ApiResponse({ status: 200, description: 'Shipping speed option updated.' })
  @ApiNotFoundResponse({ description: 'Option not found.' })
  update(@Param('id') id: string, @Body() dto: UpdateShippingSpeedDto) {
    return this.speedService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a shipping speed option by ID' })
  @ApiParam({ name: 'id', description: 'ID of the shipping speed option' })
  @ApiResponse({ status: 200, description: 'Shipping speed option removed.' })
  @ApiNotFoundResponse({ description: 'Option not found.' })
  remove(@Param('id') id: string) {
    return this.speedService.remove(id);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Assign a shipping speed to a location' })
  @ApiCreatedResponse({ description: 'Assignment created.' })
  @ApiBadRequestResponse({ description: 'Invalid assignment data.' })
  assign(@Body() dto: AssignShippingSpeedToLocationDto) {
    return this.speedService.assignToLocation(dto);
  }

  @Delete('remove-location/:id')
  @ApiOperation({ summary: 'Remove a shipping speed from a location' })
  @ApiParam({ name: 'id', description: 'RelationID' })
  @ApiResponse({ status: 200, description: 'Assignment removed.' })
  @ApiNotFoundResponse({ description: 'Assignment not found.' })
  removeFromLocation(
    @Param('id') relationId: string,
  ) {
    return this.speedService.removeFromLocation(relationId);
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
@ApiTags('Admin Packaging Options')
@Controller('admin/shipping/packaging')
export class AdminPackagingOptionController {
  constructor(private readonly packagingService: PackagingOptionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new packaging option' })
  @ApiCreatedResponse({ description: 'Packaging option created.' })
  @ApiBadRequestResponse({ description: 'Invalid payload.' })
  create(@Body() dto: CreatePackagingOptionDto) {
    return this.packagingService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all active packaging options' })
  @ApiResponse({ status: 200, description: 'List of packaging options.' })
  findAll() {
    return this.packagingService.findAll();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a packaging option by ID' })
  @ApiParam({ name: 'id', description: 'ID of the packaging option' })
  @ApiResponse({ status: 200, description: 'Packaging option updated.' })
  @ApiNotFoundResponse({ description: 'Option not found.' })
  update(@Param('id') id: string, @Body() dto: UpdatePackagingOptionDto) {
    return this.packagingService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a packaging option by ID' })
  @ApiParam({ name: 'id', description: 'ID of the packaging option' })
  @ApiResponse({ status: 200, description: 'Packaging option removed.' })
  @ApiNotFoundResponse({ description: 'Option not found.' })
  remove(@Param('id') id: string) {
    return this.packagingService.remove(id);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Assign a packaging option to a location' })
  @ApiCreatedResponse({ description: 'Assignment created.' })
  @ApiBadRequestResponse({ description: 'Invalid assignment data.' })
  assign(@Body() dto: AssignPackagingOptionToLocationDto) {
    return this.packagingService.assignToLocation(dto);
  }

  @Delete('location/:locationId/:packagingId')
  @ApiOperation({ summary: 'Remove a packaging option from a location' })
  @ApiParam({ name: 'locationId', description: 'Office location ID' })
  @ApiParam({ name: 'packagingId', description: 'Packaging option ID' })
  @ApiResponse({ status: 200, description: 'Assignment removed.' })
  @ApiNotFoundResponse({ description: 'Assignment not found.' })
  removeFromLocation(
    @Param('locationId') locationId: string,
    @Param('packagingId') packagingId: string,
  ) {
    return this.packagingService.removeFromLocation(locationId, packagingId);
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
@ApiTags('Admin Carriers Management')
@Controller('admin/shipping/carriers')
export class AdminCarrierController {
  constructor(private readonly carrierService: CarrierService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new carrier' })
  @ApiCreatedResponse({ description: 'Carrier created.' })
  @ApiBadRequestResponse({ description: 'Invalid payload.' })
  create(@Body() dto: CreateCarrierDto) {
    return this.carrierService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all active carriers' })
  @ApiResponse({ status: 200, description: 'List of carriers.' })
  findAll() {
    return this.carrierService.findAll();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a carrier by ID' })
  @ApiParam({ name: 'id', description: 'ID of the carrier' })
  @ApiResponse({ status: 200, description: 'Carrier updated.' })
  @ApiNotFoundResponse({ description: 'Carrier not found.' })
  update(@Param('id') id: string, @Body() dto: UpdateCarrierDto) {
    return this.carrierService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a carrier by ID' })
  @ApiParam({ name: 'id', description: 'ID of the carrier' })
  @ApiResponse({ status: 200, description: 'Carrier removed.' })
  @ApiNotFoundResponse({ description: 'Carrier not found.' })
  remove(@Param('id') id: string) {
    return this.carrierService.remove(id);
  }

  @Get('location/:locationId')
  @ApiOperation({ summary: 'List active carriers for a location' })
  @ApiParam({ name: 'locationId', description: 'Office location ID' })
  @ApiResponse({ status: 200, description: 'List of carriers.' })
  findAssigned(@Param('locationId') locationId: string) {
    return this.carrierService.findAssigned(locationId);
  }

  @Post('assign/:locationId/:carrierId')
  @ApiOperation({ summary: 'Assign a carrier to a location' })
  @ApiParam({ name: 'locationId', description: 'Office location ID' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiCreatedResponse({ description: 'Assignment created.' })
  @ApiBadRequestResponse({ description: 'Assignment invalid or duplicate.' })
  assignToLocation(
    @Param('locationId') locationId: string,
    @Param('carrierId') carrierId: string
  ) {
    return this.carrierService.assignToLocation(locationId, carrierId);
  }

  @Delete('remove-location/:id')
  @ApiOperation({ summary: 'Remove a carrier from a location' })
  @ApiParam({ name: 'id', description: 'Relation ID' })
  @ApiResponse({ status: 200, description: 'Assignment removed.' })
  @ApiNotFoundResponse({ description: 'Assignment not found.' })
  removeFromLocation(
    @Param('id') relationId: string,
  ) {
    return this.carrierService.removeFromLocation(relationId);
  }
}
