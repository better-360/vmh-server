// src/mail-actions/mail-actions.controller.ts
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { MailActionsService } from './actions.service';
import { UpdateActionStatusDto,CreateMailActionDto,CompleteForwardDto, CancelForwardDto,QueryMailActionsDto } from 'src/dtos/mail-actions.dto';

@Controller('admin/mail-actions')
export class MailActionsController {
  constructor(private readonly service: MailActionsService) {}

  // Panel listesi
  @Get()
  async list(@Query() q: QueryMailActionsDto) {
    return this.service.listActions(q);
  }

  // Detay
  @Get(':id')
  async get(@Param('id') id: string) {
    return this.service.getActionById(id);
  }

  // Aksiyon oluştur (panel veya otomasyon)
  @Post()
  async create(@Body() dto: CreateMailActionDto) {
    return this.service.createAction(dto);
  }

  // Genel status update
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateActionStatusDto) {
    return this.service.updateActionStatus(id, dto);
  }

  // Forward tamamla
  @Patch(':id/forward/complete')
  async completeForward(@Param('id') id: string, @Body() body: CompleteForwardDto) {
    return this.service.completeForward(id, body);
  }

  // Forward iptal
  @Patch(':id/forward/cancel')
  async cancelForward(@Param('id') id: string, @Body() body: CancelForwardDto) {
    return this.service.cancelForward(id, body);
  }
}
