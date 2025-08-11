// src/mail-actions/mail-actions.controller.ts
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { MailActionsService } from '../actions/actions.service';
import { UpdateActionStatusDto,CreateMailActionDto,CompleteForwardDto, CancelForwardDto,QueryMailActionsDto } from 'src/dtos/mail-actions.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Mail Handler Requests')
@Controller('handler/')
export class MailActionsController {
  constructor(private readonly actionService: MailActionsService) {}

  // Panel listesi
  @Get('mail-actions/all')
  async list(@Query() q: QueryMailActionsDto) {
    console.log('Listing mail actions with query:', q);
    return this.actionService.listActions(q);
  }

  // Detay
  @Get('mail-actions/:id')
  async get(@Param('id') id: string) {
    return this.actionService.getActionById(id);
  }

  // Aksiyon oluştur (panel veya otomasyon)
  @Post('mail-actions/create')
  async create(@Body() dto: CreateMailActionDto) {
    return this.actionService.createAction(dto);
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
