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
import {
  UpdateWorkspaceDto,
  CreateWorkspaceMemberDto,
  UpdateWorkspaceMemberDto,
} from 'src/dtos/workspace.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { validateAndTransform } from 'src/utils/validate';
import { WorkspaceService } from '../workspace/workspace.service';
import { CurrentUser } from 'src/common/decorators';

@ApiBearerAuth()
@ApiTags('Admin Workspace Management')
@Controller('admin/workspaces')
@UseGuards(JwtAuthGuard)
export class AdminWorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all workspaces' })
  @ApiResponse({
    status: 200,
    description: 'List of workspaces retrieved successfully',
  })
  getAllWorkspaces() {
    return this.workspaceService.getAllWorkspaces();
  }

  @ApiOperation({ summary: 'Workspace detayını getirir' })
  @ApiResponse({
    status: 200,
    description: 'Workspace detayı başarıyla alındı',
  })
  @Get(':id')
  async getWorkspaceById(@CurrentUser('id') userId: string, @Param('id') workspaceId: string) {
    return await this.workspaceService.getWorkspaceById(workspaceId, userId);
  }

  @ApiOperation({ summary: 'Workspace bilgilerini günceller' })
  @ApiResponse({ status: 200, description: 'Workspace başarıyla güncellendi' })
  @Put(':id')
  async updateWorkspace(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    const dtoInstance = await validateAndTransform(
      UpdateWorkspaceDto,
      updateWorkspaceDto,
    );
    const workspace = await this.workspaceService.updateWorkspace(
      id,
      dtoInstance,
      userId,
    );
    return {
      message: 'Workspace başarıyla güncellendi',
      data: workspace,
    };
  }

  @ApiOperation({ summary: "Workspace'i siler" })
  @ApiResponse({ status: 200, description: 'Workspace başarıyla silindi' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteWorkspace(@CurrentUser('id') userId: string, @Param('id') id: string) {
    const result = await this.workspaceService.deleteWorkspace(id, userId);
    return result;
  }

  // Workspace üye yönetimi
  @ApiOperation({ summary: 'Workspace üyelerini listeler' })
  @ApiResponse({
    status: 200,
    description: 'Workspace üyeleri başarıyla alındı',
  })
  @Get(':id/members')
  async getWorkspaceMembers(@CurrentUser('id') userId: string, @Param('id') id: string) {
    const members = await this.workspaceService.getWorkspaceMembers(
      id,
      userId,
    );
    return {
      message: 'Workspace üyeleri başarıyla alındı',
      data: members,
    };
  }

  @ApiOperation({ summary: "Workspace'e üye ekler" })
  @ApiResponse({ status: 201, description: 'Üye başarıyla eklendi' })
  @Post(':id/members')
  async addWorkspaceMember(
   @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() addMemberDto: CreateWorkspaceMemberDto,
  ) {
    const dtoInstance = await validateAndTransform(
      CreateWorkspaceMemberDto,
      addMemberDto,
    );
    const member = await this.workspaceService.addWorkspaceMember(
      id,
      dtoInstance,
      userId,
    );
    return {
      message: 'Üye başarıyla eklendi',
      data: member,
    };
  }

  @ApiOperation({ summary: 'Workspace üyesini günceller' })
  @ApiResponse({ status: 200, description: 'Üye başarıyla güncellendi' })
  @Put(':id/members/:memberId')
  async updateWorkspaceMember(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() updateMemberDto: UpdateWorkspaceMemberDto,
  ) {
    const dtoInstance = await validateAndTransform(
      UpdateWorkspaceMemberDto,
      updateMemberDto,
    );
    const member = await this.workspaceService.updateWorkspaceMember(
      id,
      memberId,
      dtoInstance,
      userId,
    );
    return {
      message: 'Üye başarıyla güncellendi',
      data: member,
    };
  }

  @ApiOperation({ summary: "Workspace'ten üye çıkarır" })
  @ApiResponse({ status: 200, description: 'Üye başarıyla çıkarıldı' })
  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.OK)
  async removeWorkspaceMember(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    const result = await this.workspaceService.removeWorkspaceMember(
      id,
      memberId,
      userId,
    );
    return result;
  }
}
