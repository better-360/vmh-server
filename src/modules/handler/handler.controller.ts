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
    Delete,
  } from '@nestjs/common';
  import { 
    ApiTags, 
    ApiOperation, 
    ApiResponse, 
    ApiParam, 
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
  PackageResponseDto
} from 'src/dtos/mail.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { MailService } from '../mail/mail.service';
import { MailboxService } from '../mailbox/mailbox.service';
import { MailboxResponseDto } from 'src/dtos/mailbox.dto';
import { UpdateActionStatusDto,CompleteForwardDto, CancelForwardDto,QueryMailActionsDto } from 'src/dtos/mail-actions.dto';
import { MailActionsService } from '../actions/actions.service';
import { CreateTaskDto, EditTicketStatusDto, TaskMessageDto,TicketMessageDto,UpdateTaskDto } from 'src/dtos/support.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { TaskService } from '../task/task.service';
import { SupportService } from '../support/support.service';
import { HandlerService } from './handler.service';
import { ListActionRequestsQueryDto } from 'src/dtos/handler.dto';


  @ApiTags('Mail Handler Panel')
  @ApiBearerAuth()
  @Controller('mail-handler')
  @UseGuards(JwtAuthGuard)
  @Public()
  export class MailHandlerController {
  constructor(
    private readonly mailService: MailService,
    private readonly mailboxService: MailboxService,
    private readonly actionService: MailActionsService,
    private readonly handlerService: HandlerService,
    ) {}

  @ApiOperation({ summary: 'Get dashboard stats' })
  @Get('dashboard')
  async dashboard(@CurrentUser('assignedLocationId') assignedLocationId: string) {
    return this.handlerService.dashboardStats(assignedLocationId);
  }

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
  @Post('mails')
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
  @Put('mails/:id')
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
  
  @Get('mails/:id')
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



  @ApiBearerAuth()
  @ApiTags('Mail Handler - Support Management')
  @Controller('mail-handler')
  export class HandlerSupportController {
    constructor(private readonly supportService: SupportService) {}
  
    @ApiOperation({ summary: 'Tüm destek biletlerini getirir' })
    @Get('tickets')
    async getTickets(@CurrentUser('assignedLocationId') assignedLocationId: string) {
      return await this.supportService.getTicketsByOfficeLocation(assignedLocationId);
    }
  
    @ApiOperation({ summary: 'Belirtilen destek biletinin detaylarını getirir' })
    @Get('tickets/:id')
    async getTicket(@Param('id') ticketId: string) {
      return await this.supportService.getTicketById(ticketId);
    }
  

    @Get('tickets/:id/messages')
    @ApiOperation({ summary: 'Get Ticket Messages' })
    async getTicketCounts(@Param('id') ticketId: string) {
      return await this.supportService.getTicketMessages(ticketId);
    }

    @ApiOperation({ summary: 'Bir destek biletinin durumunu günceller' })
    @Patch('tickets/:ticketId')
    async editTicket(
      @Param('ticketId') ticketId: string,
      @CurrentUser('id') userId: string,
      @Body() data: EditTicketStatusDto,
    ) {
      return await this.supportService.editTicketStatus(userId, ticketId, data.status,data.priority);
    }

    @ApiOperation({ summary: 'Bir destek biletine yetkili tarafından mesaj ekler' })
    @Post('tickets/add-message')
    async addMessageToTicket(@Body() data: TicketMessageDto, @CurrentUser('id') userId: string) {
      return await this.supportService.addMessageFromStaff(userId, data);
    }

  }

  @ApiBearerAuth()
  @ApiTags('Mail Handler - Customer Management')
  @Controller('mail-handler')
  export class HandlerCustomerController {
    constructor(private readonly mailboxService: MailboxService,
        private readonly handlerService: HandlerService,
    ) {}
  
  @Get('customers')
  @ApiOperation({ 
    summary: 'Get mailboxes by office location',
    description: 'Get mailboxes by office location'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Mailboxes retrieved successfully',
    type: [MailboxResponseDto]
  })
  async getMailboxesByOfficeLocation(@CurrentUser('assignedLocationId') assignedLocationId: string) {
    return this.handlerService.getCustomers(assignedLocationId);
  }

  @ApiOperation({ summary: 'Belirtilen destek biletinin detaylarını getirir' })
  @Get('customers/:mailboxId')
  async getCustomerDetails(@Param('mailboxId') mailboxId:string){
    return this.handlerService.getCustomerDetails(mailboxId)
  }
  }

  @ApiBearerAuth()
  @ApiTags('Mail Handler - Request Management')
  @Controller('mail-handler')
  export class HandlerActionRequestsController {
  constructor(private readonly handlerService: HandlerService) {}

  @Get('action-requests')
  @ApiOperation({
    summary: 'Action Request listesi',
    description:
      'officeLocationId zorunlu. type verilirse tek tipe göre sayfalı sonuç döner. type yoksa tüm tipleri gruplu döner.',
  })
  async list(@Query() query: ListActionRequestsQueryDto,@CurrentUser('assignedLocationId') assignedLocationId: string): Promise<any> {
    return this.handlerService.listActionRequestsByType(assignedLocationId,query);
  }


  @Get('action-requests/:id')
  @ApiOperation({
    summary: 'Action Request listesi',
    description:
      'officeLocationId zorunlu. type verilirse tek tipe göre sayfalı sonuç döner. type yoksa tüm tipleri gruplu döner.',
  })
  async getActionRequestDetails(@Param('id') requestId:string){
    return this.handlerService.getActionRequestDetails(requestId)

  }
}


  @ApiBearerAuth()
  @ApiTags('Mail Handler - Task Management')
  @Controller('mail-handler')
  export class HandlerTaskController {
    constructor(private readonly taskService:TaskService
    ) {}
  
  
  @Get('tasks')
  @ApiOperation({ summary: 'List tasks' })
  listByOffice(@CurrentUser('assignedLocationId') assignedLocationId: string) {
    return this.taskService.listTasksByOfficeLocation(assignedLocationId);
  }

  @Post('tasks')
  @ApiOperation({ summary: 'Create a task' })
  create(@Body() dto: CreateTaskDto, @CurrentUser('id') userId: string) {
      return this.taskService.createTaskByUser(userId, dto);
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update a task' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
      return this.taskService.updateTask(id, dto as any);
  }

  @Delete('tasks/:id')
  @ApiOperation({ summary: 'Delete a task' })
  delete(@Param('id') id: string) {
      return this.taskService.deleteTask(id);
  }
    

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Get a task' })
  getTask(@Param('id') id: string, @CurrentUser('id') userId: string) {
      return this.taskService.getTaskById(id);
  }


  @Post('tasks/:id/messages')
  @ApiOperation({ summary: 'Add a message to a task' })
  addMessage(@Param('id') id: string, @Body() dto: TaskMessageDto, @CurrentUser('id') userId: string) {
      return this.taskService.addMessage(id, userId, dto);
  }

  }