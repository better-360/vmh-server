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
  AddWorkspaceMemberDto,
  UpdateWorkspaceMemberDto,
  CreateWorkspaceAddressDto,
  UpdateWorkspaceAddressDto,
  CreateWorkspaceDeliveryAddressDto,
  UpdateWorkspaceDeliveryAddressDto,
  CreateWorkspaceSubscriptionDto,
  WorkspaceQueryDto,
  WorkspaceResponseDto,
  WorkspaceDetailResponseDto,
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
    const workspace = await this.workspaceService.createWorkspace(req.user.id, dtoInstance);
    return {
      message: 'Workspace başarıyla oluşturuldu',
      data: workspace,
    };
  }

  @ApiOperation({ summary: 'Kullanıcının workspace\'lerini listeler' })
  @ApiResponse({ status: 200, description: 'Workspace listesi başarıyla alındı' })
  @Get()
  async getUserWorkspaces(@Request() req, @Query() query: WorkspaceQueryDto) {
    const queryInstance = await validateAndTransform(WorkspaceQueryDto, query);
    const result = await this.workspaceService.getUserWorkspaces(req.user.id, queryInstance);
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
    const workspace = await this.workspaceService.updateWorkspace(id, req.user.id, dtoInstance);
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
    @Body() addMemberDto: AddWorkspaceMemberDto,
  ) {
    const dtoInstance = await validateAndTransform(AddWorkspaceMemberDto, addMemberDto);
    const member = await this.workspaceService.addWorkspaceMember(id, req.user.id, dtoInstance);
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
    const member = await this.workspaceService.updateWorkspaceMember(id, memberId, req.user.id, dtoInstance);
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

  // Workspace adres yönetimi
  @ApiOperation({ summary: 'Workspace adreslerini listeler' })
  @ApiResponse({ status: 200, description: 'Workspace adresleri başarıyla alındı' })
  @Get(':id/addresses')
  async getWorkspaceAddresses(@Request() req, @Param('id') id: string) {
    const addresses = await this.workspaceService.getWorkspaceAddresses(id, req.user.id);
    return {
      message: 'Workspace adresleri başarıyla alındı',
      data: addresses,
    };
  }

  @ApiOperation({ summary: 'Workspace\'e adres ekler' })
  @ApiResponse({ status: 201, description: 'Adres başarıyla eklendi' })
  @Post(':id/addresses')
  async createWorkspaceAddress(
    @Request() req,
    @Param('id') id: string,
    @Body() createAddressDto: CreateWorkspaceAddressDto,
  ) {
    const dtoInstance = await validateAndTransform(CreateWorkspaceAddressDto, createAddressDto);
    const address = await this.workspaceService.createWorkspaceAddress(id, req.user.id, dtoInstance);
    return {
      message: 'Adres başarıyla eklendi',
      data: address,
    };
  }

  @ApiOperation({ summary: 'Workspace adresini günceller' })
  @ApiResponse({ status: 200, description: 'Adres başarıyla güncellendi' })
  @Put(':id/addresses/:addressId')
  async updateWorkspaceAddress(
    @Request() req,
    @Param('id') id: string,
    @Param('addressId') addressId: string,
    @Body() updateAddressDto: UpdateWorkspaceAddressDto,
  ) {
    const dtoInstance = await validateAndTransform(UpdateWorkspaceAddressDto, updateAddressDto);
    const address = await this.workspaceService.updateWorkspaceAddress(id, addressId, req.user.id, dtoInstance);
    return {
      message: 'Adres başarıyla güncellendi',
      data: address,
    };
  }

  @ApiOperation({ summary: 'Workspace adresini siler' })
  @ApiResponse({ status: 200, description: 'Adres başarıyla silindi' })
  @Delete(':id/addresses/:addressId')
  @HttpCode(HttpStatus.OK)
  async deleteWorkspaceAddress(
    @Request() req,
    @Param('id') id: string,
    @Param('addressId') addressId: string,
  ) {
    const result = await this.workspaceService.deleteWorkspaceAddress(id, addressId, req.user.id);
    return result;
  }

  // Workspace teslimat adresi yönetimi
  @ApiOperation({ summary: 'Workspace teslimat adreslerini listeler' })
  @ApiResponse({ status: 200, description: 'Teslimat adresleri başarıyla alındı' })
  @Get(':id/delivery-addresses')
  async getWorkspaceDeliveryAddresses(@Request() req, @Param('id') id: string) {
    const deliveryAddresses = await this.workspaceService.getWorkspaceDeliveryAddresses(id, req.user.id);
    return {
      message: 'Teslimat adresleri başarıyla alındı',
      data: deliveryAddresses,
    };
  }

  @ApiOperation({ summary: 'Workspace\'e teslimat adresi ekler' })
  @ApiResponse({ status: 201, description: 'Teslimat adresi başarıyla eklendi' })
  @Post(':id/delivery-addresses')
  async createWorkspaceDeliveryAddress(
    @Request() req,
    @Param('id') id: string,
    @Body() createDeliveryAddressDto: CreateWorkspaceDeliveryAddressDto,
  ) {
    const dtoInstance = await validateAndTransform(CreateWorkspaceDeliveryAddressDto, createDeliveryAddressDto);
    const deliveryAddress = await this.workspaceService.createWorkspaceDeliveryAddress(id, req.user.id, dtoInstance);
    return {
      message: 'Teslimat adresi başarıyla eklendi',
      data: deliveryAddress,
    };
  }

  @ApiOperation({ summary: 'Workspace teslimat adresini günceller' })
  @ApiResponse({ status: 200, description: 'Teslimat adresi başarıyla güncellendi' })
  @Put(':id/delivery-addresses/:deliveryAddressId')
  async updateWorkspaceDeliveryAddress(
    @Request() req,
    @Param('id') id: string,
    @Param('deliveryAddressId') deliveryAddressId: string,
    @Body() updateDeliveryAddressDto: UpdateWorkspaceDeliveryAddressDto,
  ) {
    const dtoInstance = await validateAndTransform(UpdateWorkspaceDeliveryAddressDto, updateDeliveryAddressDto);
    const deliveryAddress = await this.workspaceService.updateWorkspaceDeliveryAddress(
      id,
      deliveryAddressId,
      req.user.id,
      dtoInstance,
    );
    return {
      message: 'Teslimat adresi başarıyla güncellendi',
      data: deliveryAddress,
    };
  }

  @ApiOperation({ summary: 'Workspace teslimat adresini siler' })
  @ApiResponse({ status: 200, description: 'Teslimat adresi başarıyla silindi' })
  @Delete(':id/delivery-addresses/:deliveryAddressId')
  @HttpCode(HttpStatus.OK)
  async deleteWorkspaceDeliveryAddress(
    @Request() req,
    @Param('id') id: string,
    @Param('deliveryAddressId') deliveryAddressId: string,
  ) {
    const result = await this.workspaceService.deleteWorkspaceDeliveryAddress(id, deliveryAddressId, req.user.id);
    return result;
  }

  // Workspace abonelik yönetimi
  @ApiOperation({ summary: 'Workspace aboneliklerini listeler' })
  @ApiResponse({ status: 200, description: 'Abonelikler başarıyla alındı' })
  @Get(':id/subscriptions')
  async getWorkspaceSubscriptions(@Request() req, @Param('id') id: string) {
    const subscriptions = await this.workspaceService.getWorkspaceSubscriptions(id, req.user.id);
    return {
      message: 'Abonelikler başarıyla alındı',
      data: subscriptions,
    };
  }

  @ApiOperation({ summary: 'Workspace\'e abonelik ekler' })
  @ApiResponse({ status: 201, description: 'Abonelik başarıyla eklendi' })
  @Post(':id/subscriptions')
  async createWorkspaceSubscription(
    @Request() req,
    @Param('id') id: string,
    @Body() createSubscriptionDto: CreateWorkspaceSubscriptionDto,
  ) {
    const dtoInstance = await validateAndTransform(CreateWorkspaceSubscriptionDto, createSubscriptionDto);
    const subscription = await this.workspaceService.createWorkspaceSubscription(id, req.user.id, dtoInstance);
    return {
      message: 'Abonelik başarıyla eklendi',
      data: subscription,
    };
  }
} 