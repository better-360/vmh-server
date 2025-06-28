import {
  Controller,
  Body,
  Post,
  Request,
  Get,
  Req,
  Param,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateTicketDto, EditTicketStatusDto, TicketMessageDto } from 'src/dtos/support.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Support - Ticket System')
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  // @ApiOperation({ summary: 'Yeni bir destek bileti (ticket) oluşturur' })
  // @Post('create-ticket')
  // async createTicket(@Request() req, @Body() data: CreateTicketDto) {
  //   const userId = req.user.id;
  //   return await this.supportService.createTicket(userId, data);
  // }

  @ApiOperation({ summary: 'Mevcut bir ticket’a mesaj ekler' })
  @Post('add-message-to-ticket')
  async addMessageToTicket(@Request() req, @Body() data: TicketMessageDto) {
    const userId = req.user.id;
    return await this.supportService.addMessage(userId, data);
  }

  @ApiOperation({ summary: 'Bir ticket’ın durumunu günceller' })
  @Post('ticket/:ticketId/edit')
  async editTicket(
    @Param('ticketId') ticketId: string,
    @Req() req,
    @Body() data: EditTicketStatusDto
  ) {
    const userId = req.user.id;
    return await this.supportService.editTicketStatus(userId, ticketId, data.status,data.priority);
  }

  @ApiOperation({ summary: 'Kullanıcının oluşturduğu tüm destek biletlerini (tickets) getirir' })
  @Get('my-tickets')
  async getMyTickets(@Request() req) {
    const userId = req.user.id;
    return await this.supportService.getUserTickets(userId);
  }

  @Public()
  @ApiOperation({ summary: 'Belirtilen destek biletinin detaylarını getirir' })
  @Get('ticket/:id')
  async getTicket(@Req() req , @Param('id') ticketId: string) {
    return await this.supportService.getTicketById(ticketId);
  }
}
