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
import { MailboxService } from './mailbox.service';
import { 
  CreateMailboxDto, 
  UpdateMailboxDto, 
  MailboxResponseDto 
} from 'src/dtos/mailbox.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('mailboxes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mailboxes')
export class MailboxController {
  constructor(private readonly mailboxService: MailboxService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new mailbox' })
  @ApiResponse({
    status: 201,
    description: 'Mailbox created successfully',
    type: MailboxResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createMailboxDto: CreateMailboxDto): Promise<MailboxResponseDto> {
    return this.mailboxService.create(createMailboxDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all mailboxes' })
  @ApiQuery({ name: 'workspaceId', required: false, type: String })
  @ApiQuery({ name: 'officeLocationId', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Mailboxes retrieved successfully',
    type: [MailboxResponseDto],
  })
  findAll(
    @Query('workspaceId') workspaceId?: string,
    @Query('officeLocationId') officeLocationId?: string,
    @Query('isActive') isActive?: boolean,
  ): Promise<MailboxResponseDto[]> {
    return this.mailboxService.findAll(workspaceId, officeLocationId, isActive);
  }

  @Get('workspace/:workspaceId')
  @ApiOperation({ summary: 'Get mailboxes by workspace' })
  @ApiResponse({
    status: 200,
    description: 'Workspace mailboxes retrieved successfully',
    type: [MailboxResponseDto],
  })
  findByWorkspace(@Param('workspaceId') workspaceId: string): Promise<MailboxResponseDto[]> {
    return this.mailboxService.findByWorkspace(workspaceId);
  }

  @Get('office-location/:officeLocationId')
  @ApiOperation({ summary: 'Get mailboxes by office location' })
  @ApiResponse({
    status: 200,
    description: 'Office location mailboxes retrieved successfully',
    type: [MailboxResponseDto],
  })
  findByOfficeLocation(@Param('officeLocationId') officeLocationId: string): Promise<MailboxResponseDto[]> {
    return this.mailboxService.findByOfficeLocation(officeLocationId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active mailboxes' })
  @ApiResponse({
    status: 200,
    description: 'Active mailboxes retrieved successfully',
    type: [MailboxResponseDto],
  })
  getActiveMailboxes(): Promise<MailboxResponseDto[]> {
    return this.mailboxService.getActiveMailboxes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get mailbox by ID' })
  @ApiResponse({
    status: 200,
    description: 'Mailbox retrieved successfully',
    type: MailboxResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Mailbox not found' })
  findOne(@Param('id') id: string): Promise<MailboxResponseDto> {
    return this.mailboxService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update mailbox' })
  @ApiResponse({
    status: 200,
    description: 'Mailbox updated successfully',
    type: MailboxResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Mailbox not found' })
  update(
    @Param('id') id: string,
    @Body() updateMailboxDto: UpdateMailboxDto,
  ): Promise<MailboxResponseDto> {
    return this.mailboxService.update(id, updateMailboxDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate mailbox' })
  @ApiResponse({ status: 200, description: 'Mailbox deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Mailbox not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.mailboxService.remove(id);
  }

  @Get(':id/feature-usage/:featureId')
  @ApiOperation({ summary: 'Check feature usage for mailbox' })
  @ApiResponse({ status: 200, description: 'Feature usage retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Mailbox or feature not found' })
  checkFeatureUsage(
    @Param('id') mailboxId: string,
    @Param('featureId') featureId: string,
  ) {
    return this.mailboxService.checkFeatureUsage(mailboxId, featureId);
  }

  @Post(':id/feature-usage/:featureId/increment')
  @ApiOperation({ summary: 'Increment feature usage for mailbox' })
  @ApiResponse({ status: 200, description: 'Feature usage incremented successfully' })
  @ApiResponse({ status: 404, description: 'Mailbox or feature not found' })
  incrementFeatureUsage(
    @Param('id') mailboxId: string,
    @Param('featureId') featureId: string,
  ): Promise<void> {
    return this.mailboxService.incrementFeatureUsage(mailboxId, featureId);
  }
}