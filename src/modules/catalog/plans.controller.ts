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
  CreatePlanFeatureDto,
  UpdatePlanFeatureDto,
  PlanFeatureQueryDto,
  BulkCreatePlanFeaturesDto,
  BulkUpdatePlanFeaturesDto,
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
} from 'src/dtos/plan.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Plan Management')
@ApiBearerAuth()
@Controller('plans')
@UseGuards(JwtAuthGuard)
@Public()
export class PlansController {
  constructor(
    private readonly plansService: PlansService,
    private readonly catalogService: CatalogService,
  ) {}

  // =====================
  // PLAN TEMPLATE ENDPOINTS
  // =====================

  @Get('templates')
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

  @Get('templates/active')
  @ApiOperation({ 
    summary: 'Get active plan templates',
    description: 'Retrieve all active plan templates for creating plans'
  })
  @ApiResponse({ status: 200, description: 'Active plan templates retrieved successfully' })
  async getActivePlanTemplates() {
    return this.catalogService.getActivePlanTemplates();
  }

  @Get('templates/:id')
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

  @Put('templates/:id')
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

  @Delete('templates/:id')
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

  @Post('templates/:templateId/features')
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

  @Put('templates/:templateId/features/:featureId')
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

  @Delete('templates/:templateId/features/:featureId')
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

  // =====================
  // PLANS ENDPOINTS
  // =====================

  @Get('plans')
  @ApiOperation({ 
    summary: 'Get all plans',
    description: 'Retrieve a paginated list of all plans with their prices and features'
  })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in plan name and description' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page (default: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Plans retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' }
          }
        }
      }
    }
  })
  async getPlans(@Query() query: PlanQueryDto) {
    return this.plansService.getPlans(query);
  }

  @Get('plans/active')
  @ApiOperation({ 
    summary: 'Get active plans with prices',
    description: 'Retrieve all active plans with their associated prices and features'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Active plans retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          prices: { type: 'array', items: { type: 'object' } },
          features: { type: 'array', items: { type: 'object' } }
        }
      }
    }
  })
  async getActivePlansWithPrices() {
    return this.plansService.getActivePlansWithPrices();
  }

  @Get('plans/:id')
  @ApiOperation({ 
    summary: 'Get plan by ID',
    description: 'Retrieve detailed information about a specific plan including prices and features'
  })
  @ApiParam({ name: 'id', description: 'Plan ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Plan retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Plan not found' })
  async getPlanById(@Param('id') id: string) {
    return this.plansService.getPlanById(id);
  }

  @Post('plans')
  @ApiOperation({ 
    summary: 'Create a new plan',
    description: 'Create a new subscription plan with name, description and other properties'
  })
  @ApiBody({ type: CreatePlanDto, description: 'Plan creation data' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Plan with this slug already exists for this location' })
  async createPlan(@Body() data: CreatePlanDto) {
    return this.plansService.createPlan(data);
  }

  @Post('plans/from-template')
  @ApiOperation({ 
    summary: 'Create plan from template',
    description: 'Create a new plan by copying from an existing template with optional overrides'
  })
  @ApiBody({ type: CreatePlanFromTemplateDto, description: 'Plan from template creation data' })
  @ApiResponse({ status: 201, description: 'Plan created from template successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Template or office location not found' })
  @ApiConflictResponse({ description: 'Plan with this slug already exists for this location' })
  async createPlanFromTemplate(@Body() data: CreatePlanFromTemplateDto) {
    return this.plansService.createPlanFromTemplate(data);
  }

  @Put('plans/:id')
  @ApiOperation({ 
    summary: 'Update an existing plan',
    description: 'Update plan properties such as name, description, or active status'
  })
  @ApiParam({ name: 'id', description: 'Plan ID', type: 'string' })
  @ApiBody({ type: UpdatePlanDto, description: 'Plan update data' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  @ApiNotFoundResponse({ description: 'Plan not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Plan with this slug already exists for this location' })
  async updatePlan(@Param('id') id: string, @Body() data: UpdatePlanDto) {
    return this.plansService.updatePlan(id, data);
  }

  @Delete('plans/:id')
  @ApiOperation({ 
    summary: 'Delete a plan',
    description: 'Soft delete a plan and all its associated features and prices'
  })
  @ApiParam({ name: 'id', description: 'Plan ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully' })
  @ApiNotFoundResponse({ description: 'Plan not found' })
  @ApiBadRequestResponse({ description: 'Failed to delete plan' })
  async deletePlan(@Param('id') id: string) {
    return this.plansService.deletePlan(id);
  }

  // =====================
  // PLAN PRICES ENDPOINTS
  // =====================

  @Get('plan-prices')
  @ApiOperation({ 
    summary: 'Get plan prices',
    description: 'Retrieve plan prices with optional filtering by plan, billing cycle, or currency'
  })
  @ApiQuery({ name: 'planId', required: false, type: String, description: 'Filter by plan ID' })
  @ApiQuery({ name: 'billingCycle', required: false, type: String, description: 'Filter by billing cycle (monthly, yearly, etc.)' })
  @ApiQuery({ name: 'currency', required: false, type: String, description: 'Filter by currency code' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Plan prices retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          planId: { type: 'string' },
          amount: { type: 'number' },
          currency: { type: 'string' },
          billingCycle: { type: 'string' },
          plan: { type: 'object' }
        }
      }
    }
  })
  async getPlanPrices(@Query() query: PlanPriceQueryDto) {
    return this.plansService.getPlanPrices(query);
  }

  @Get('plan-prices/:id')
  @ApiOperation({ 
    summary: 'Get plan price by ID',
    description: 'Retrieve detailed information about a specific plan price'
  })
  @ApiParam({ name: 'id', description: 'Plan Price ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Plan price retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Plan price not found' })
  async getPlanPriceById(@Param('id') id: string) {
    return this.plansService.getPlanPriceById(id);
  }

  @Post('plan-prices')
  @ApiOperation({ 
    summary: 'Create plan price',
    description: 'Add a new price configuration for a plan with specific billing cycle and currency'
  })
  @ApiBody({ type: CreatePlanPriceDto, description: 'Plan price creation data' })
  @ApiResponse({ status: 201, description: 'Plan price created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Plan not found' })
  @ApiConflictResponse({ description: 'Price for this plan and billing cycle already exists' })
  async createPlanPrice(@Body() data: CreatePlanPriceDto) {
    return this.plansService.createPlanPrice(data);
  }

  @Put('plan-prices/:id')
  @ApiOperation({ 
    summary: 'Update plan price',
    description: 'Update plan price properties such as amount, currency, or billing cycle'
  })
  @ApiParam({ name: 'id', description: 'Plan Price ID', type: 'string' })
  @ApiBody({ type: UpdatePlanPriceDto, description: 'Plan price update data' })
  @ApiResponse({ status: 200, description: 'Plan price updated successfully' })
  @ApiNotFoundResponse({ description: 'Plan price not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async updatePlanPrice(@Param('id') id: string, @Body() data: UpdatePlanPriceDto) {
    return this.plansService.updatePlanPrice(id, data);
  }

  @Delete('plan-prices/:id')
  @ApiOperation({ 
    summary: 'Delete plan price',
    description: 'Soft delete a plan price configuration'
  })
  @ApiParam({ name: 'id', description: 'Plan Price ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Plan price deleted successfully' })
  @ApiNotFoundResponse({ description: 'Plan price not found' })
  @ApiBadRequestResponse({ description: 'Failed to delete plan price' })
  async deletePlanPrice(@Param('id') id: string) {
    return this.plansService.deletePlanPrice(id);
  }
}
