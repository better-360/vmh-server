import { Controller, Body, Post, Get, Param, Req } from '@nestjs/common';
import { EditTicketStatusDto, TicketMessageDto } from 'src/dtos/support.dto';
import { SupportService } from '../../support/support.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('Admin - Support Management')
@Controller('admin')
export class AdminSupportController {
  constructor(private readonly supportService: SupportService) {}

  @ApiOperation({ summary: 'Tüm destek biletlerini getirir (Sadece ADMIN)' })
  @Roles('ADMIN')
  @Get('support/tickets')
  async getTickets() {
    return await this.supportService.getAllTickets();
  }

  @ApiOperation({ summary: 'Belirtilen destek biletinin detaylarını getirir (Sadece ADMIN)' })
  @Roles('ADMIN')
  @Get('ticket/:id/details')
  async getTicket(@Req() req) {
    const ticketId = req.params.id;
    return await this.supportService.getTicketById(ticketId);
  }

  @ApiOperation({ summary: 'Bir destek biletine yetkili tarafından mesaj ekler (Sadece ADMIN)' })
  @Post('support/add-message-to-ticket')
  async addMessageToTicket(@Body() data: TicketMessageDto, @Req() req) {
    const userId = req.user.id;
    return await this.supportService.addMessageFromStaff(userId, data);
  }

  @ApiOperation({ summary: 'Bir destek biletinin durumunu günceller (Sadece ADMIN)' })
  @Post('ticket/:ticketId/edit')
  async editTicket(
    @Param('ticketId') ticketId: string,
    @Req() req,
    @Body() data: EditTicketStatusDto,
  ) {
    const userId = req.user.id;
    return await this.supportService.editTicketStatus(userId, ticketId, data.status,data.priority);
  }
}
