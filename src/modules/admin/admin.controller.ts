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
@ApiBearerAuth()
@ApiTags('Admin Panel')
@Controller('admin')
export class AdminMainController {
  constructor(
    private readonly adminService: AdminService,
  ) {}


  @Roles('ADMIN')
  @Get('stats')
  @ApiOperation({ summary: 'Admin Panel İstatistikleri' })
  async getAdminStats() {
    return this.adminService.getSystemStats();
  }

}
