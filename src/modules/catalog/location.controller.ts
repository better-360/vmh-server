import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';
import { LocationService } from './location.service';
import {
  OfficeLocationResponseDto,
  OfficeLocationQueryDto,
} from 'src/dtos/location.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Office Locations')
@Controller('locations')
@Public()
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
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
  async getAllOfficeLocations(@Query() query: OfficeLocationQueryDto) {
    return await this.locationService.getOfficeLocations(query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active office locations' })
  @ApiResponse({
    status: 200,
    description: 'Active office locations retrieved successfully',
    type: [OfficeLocationResponseDto],
  })
  async getActiveOfficeLocations() {
    return await this.locationService.getActiveOfficeLocations();
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
  async getOfficeLocationById(@Param('id') id: string) {
    return await this.locationService.getOfficeLocationById(id);
  }

}