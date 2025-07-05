import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBody,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConflictResponse
} from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreatePlanDto,
  UpdatePlanDto,
  PlanQueryDto,
  CreatePlanPriceDto,
  UpdatePlanPriceDto,
  PlanPriceQueryDto,
  CreatePlanFromTemplateDto,
  CreatePlanTemplateDto,
  UpdatePlanTemplateDto,
  PlanTemplateQueryDto,
  CreatePlanTemplateFeatureDto,
  UpdatePlanTemplateFeatureDto,
  CreatePlanWithFeaturesDto,
} from 'src/dtos/plan.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Template Management')
@ApiBearerAuth()
@Controller('templates')
@UseGuards(JwtAuthGuard)
@Public()
export class TemplatesController {
  constructor(
    private readonly plansService: PlansService,
    private readonly catalogService: CatalogService,
  ) {}

  // =====================
  // PLAN TEMPLATE ENDPOINTS
  // =====================

  @Get('all')
  @ApiOperation({ 
    summary: 'Get all plan templates',
    description: 'Retrieve a paginated list of all plan templates with their features'
  })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in template name, slug and description' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Plan templates retrieved successfully' })
  async getPlanTemplates(@Query() query: PlanTemplateQueryDto) {
    return this.catalogService.getPlanTemplates(query);
  }

  @Get('/active')
  @ApiOperation({ 
    summary: 'Get active plan templates',
    description: 'Retrieve all active plan templates for creating plans'
  })
  @ApiResponse({ status: 200, description: 'Active plan templates retrieved successfully' })
  async getActivePlanTemplates() {
    return this.catalogService.getActivePlanTemplates();
  }

  @Get('/:id')
  @ApiOperation({ 
    summary: 'Get plan template by ID',
    description: 'Retrieve detailed information about a specific plan template including features'
  })
  @ApiParam({ name: 'id', description: 'Template ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Plan template retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Plan template not found' })
  async getPlanTemplateById(@Param('id') id: string) {
    return this.catalogService.getPlanTemplateById(id);
  }

  @Post('templates')
  @ApiOperation({ 
    summary: 'Create a new plan template',
    description: 'Create a new plan template with features that can be used to generate plans'
  })
  @ApiBody({ type: CreatePlanTemplateDto, description: 'Plan template creation data' })
  @ApiResponse({ status: 201, description: 'Plan template created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Template with this name or slug already exists' })
  async createPlanTemplate(@Body() data: CreatePlanTemplateDto) {
    return this.catalogService.createPlanTemplate(data);
  }

  @Put('/:id')
  @ApiOperation({ 
    summary: 'Update an existing plan template',
    description: 'Update plan template properties such as name, description, or prices'
  })
  @ApiParam({ name: 'id', description: 'Template ID', type: 'string' })
  @ApiBody({ type: UpdatePlanTemplateDto, description: 'Plan template update data' })
  @ApiResponse({ status: 200, description: 'Plan template updated successfully' })
  @ApiNotFoundResponse({ description: 'Plan template not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Template with this name or slug already exists' })
  async updatePlanTemplate(@Param('id') id: string, @Body() data: UpdatePlanTemplateDto) {
    return this.catalogService.updatePlanTemplate(id, data);
  }

  @Delete('/:id/delete')
  @ApiOperation({ 
    summary: 'Delete a plan template',
    description: 'Soft delete a plan template and all its associated features'
  })
  @ApiParam({ name: 'id', description: 'Template ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Plan template deleted successfully' })
  @ApiNotFoundResponse({ description: 'Plan template not found' })
  @ApiBadRequestResponse({ description: 'Failed to delete plan template' })
  async deletePlanTemplate(@Param('id') id: string) {
    return this.catalogService.deletePlanTemplate(id);
  }

  @Post('/:templateId/features')
  @ApiOperation({ 
    summary: 'Add feature to template',
    description: 'Add a feature with limits and pricing to a plan template'
  })
  @ApiParam({ name: 'templateId', description: 'Template ID', type: 'string' })
  @ApiBody({ type: CreatePlanTemplateFeatureDto, description: 'Template feature creation data' })
  @ApiResponse({ status: 201, description: 'Feature added to template successfully' })
  @ApiNotFoundResponse({ description: 'Template or feature not found' })
  @ApiConflictResponse({ description: 'Feature already exists in this template' })
  async addFeatureToTemplate(@Param('templateId') templateId: string, @Body() data: CreatePlanTemplateFeatureDto) {
    return this.catalogService.addFeatureToTemplate(templateId, data);
  }

  @Put('/:templateId/features/:featureId')
  @ApiOperation({ 
    summary: 'Update template feature',
    description: 'Update feature limits and pricing in a plan template'
  })
  @ApiParam({ name: 'templateId', description: 'Template ID', type: 'string' })
  @ApiParam({ name: 'featureId', description: 'Feature ID', type: 'string' })
  @ApiBody({ type: UpdatePlanTemplateFeatureDto, description: 'Template feature update data' })
  @ApiResponse({ status: 200, description: 'Template feature updated successfully' })
  @ApiNotFoundResponse({ description: 'Template feature not found' })
  async updateTemplateFeature(
    @Param('templateId') templateId: string, 
    @Param('featureId') featureId: string, 
    @Body() data: UpdatePlanTemplateFeatureDto
  ) {
    return this.catalogService.updateTemplateFeature(templateId, featureId, data);
  }

  @Delete('/:templateId/features/:featureId')
  @ApiOperation({ 
    summary: 'Remove feature from template',
    description: 'Remove a feature from a plan template'
  })
  @ApiParam({ name: 'templateId', description: 'Template ID', type: 'string' })
  @ApiParam({ name: 'featureId', description: 'Feature ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Feature removed from template successfully' })
  @ApiNotFoundResponse({ description: 'Template feature not found' })
  async removeFeatureFromTemplate(@Param('templateId') templateId: string, @Param('featureId') featureId: string) {
    return this.catalogService.removeFeatureFromTemplate(templateId, featureId);
  }

}
