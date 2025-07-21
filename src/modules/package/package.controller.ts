import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBearerAuth,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { PackageService } from './package.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {  
  PackageQueryDto,
  PackageResponseDto,
  PackageItemResponseDto,
  PackageType,
  PackageStatus,
} from 'src/dtos/package.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Package Management')
@ApiBearerAuth()
@Controller('packages')
@UseGuards(JwtAuthGuard)
@Public()
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  // =====================
  // PACKAGE ENDPOINTS
  // =====================

  @Get('all')
  @ApiOperation({ 
    summary: 'Get all packages',
    description: 'Retrieve a paginated list of all packages with filtering options'
  })
  @ApiQuery({ name: 'workspaceAddressId', required: false, type: String, description: 'Filter by workspace address ID' })
  @ApiQuery({ name: 'officeLocationId', required: false, type: String, description: 'Filter by office location ID' })
  @ApiQuery({ name: 'type', required: false, enum: PackageType, description: 'Filter by package type' })
  @ApiQuery({ name: 'status', required: false, enum: PackageStatus, description: 'Filter by package status' })
  @ApiQuery({ name: 'steNumber', required: false, type: String, description: 'Filter by STE number' })
  @ApiQuery({ name: 'senderName', required: false, type: String, description: 'Filter by sender name' })
  @ApiQuery({ name: 'carrier', required: false, type: String, description: 'Filter by carrier' })
  @ApiQuery({ name: 'isShereded', required: false, type: Boolean, description: 'Filter by shredded status' })
  @ApiQuery({ name: 'isForwarded', required: false, type: Boolean, description: 'Filter by forwarded status' })
  @ApiQuery({ name: 'receivedAtStart', required: false, type: String, description: 'Filter by received date start (YYYY-MM-DD)' })
  @ApiQuery({ name: 'receivedAtEnd', required: false, type: String, description: 'Filter by received date end (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page (default: 10)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Packages retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { 
          type: 'array', 
          items: { 
            $ref: '#/components/schemas/PackageResponseDto'
          }
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' }
          }
        }
      }
    }
  })
  async getPackages(@Query() query: PackageQueryDto) {
    return this.packageService.getPackages(query);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get package by ID',
    description: 'Retrieve a specific package with all its items and related information'
  })
  @ApiParam({ name: 'id', description: 'Package ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Package found',
    type: PackageResponseDto
  })
  @ApiNotFoundResponse({ description: 'Package not found' })
  async getPackageById(@Param('id') id: string) {
    return this.packageService.getPackageById(id);
  }

  // =====================
  // PACKAGE ITEM ENDPOINTS
  // =====================

  @Get('items/:id')
  @ApiOperation({ 
    summary: 'Get package item by ID',
    description: 'Retrieve a specific package item with its package details'
  })
  @ApiParam({ name: 'id', description: 'Package item ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Package item found',
    type: PackageItemResponseDto
  })
  @ApiNotFoundResponse({ description: 'Package item not found' })
  async getPackageItemById(@Param('id') id: string) {
    return this.packageService.getPackageItemById(id);
  }

  @Get(':packageId/items')
  @ApiOperation({ 
    summary: 'Get items by package ID',
    description: 'Retrieve all items belonging to a specific package'
  })
  @ApiParam({ name: 'packageId', description: 'Package ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Package items retrieved successfully',
    type: [PackageItemResponseDto]
  })
  async getItemsByPackageId(@Param('packageId') packageId: string) {
    return this.packageService.getItemsByPackageId(packageId);
  }

} 