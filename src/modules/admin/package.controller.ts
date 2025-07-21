import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Delete, 
    Body, 
    Param, 
    Query, 
    UseGuards,
    HttpStatus,
    Patch
  } from '@nestjs/common';
  import { 
    ApiTags, 
    ApiOperation, 
    ApiResponse, 
    ApiParam, 
    ApiQuery, 
    ApiBody,
    ApiBearerAuth,
    ApiNotFoundResponse,
    ApiBadRequestResponse,
    ApiConflictResponse
  } from '@nestjs/swagger';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import {
    CreatePackageDto,
    UpdatePackageDto,
    PackageQueryDto,
    PackageResponseDto,
    CreatePackageItemDto,
    UpdatePackageItemDto,
    PackageItemQueryDto,
    PackageItemResponseDto,
    BulkCreatePackageItemsDto,
    BulkUpdatePackageItemsDto,
    PackageType,
    PackageStatus,
  } from 'src/dtos/package.dto';
  import { Public } from 'src/common/decorators/public.decorator';
import { PackageService } from '../package/package.service';
  
  @ApiTags('Admin Package Management')
  @ApiBearerAuth()
  @Controller('admin/packages')
  @UseGuards(JwtAuthGuard)
  @Public()
  export class AdminPackageController {
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
  
    @Get('workspace-address/:workspaceAddressId')
    @ApiOperation({ 
      summary: 'Get packages by workspace address',
      description: 'Retrieve all packages for a specific workspace address'
    })
    @ApiParam({ name: 'workspaceAddressId', description: 'Workspace address ID', example: '123e4567-e89b-12d3-a456-426614174000' })
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
    async getPackagesByWorkspaceAddress(
      @Param('workspaceAddressId') workspaceAddressId: string,
      @Query() query: PackageQueryDto
    ) {
      return this.packageService.getPackagesByWorkspaceAddressId(workspaceAddressId, query);
    }
  
    @Get('office-location/:officeLocationId')
    @ApiOperation({ 
      summary: 'Get packages by office location',
      description: 'Retrieve all packages for a specific office location'
    })
    @ApiParam({ name: 'officeLocationId', description: 'Office location ID', example: '123e4567-e89b-12d3-a456-426614174000' })
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
    async getPackagesByOfficeLocation(
      @Param('officeLocationId') officeLocationId: string,
      @Query() query: PackageQueryDto
    ) {
      return this.packageService.getPackagesByOfficeLocationId(officeLocationId, query);
    }
  
    @Post('create-package')
    @ApiOperation({ 
      summary: 'Create a new package',
      description: 'Register a new package in the system without items'
    })
    @ApiBody({ 
      type: CreatePackageDto,
      description: 'Package creation data'
    })
    @ApiResponse({ 
      status: HttpStatus.CREATED, 
      description: 'Package created successfully',
      type: PackageResponseDto
    })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiNotFoundResponse({ description: 'Workspace address or office location not found' })
    @ApiConflictResponse({ description: 'Package with this STE number already exists' })
    async createPackage(@Body() createPackageDto: CreatePackageDto) {
      return this.packageService.createPackage(createPackageDto);
    }
  
    @Put(':id')
    @ApiOperation({ 
      summary: 'Update package',
      description: 'Update an existing package by ID'
    })
    @ApiParam({ name: 'id', description: 'Package ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiBody({ 
      type: UpdatePackageDto,
      description: 'Package update data'
    })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Package updated successfully',
      type: PackageResponseDto
    })
    @ApiNotFoundResponse({ description: 'Package not found' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    async updatePackage(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
      return this.packageService.updatePackage(id, updatePackageDto);
    }
  
    // =====================
    // PACKAGE ITEM ENDPOINTS
    // =====================
  
    @Get('items/all')
    @ApiOperation({ 
      summary: 'Get all package items',
      description: 'Retrieve a paginated list of all package items with filtering options'
    })
    @ApiQuery({ name: 'packageId', required: false, type: String, description: 'Filter by package ID' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by item name or description' })
    @ApiQuery({ name: 'isShereded', required: false, type: Boolean, description: 'Filter by shredded status' })
    @ApiQuery({ name: 'isForwarded', required: false, type: Boolean, description: 'Filter by forwarded status' })
    @ApiQuery({ name: 'isDeleted', required: false, type: Boolean, description: 'Filter by deleted status (default: false)' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page (default: 10)' })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Package items retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          data: { 
            type: 'array', 
            items: { 
              $ref: '#/components/schemas/PackageItemResponseDto'
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
    async getPackageItems(@Query() query: PackageItemQueryDto) {
      return this.packageService.getPackageItems(query);
    }
  
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
  
    @Post('items')
    @ApiOperation({ 
      summary: 'Create package item',
      description: 'Add a new item to an existing package'
    })
    @ApiBody({ 
      type: CreatePackageItemDto,
      description: 'Package item creation data'
    })
    @ApiResponse({ 
      status: HttpStatus.CREATED, 
      description: 'Package item created successfully',
      type: PackageItemResponseDto
    })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiNotFoundResponse({ description: 'Package not found' })
    async createPackageItem(@Body() createPackageItemDto: CreatePackageItemDto) {
      return this.packageService.createPackageItem(createPackageItemDto);
    }
  
    @Post('items/bulk')
    @ApiOperation({ 
      summary: 'Bulk create package items',
      description: 'Add multiple items to a package in a single request'
    })
    @ApiBody({ 
      type: BulkCreatePackageItemsDto,
      description: 'Bulk package items creation data'
    })
    @ApiResponse({ 
      status: HttpStatus.CREATED, 
      description: 'Package items created successfully',
      type: [PackageItemResponseDto]
    })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiNotFoundResponse({ description: 'Package not found' })
    async bulkCreatePackageItems(@Body() bulkCreatePackageItemsDto: BulkCreatePackageItemsDto) {
      return this.packageService.bulkCreatePackageItems(bulkCreatePackageItemsDto);
    }
  
    @Put('items/:id')
    @ApiOperation({ 
      summary: 'Update package item',
      description: 'Update an existing package item by ID'
    })
    @ApiParam({ name: 'id', description: 'Package item ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiBody({ 
      type: UpdatePackageItemDto,
      description: 'Package item update data'
    })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Package item updated successfully',
      type: PackageItemResponseDto
    })
    @ApiNotFoundResponse({ description: 'Package item not found' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    async updatePackageItem(@Param('id') id: string, @Body() updatePackageItemDto: UpdatePackageItemDto) {
      return this.packageService.updatePackageItem(id, updatePackageItemDto);
    }
  
    @Put('items/bulk')
    @ApiOperation({ 
      summary: 'Bulk update package items',
      description: 'Update multiple package items in a single request'
    })
    @ApiBody({ 
      type: BulkUpdatePackageItemsDto,
      description: 'Bulk package items update data'
    })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Package items updated successfully',
      type: [PackageItemResponseDto]
    })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    async bulkUpdatePackageItems(@Body() bulkUpdatePackageItemsDto: BulkUpdatePackageItemsDto) {
      return this.packageService.bulkUpdatePackageItems(bulkUpdatePackageItemsDto);
    }
  
    @Delete('items/:id')
    @ApiOperation({ 
      summary: 'Delete package item',
      description: 'Soft delete a package item by ID'
    })
    @ApiParam({ name: 'id', description: 'Package item ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Package item deleted successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Package item deleted successfully' }
        }
      }
    })
    @ApiNotFoundResponse({ description: 'Package item not found' })
    async deletePackageItem(@Param('id') id: string) {
      return this.packageService.deletePackageItem(id);
    }
  
    @Patch('items/:id/shred')
    @ApiOperation({ 
      summary: 'Mark package item as shredded',
      description: 'Mark a specific package item as shredded'
    })
    @ApiParam({ name: 'id', description: 'Package item ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Package item marked as shredded successfully',
      type: PackageItemResponseDto
    })
    @ApiNotFoundResponse({ description: 'Package item not found' })
    async markPackageItemAsShredded(@Param('id') id: string) {
      return this.packageService.markPackageItemAsShredded(id);
    }
  
    @Patch('items/:id/forward')
    @ApiOperation({ 
      summary: 'Mark package item as forwarded',
      description: 'Mark a specific package item as forwarded'
    })
    @ApiParam({ name: 'id', description: 'Package item ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Package item marked as forwarded successfully',
      type: PackageItemResponseDto
    })
    @ApiNotFoundResponse({ description: 'Package item not found' })
    async markPackageItemAsForwarded(@Param('id') id: string) {
      return this.packageService.markPackageItemAsForwarded(id);
    }
  } 