import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

import { AdminService } from './admin.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateInitialSubscriptionOrderDto } from 'src/dtos/checkout.dto';
import { RegisterDto } from 'src/dtos/auth.dto';
import { CreateHandlerDto } from 'src/dtos/handler.dto';
@ApiBearerAuth()
@ApiTags('Admin Panel')
@Controller('admin')
export class AdminMainController {
  constructor(private readonly adminService: AdminService) {}

  @Roles('ADMIN')
  @Get('stats')
  @ApiOperation({ summary: 'Admin Panel İstatistikleri' })
  async getAdminStats() {
    return this.adminService.getSystemStats();
  }

  @Public()
  @Post('create-workspace-and-mailbox')
  createWorkspaceAndMailbox(@Body() data: CreateInitialSubscriptionOrderDto) {
    return this.adminService.createWorkspaceAndMailbox(data);
  }

  @Public()
  @Post('create-mailhandler')
  createMailHandler(@Body() data: CreateHandlerDto) {
    return this.adminService.createMailHandler(data);
  }
}
