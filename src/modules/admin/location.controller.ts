import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';
import {
  CreateOfficeLocationDto,
  UpdateOfficeLocationDto,
  OfficeLocationResponseDto,
  OfficeLocationQueryDto,
} from 'src/dtos/location.dto';
import { PoliciesGuard } from 'src/authorization/guards/policies.guard';
import { CheckPolicies } from 'src/authorization/decorators/check-policies.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { LocationService } from '../catalog/location.service';

@ApiTags('Office Locations')
@Controller('admin/locations')
@Public() // TODO: Remove this when auth is implemented
// @UseGuards(PoliciesGuard)
export class AdminLocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all office locations with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of office locations retrieved successfully',
    type: [OfficeLocationResponseDto],
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'country', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  // @CheckPolicies(ability => ability.can('read', 'OfficeLocation'))
  async getAllOfficeLocations(@Query() query: OfficeLocationQueryDto) {
    return await this.locationService.getLocations(query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active office locations' })
  @ApiResponse({
    status: 200,
    description: 'Active office locations retrieved successfully',
    type: [OfficeLocationResponseDto],
  })
  // @CheckPolicies(ability => ability.can('read', 'OfficeLocation'))
  async getActiveOfficeLocations() {
    return await this.locationService.getActiveLocations();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get office location by ID' })
  @ApiParam({ name: 'id', description: 'Office location ID' })
  @ApiResponse({
    status: 200,
    description: 'Office location retrieved successfully',
    type: OfficeLocationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Office location not found' })
  // @CheckPolicies(ability => ability.can('read', 'OfficeLocation'))
  async getOfficeLocationById(@Param('id') id: string) {
    return await this.locationService.getLocationById(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get office location statistics' })
  @ApiParam({ name: 'id', description: 'Office location ID' })
  @ApiResponse({
    status: 200,
    description: 'Office location statistics retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Office location not found' })
  // @CheckPolicies(ability => ability.can('read', 'OfficeLocation'))
  async getLocationStats(@Param('id') id: string) {
    return await this.locationService.getLocationStatistics(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new office location' })
  @ApiResponse({
    status: 201,
    description: 'Office location created successfully',
    type: OfficeLocationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Office location with this label already exists' })
  // @CheckPolicies(ability => ability.can('create', 'OfficeLocation'))
  async createOfficeLocation(@Body() data: CreateOfficeLocationDto) {
    return await this.locationService.createLocation(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update office location' })
  @ApiParam({ name: 'id', description: 'Office location ID' })
  @ApiResponse({
    status: 200,
    description: 'Office location updated successfully',
    type: OfficeLocationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Office location not found' })
  @ApiResponse({ status: 409, description: 'Office location with this label already exists' })
  // @CheckPolicies(ability => ability.can('update', 'OfficeLocation'))
  async updateOfficeLocation(
    @Param('id') id: string,
    @Body() data: UpdateOfficeLocationDto,
  ) {
    return await this.locationService.updateLocation(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete office location (soft delete)' })
  @ApiParam({ name: 'id', description: 'Office location ID' })
  @ApiResponse({
    status: 200,
    description: 'Office location deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Cannot delete location with active plans or addresses' })
  @ApiResponse({ status: 404, description: 'Office location not found' })
  // @CheckPolicies(ability => ability.can('delete', 'OfficeLocation'))
  async deleteOfficeLocation(@Param('id') id: string) {
    return await this.locationService.deleteLocation(id);
  }
}