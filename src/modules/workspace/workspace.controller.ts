import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  CreateWorkspaceMemberDto,
  UpdateWorkspaceMemberDto,
} from 'src/dtos/workspace.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { validateAndTransform } from 'src/utils/validate';

@ApiBearerAuth()
@ApiTags('Workspace Management')
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @ApiOperation({ summary: 'Yeni workspace oluşturur' })
  @ApiResponse({ status: 201, description: 'Workspace başarıyla oluşturuldu' })
  @Post()
  async createWorkspace(@Request() req, @Body() createWorkspaceDto: CreateWorkspaceDto) {
    const dtoInstance = await validateAndTransform(CreateWorkspaceDto, createWorkspaceDto);
    const workspace = await this.workspaceService.createWorkspace(dtoInstance, req.user.id);
    return {
      message: 'Workspace başarıyla oluşturuldu',
      data: workspace,
    };
  }

  @ApiOperation({ summary: 'Kullanıcının workspace\'lerini listeler' })
  @ApiResponse({ status: 200, description: 'Workspace listesi başarıyla alındı' })
  @Get()
  async getUserWorkspaces(@Request() req, @Query() query: any) {
    // const queryInstance = await validateAndTransform(WorkspaceQueryDto, query);
    const result = await this.workspaceService.getUserWorkspaces(req.user.id);
    return {
      message: 'Workspace listesi başarıyla alındı',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Workspace detayını getirir' })
  @ApiResponse({ status: 200, description: 'Workspace detayı başarıyla alındı' })
  @Get(':id')
  async getWorkspaceById(@Request() req, @Param('id') id: string) {
    const workspace = await this.workspaceService.getWorkspaceById(id, req.user.id);
    return {
      message: 'Workspace detayı başarıyla alındı',
      data: workspace,
    };
  }

  @ApiOperation({ summary: 'Workspace bilgilerini günceller' })
  @ApiResponse({ status: 200, description: 'Workspace başarıyla güncellendi' })
  @Put(':id')
  async updateWorkspace(
    @Request() req,
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    const dtoInstance = await validateAndTransform(UpdateWorkspaceDto, updateWorkspaceDto);
    const workspace = await this.workspaceService.updateWorkspace(id, dtoInstance, req.user.id);
    return {
      message: 'Workspace başarıyla güncellendi',
      data: workspace,
    };
  }

  @ApiOperation({ summary: 'Workspace\'i siler' })
  @ApiResponse({ status: 200, description: 'Workspace başarıyla silindi' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteWorkspace(@Request() req, @Param('id') id: string) {
    const result = await this.workspaceService.deleteWorkspace(id, req.user.id);
    return result;
  }

  // Workspace üye yönetimi
  @ApiOperation({ summary: 'Workspace üyelerini listeler' })
  @ApiResponse({ status: 200, description: 'Workspace üyeleri başarıyla alındı' })
  @Get(':id/members')
  async getWorkspaceMembers(@Request() req, @Param('id') id: string) {
    const members = await this.workspaceService.getWorkspaceMembers(id, req.user.id);
    return {
      message: 'Workspace üyeleri başarıyla alındı',
      data: members,
    };
  }

  @ApiOperation({ summary: 'Workspace\'e üye ekler' })
  @ApiResponse({ status: 201, description: 'Üye başarıyla eklendi' })
  @Post(':id/members')
  async addWorkspaceMember(
    @Request() req,
    @Param('id') id: string,
    @Body() addMemberDto: CreateWorkspaceMemberDto,
  ) {
    const dtoInstance = await validateAndTransform(CreateWorkspaceMemberDto, addMemberDto);
    const member = await this.workspaceService.addWorkspaceMember(id, dtoInstance, req.user.id);
    return {
      message: 'Üye başarıyla eklendi',
      data: member,
    };
  }

  @ApiOperation({ summary: 'Workspace üyesini günceller' })
  @ApiResponse({ status: 200, description: 'Üye başarıyla güncellendi' })
  @Put(':id/members/:memberId')
  async updateWorkspaceMember(
    @Request() req,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() updateMemberDto: UpdateWorkspaceMemberDto,
  ) {
    const dtoInstance = await validateAndTransform(UpdateWorkspaceMemberDto, updateMemberDto);
    const member = await this.workspaceService.updateWorkspaceMember(id, memberId, dtoInstance, req.user.id);
    return {
      message: 'Üye başarıyla güncellendi',
      data: member,
    };
  }

  @ApiOperation({ summary: 'Workspace\'ten üye çıkarır' })
  @ApiResponse({ status: 200, description: 'Üye başarıyla çıkarıldı' })
  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.OK)
  async removeWorkspaceMember(
    @Request() req,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    const result = await this.workspaceService.removeWorkspaceMember(id, memberId, req.user.id);
    return result;
  }
} 