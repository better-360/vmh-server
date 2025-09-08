import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { MailActionsService } from './actions.service';
import { UpdateActionDto,QueryMailActionsDto } from 'src/dtos/mail-actions.dto';
import { CreateConsolidationRequestDto, ConsolidateMailItemsDto, ConsolidationRequestResponseDto } from 'src/dtos/mail.dto';
import { CaslAbilityFactory } from 'src/authorization/casl/ability.factory';
import { ActionStatus } from '@prisma/client';
import { ListActionRequestsQueryDto } from 'src/dtos/handler.dto';

@ApiTags('Mail Actions')
@Controller('actions')
export class MailActionsController {
  constructor(
    private readonly actionsService: MailActionsService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @Get('requests')
  @ApiOperation({
    summary: 'Action Request List',
    description:
      'officeLocationId is required. if type is provided, it will return paginated results by type. if type is not provided, it will return grouped results by type.',
  })
  async list(@Query() query: ListActionRequestsQueryDto,@CurrentUser('assignedLocationId') assignedLocationId: string): Promise<any> {
    return this.actionsService.listActionRequestsByType(assignedLocationId,query);
  }

  @Get('requests/:id')
  @ApiOperation({
    summary: 'Action Request Details',
    description:'Get detailed information about a specific action request.'})
  async getActionRequestDetails(@Param('id') requestId:string){
    return this.actionsService.getActionRequestDetails(requestId)
  }

@ApiOperation({
  summary: 'Update Action Request',
  description:'Update the status of a specific action request.'})
  @Patch('requests/:id')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateActionDto) {
    return this.actionsService.updateAction(id, dto);
  }


  
  @Post('consolidation/request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Create a consolidation request',
    description: 'Create a request to consolidate multiple mails into a single package. All mails must be of the same type and from the same office location.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Consolidation request created successfully',
    type: ConsolidationRequestResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'One or more mails not found' })
  async createConsolidationRequest(
    @Body() dto: CreateConsolidationRequestDto,
    @CurrentUser() user: any,
  ) {
    const ability = await this.caslAbilityFactory.createForUser(user);
    return await this.actionsService.createConsolidationRequest(dto, user.id, ability);
  }

  @Get('consolidation/requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'List consolidation requests',
    description: 'Get list of consolidation requests. Staff can see all requests, users can see only their requests.'
  })
  @ApiQuery({ name: 'officeLocationId', required: false, description: 'Filter by office location ID' })
  @ApiQuery({ name: 'status', required: false, enum: ActionStatus, description: 'Filter by request status' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of consolidation requests',
    type: [ConsolidationRequestResponseDto]
  })
  async getConsolidationRequests(
    @Query('officeLocationId') officeLocationId?: string,
    @Query('status') status?: ActionStatus,
  ) {
    return await this.actionsService.getConsolidationRequests(officeLocationId, status);
  }

  @Get('consolidation/requests/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get consolidation request by ID',
    description: 'Get detailed information about a specific consolidation request.'
  })
  @ApiParam({ name: 'id', description: 'Consolidation request ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Consolidation request details',
    type: ConsolidationRequestResponseDto
  })
  @ApiResponse({ status: 404, description: 'Consolidation request not found' })
  async getConsolidationRequestById(@Param('id') id: string) {
    return await this.actionsService.getConsolidationRequestById(id);
  }

  @Put('consolidation/requests/:id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Complete a consolidation request',
    description: 'Complete a consolidation request by providing the consolidated package details. This creates a new consolidated mail and moves original mails into it. Only staff members can perform this action.'
  })
  @ApiParam({ name: 'id', description: 'Consolidation request ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Consolidation completed successfully',
    schema: {
      type: 'object',
      properties: {
        consolidationRequest: { $ref: '#/components/schemas/ConsolidationRequestResponseDto' },
        packageMail: { 
          type: 'object',
          description: 'The newly created consolidated package mail'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - consolidation cannot be completed' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Consolidation request not found' })
  async completeConsolidationRequest(
    @Param('id') id: string,
    @Body() dto: ConsolidateMailItemsDto,
  ) {
    return await this.actionsService.completeConsolidationRequest(id, dto);
  }

  @Put('consolidation/requests/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Cancel a consolidation request',
    description: 'Cancel a consolidation request and reset mail statuses. Only staff members can perform this action.'
  })
  @ApiParam({ name: 'id', description: 'Consolidation request ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Consolidation request cancelled successfully',
    type: ConsolidationRequestResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - consolidation cannot be cancelled' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Consolidation request not found' })
  async cancelConsolidationRequest(
    @Param('id') id: string,
    @Body() body?: { reason?: string },
  ) {
    return await this.actionsService.cancelConsolidationRequest(id, body?.reason);
  }
}
