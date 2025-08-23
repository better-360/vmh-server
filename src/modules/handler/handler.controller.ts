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
    Patch,
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
  MailQueryDto,
  PackageResponseDto,
  MailType,
  PackageStatus,
} from 'src/dtos/mail.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { MailService } from '../mail/mail.service';
import { LocationService } from '../catalog/location.service';
import { MailboxService } from '../mailbox/mailbox.service';
import { OfficeLocationResponseDto } from 'src/dtos/location.dto';
import { MailboxResponseDto } from 'src/dtos/mailbox.dto';
import { WorkspaceService } from '../workspace/workspace.service';
import { UpdateActionStatusDto,CreateMailActionDto,CompleteForwardDto, CancelForwardDto,QueryMailActionsDto } from 'src/dtos/mail-actions.dto';
import { MailActionsService } from '../actions/actions.service';

  
  @ApiTags('Mail Handler Panel')
  @ApiBearerAuth()
  @Controller('handler')
  @UseGuards(JwtAuthGuard)
  @Public()
  export class MailHandlerController {
  constructor(
    private readonly mailService: MailService,
    private readonly locationService: LocationService,
    private readonly mailboxService: MailboxService,
    private readonly workspaceService: WorkspaceService,
    private readonly actionService: MailActionsService,
    ) {}

  // 1. Office Location Selection
  @Get('office-locations')
  @ApiOperation({ 
    summary: 'Get all active office locations for handler',
    description: 'Handler selects which office location to work with'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Active office locations retrieved successfully',
    type: [OfficeLocationResponseDto]
  })
  async getOfficeLocations() {
    return this.locationService.getActiveLocations();
  }

    @Get('workspaces')
    @ApiOperation({ summary: 'Get all workspaces' })
    @ApiResponse({
        status: 200,
        description: 'List of workspaces retrieved successfully',
      })
    getAllWorkspaces() {
        return this.workspaceService.getAllWorkspaces();
      }
    

  @Get('mailboxes/:officeLocationId')
  @ApiOperation({ 
    summary: 'Get mailboxes by office location',
    description: 'Get mailboxes by office location'
  })
  @ApiParam({ name: 'officeLocationId', description: 'Office location ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Mailboxes retrieved successfully',
    type: [MailboxResponseDto]
  })
  async getMailboxesByOfficeLocation(@Param('officeLocationId') officeLocationId: string) {
    return this.mailboxService.findByOfficeLocation(officeLocationId);
  }
  // 2. STE Number Lookup for Mailboxes
  @Get('mailboxes/by-ste/:steNumber')
  @ApiOperation({ 
    summary: 'Find mailboxes by STE number',
    description: 'Search for mailboxes using STE number to identify the correct recipient'
  })
  @ApiParam({ name: 'steNumber', description: 'STE number to search for', example: 'abc123' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Mailboxes found for the STE number',
    type: [MailboxResponseDto]
  })
  @ApiNotFoundResponse({ description: 'No mailboxes found for this STE number' })
  async getMailboxesBySteNumber(@Param('steNumber') steNumber: string) {
    return this.mailboxService.findBySteNumber(steNumber);
  }

  // 4. Create Mail Package
  @Post('mails/new')
  @ApiOperation({ 
    summary: 'Create a new mail package',
    description: 'Register a new mail package in the system after selecting office location, mailbox and recipient'
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
  
  // 5. Update Mail
  @Put(':id')
  @ApiOperation({ 
    summary: 'Update mail',
    description: 'Update an existing mail by ID'
  })
  @ApiParam({ name: 'id', description: 'Mail ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ 
    type: UpdateMailDto,
    description: 'Mail update data'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Mail updated successfully',
    type: PackageResponseDto
  })
  @ApiNotFoundResponse({ description: 'Mail not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async updateMail(@Param('id') id: string, @Body() updateMailDto: UpdateMailDto) {
    return this.mailService.update(id, updateMailDto);
  }
  

  // 6. Query and Listing Operations
  @Get('all')
  @ApiOperation({ 
    summary: 'Get all mail packages',
    description: 'Retrieve a paginated list of all mail packages with filtering options'
  })
    @ApiQuery({ name: 'mailboxId', required: false, type: String, description: 'Filter by mailbox ID' })
    @ApiQuery({ name: 'type', required: false, enum: MailType, description: 'Filter by package type' })
    @ApiQuery({ name: 'status', required: false, enum: PackageStatus, description: 'Filter by package status' })
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
    async getMails(@Query() query: MailQueryDto) {
      // Internal handler endpoint - deprecated, use admin endpoints instead
      throw new Error('This internal endpoint is deprecated. Use /admin/mails instead');
    }
  
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get mail package by ID',
    description: 'Retrieve a specific mail package with all its items and related information'
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
  
      @Get('mailbox/:mailboxId/mails')
  @ApiOperation({ 
    summary: 'Get mail packages by mailbox',
    description: 'Retrieve all mail packages for a specific mailbox'
  })
  @ApiParam({ name: 'mailboxId', description: 'Mailbox ID', example: '123e4567-e89b-12d3-a456-426614174000' })
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
  async getPackagesByMailbox(
    @Param('mailboxId') mailboxId: string,
    @Query() query: MailQueryDto
  ) {
    // Internal handler endpoint - deprecated, use admin endpoints instead
    throw new Error('This internal endpoint is deprecated. Use /admin/mails instead');
  }
  
  @Get(':officeLocationId/mails')
  @ApiOperation({ 
    summary: 'Get mail packages by office location',
    description: 'Retrieve all mail packages for a specific office location'
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

    async getMailsByOfficeLocation(
      @Param('officeLocationId') officeLocationId: string,
      @Query() query: MailQueryDto
    ) {
      // Internal handler endpoint - deprecated, use admin endpoints instead
      throw new Error('This internal endpoint is deprecated. Use /admin/mails instead');
    }
  

        // Detay
  @Get('mail-actions/:id')
  async get(@Param('id') id: string) {
    return this.actionService.getActionById(id);
  }

  // Panel listesi
  @Get('mail-actions/search')
  async list(@Query() q: QueryMailActionsDto) {
    console.log('Listing mail actions with query:', q);
    return this.actionService.listActions(q);
  }



  // Genel status update
  @Patch('mail-actions/:id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateActionStatusDto) {
    return this.actionService.updateActionStatus(id, dto);
  }

  // Forward tamamla
  @Patch('mail-actions/:id/forward/complete')
  async completeForward(@Param('id') id: string, @Body() body: CompleteForwardDto) {
    return this.actionService.completeForward(id, body);
  }

  // Forward iptal
  @Patch('mail-actions/:id/forward/cancel')
  async cancelForward(@Param('id') id: string, @Body() body: CancelForwardDto) {
    return this.actionService.cancelForward(id, body);
  }
    
  } 