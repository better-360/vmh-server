import { 
  Controller,
  Body,
  Post,
  Get,
  Req,
  Param,
  Query,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateTicketDto, EditTicketStatusDto, TicketMessageDto } from 'src/dtos/support.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { Context } from 'src/common/decorators/context.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ContextDto } from 'src/dtos/user.dto';

@ApiBearerAuth()
@ApiTags('Support - Ticket System')
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @ApiOperation({ summary: 'Create a new support ticket' })
  @Post('create-ticket')
  async createTicket(
    @CurrentUser('id') userId: string,
    @Context() context: ContextDto,
    @Body() data: CreateTicketDto
  ) {
    return await this.supportService.createTicket(userId, context, data);
  }

  @ApiOperation({ summary: 'Add a message to an existing ticket' })
  @Post('add-message-to-ticket')
  async addMessageToTicket(
    @CurrentUser('id') userId: string,
    @Body() data: TicketMessageDto
  ) {
    return await this.supportService.addMessage(userId, data);
  }

  @ApiOperation({ summary: 'Update ticket status' })
  @Post('ticket/:ticketId/edit')
  async editTicket(
    @Param('ticketId') ticketId: string,
    @CurrentUser('id') userId: string,
    @Body() data: EditTicketStatusDto
  ) {
    return await this.supportService.editTicketStatus(userId, ticketId, data.status, data.priority);
  }

  @ApiOperation({ summary: 'Get all user tickets' })
  @Get('my-tickets')
  async getMyTickets(@CurrentUser('id') userId: string) {
    return await this.supportService.getUserTickets(userId);
  }

  @ApiOperation({ summary: 'Get ticket details by ID' })
  @Get('ticket/:id')
  async getTicket(@Param('id') ticketId: string) {
   return await this.supportService.getTicketById(ticketId);
  }

  @ApiOperation({ summary: 'Get ticket details by ID' })
  @Get('ticket/:id/messages')
  async getTicketMessages(@Param('id') ticketId: string) {
    return await this.supportService.getTicketMessages(ticketId);
  }
}