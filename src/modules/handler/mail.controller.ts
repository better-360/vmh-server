import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Body, 
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
    ApiBody,
    ApiBearerAuth,
    ApiNotFoundResponse,
    ApiBadRequestResponse,
    ApiConflictResponse
  } from '@nestjs/swagger';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import {
    CreateMailDto,
    UpdateMailDto,
    PackageQueryDto,
    PackageResponseDto,
    MailType,
    PackageStatus,
  } from 'src/dtos/mail.dto';
  import { Public } from 'src/common/decorators/public.decorator';
import { MailService } from '../mail/mail.service';
  
  @ApiTags('Mail Handler Panel')
  @ApiBearerAuth()
  @Controller('handler/mail')
  @UseGuards(JwtAuthGuard)
  @Public()
  export class HandlerMailController {
    constructor(private readonly mailService: MailService) {}

    @Post()
    @ApiOperation({ 
      summary: 'Create a new package',
      description: 'Register a new package in the system without items'
    })
    @ApiBody({ 
      type: CreateMailDto,
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
    async createMail(@Body() createMailDto: CreateMailDto) {
      return this.mailService.create(createMailDto);
    }
  
    @Put(':id')
    @ApiOperation({ 
      summary: 'Update package',
      description: 'Update an existing package by ID'
    })
    @ApiParam({ name: 'id', description: 'Package ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiBody({ 
      type: UpdateMailDto,
      description: 'Package update data'
    })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Package updated successfully',
      type: PackageResponseDto
    })
    @ApiNotFoundResponse({ description: 'Package not found' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    async updatePackage(@Param('id') id: string, @Body() updateMailDto: UpdateMailDto) {
      return this.mailService.update(id, updateMailDto);
    }
  

    @Get('all')
    @ApiOperation({ 
      summary: 'Get all packages',
      description: 'Retrieve a paginated list of all packages with filtering options'
    })
    @ApiQuery({ name: 'mailboxId', required: false, type: String, description: 'Filter by mailbox ID' })
    @ApiQuery({ name: 'type', required: false, enum: MailType, description: 'Filter by package type' })
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
      return this.mailService.findAll(query);
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
      return this.mailService.findOne(id);
    }
  
    @Get('mailbox/:mailboxId')
    @ApiOperation({ 
      summary: 'Get packages by mailbox',
      description: 'Retrieve all packages for a specific mailbox'
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
      return this.mailService.findAll({ subscriptionId: workspaceAddressId, ...query });
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
      return this.mailService.findAll({ officeLocationId, ...query });
    }
  
    
  } 