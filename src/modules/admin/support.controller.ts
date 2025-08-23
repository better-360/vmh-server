import { Controller, Body, Post, Get, Param, Req } from '@nestjs/common';
import { EditTicketStatusDto, TicketMessageDto } from 'src/dtos/support.dto';
import { SupportService } from '../support/support.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators';

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

  @ApiOperation({ summary: 'Office location bazlı biletleri getirir (ADMIN/STAFF)' })
  @Roles('ADMIN')
  @Get('support/office-location/:officeLocationId')
  async getTicketsByOffice(@Param('officeLocationId') officeLocationId: string) {
    return await this.supportService.getTicketsByOfficeLocation(officeLocationId);
  }

  @ApiOperation({ summary: 'Belirtilen destek biletinin detaylarını getirir (Sadece ADMIN)' })
  @Roles('ADMIN')
  @Get('ticket/:id/details')
  async getTicket(@Param('id') ticketId: string) {
    return await this.supportService.getTicketById(ticketId);
  }

  @ApiOperation({ summary: 'Bir destek biletine yetkili tarafından mesaj ekler (Sadece ADMIN)' })
  @Post('support/add-message-to-ticket')
  async addMessageToTicket(@Body() data: TicketMessageDto, @CurrentUser('id') userId: string) {
    return await this.supportService.addMessageFromStaff(userId, data);
  }

  @ApiOperation({ summary: 'Bir destek biletinin durumunu günceller (Sadece ADMIN)' })
  @Post('ticket/:ticketId/edit')
  async editTicket(
    @Param('ticketId') ticketId: string,
    @CurrentUser('id') userId: string,
    @Body() data: EditTicketStatusDto,
  ) {
    return await this.supportService.editTicketStatus(userId, ticketId, data.status,data.priority);
  }
}
