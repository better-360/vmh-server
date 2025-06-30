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
import { CatalogService } from './catalog.service';
import { FeaturesService } from './features.service';
import { PlansService } from './plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateWorkspaceFeatureUsageDto,
  UpdateWorkspaceFeatureUsageDto,
  CreateFeatureDto,
  UpdateFeatureDto,
  FeatureQueryDto,
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
} from 'src/dtos/plan.dto';

@ApiTags('Catalog Management')
@ApiBearerAuth()
@Controller('catalog')
@UseGuards(JwtAuthGuard)
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly featuresService: FeaturesService,
    private readonly plansService: PlansService,
  ) {}

  // =====================
  // FEATURES ENDPOINTS
  // =====================

  @Get('features')
  @ApiOperation({ 
    summary: 'Get all features',
    description: 'Retrieve a paginated list of all features with optional filtering and search capabilities'
  })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in feature name and description' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page (default: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Features retrieved successfully',
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
  async getFeatures(@Query() query: FeatureQueryDto) {
    return this.featuresService.getFeatures(query);
  }

  @Get('features/:id')
  @ApiOperation({ 
    summary: 'Get feature by ID',
    description: 'Retrieve detailed information about a specific feature'
  })
  @ApiParam({ name: 'id', description: 'Feature ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Feature retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Feature not found' })
  async getFeatureById(@Param('id') id: string) {
    return this.featuresService.getFeatureById(id);
  }

  @Post('features/create')
  @ApiOperation({ 
    summary: 'Create a new feature',
    description: 'Create a new feature with name, description and other properties'
  })
  @ApiBody({ type: CreateFeatureDto, description: 'Feature creation data' })
  @ApiResponse({ status: 201, description: 'Feature created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Feature with this name already exists' })
  async createFeature(@Body() data: CreateFeatureDto) {
    return this.featuresService.createFeature(data);
  }

  @Put('features/:id/update')
  @ApiOperation({ 
    summary: 'Update an existing feature',
    description: 'Update feature properties such as name, description, or active status'
  })
  @ApiParam({ name: 'id', description: 'Feature ID', type: 'string' })
  @ApiBody({ type: UpdateFeatureDto, description: 'Feature update data' })
  @ApiResponse({ status: 200, description: 'Feature updated successfully' })
  @ApiNotFoundResponse({ description: 'Feature not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Feature with this name already exists' })
  async updateFeature(@Param('id') id: string, @Body() data: UpdateFeatureDto) {
    return this.featuresService.updateFeature(id, data);
  }

  @Delete('features/:id/delete')
  @ApiOperation({ 
    summary: 'Delete a feature',
    description: 'Soft delete a feature and all its associated plan features'
  })
  @ApiParam({ name: 'id', description: 'Feature ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Feature deleted successfully' })
  @ApiNotFoundResponse({ description: 'Feature not found' })
  @ApiBadRequestResponse({ description: 'Failed to delete feature' })
  async deleteFeature(@Param('id') id: string) {
    return this.featuresService.deleteFeature(id);
  }

  @Get('features/:id/usage-in-plans')
  @ApiOperation({ 
    summary: 'Get feature usage in plans',
    description: 'Retrieve all plans that use a specific feature'
  })
  @ApiParam({ name: 'id', description: 'Feature ID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Feature usage in plans retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          planId: { type: 'string' },
          featureId: { type: 'string' },
          plan: { type: 'object' }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Feature not found' })
  async getFeatureUsageInPlans(@Param('id') featureId: string) {
    return this.featuresService.getFeatureUsageInPlans(featureId);
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
  @ApiConflictResponse({ description: 'Plan with this name already exists' })
  async createPlan(@Body() data: CreatePlanDto) {
    return this.plansService.createPlan(data);
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
  @ApiConflictResponse({ description: 'Plan with this name already exists' })
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
  // PLAN FEATURES ENDPOINTS
  // =====================

  @Get('plan-features')
  @ApiOperation({ 
    summary: 'Get plan features',
    description: 'Retrieve plan-feature relationships with optional filtering by plan or feature'
  })
  @ApiQuery({ name: 'planId', required: false, type: String, description: 'Filter by plan ID' })
  @ApiQuery({ name: 'featureId', required: false, type: String, description: 'Filter by feature ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Plan features retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          planId: { type: 'string' },
          featureId: { type: 'string' },
          includedLimit: { type: 'number' },
          unitPrice: { type: 'number' },
          plan: { type: 'object' },
          feature: { type: 'object' }
        }
      }
    }
  })
  async getPlanFeatures(@Query() query: PlanFeatureQueryDto) {
    return this.featuresService.getPlanFeatures(query);
  }

  @Get('plan-features/:id')
  @ApiOperation({ 
    summary: 'Get plan feature by ID',
    description: 'Retrieve detailed information about a specific plan-feature relationship'
  })
  @ApiParam({ name: 'id', description: 'Plan Feature ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Plan feature retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Plan feature not found' })
  async getPlanFeatureById(@Param('id') id: string) {
    return this.featuresService.getPlanFeatureById(id);
  }

  @Post('plan-features')
  @ApiOperation({ 
    summary: 'Add feature to plan',
    description: 'Create a new plan-feature relationship with limits and pricing'
  })
  @ApiBody({ type: CreatePlanFeatureDto, description: 'Plan feature creation data' })
  @ApiResponse({ status: 201, description: 'Feature added to plan successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Plan or feature not found' })
  @ApiConflictResponse({ description: 'This feature is already added to the plan' })
  async createPlanFeature(@Body() data: CreatePlanFeatureDto) {
    return this.featuresService.createPlanFeature(data);
  }

  @Put('plan-features/:id')
  @ApiOperation({ 
    summary: 'Update plan feature',
    description: 'Update plan-feature relationship properties like limits and pricing'
  })
  @ApiParam({ name: 'id', description: 'Plan Feature ID', type: 'string' })
  @ApiBody({ type: UpdatePlanFeatureDto, description: 'Plan feature update data' })
  @ApiResponse({ status: 200, description: 'Plan feature updated successfully' })
  @ApiNotFoundResponse({ description: 'Plan feature not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async updatePlanFeature(@Param('id') id: string, @Body() data: UpdatePlanFeatureDto) {
    return this.featuresService.updatePlanFeature(id, data);
  }

  @Delete('plan-features/:id')
  @ApiOperation({ 
    summary: 'Remove feature from plan',
    description: 'Soft delete a plan-feature relationship'
  })
  @ApiParam({ name: 'id', description: 'Plan Feature ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Feature removed from plan successfully' })
  @ApiNotFoundResponse({ description: 'Plan feature not found' })
  @ApiBadRequestResponse({ description: 'Failed to remove feature from plan' })
  async deletePlanFeature(@Param('id') id: string) {
    return this.featuresService.deletePlanFeature(id);
  }

  @Post('plan-features/bulk-create')
  @ApiOperation({ 
    summary: 'Bulk add features to plan',
    description: 'Add multiple features to a plan in a single transaction'
  })
  @ApiBody({ type: BulkCreatePlanFeaturesDto, description: 'Bulk plan features creation data' })
  @ApiResponse({ 
    status: 201, 
    description: 'Features added to plan successfully',
    schema: {
      type: 'array',
      items: { type: 'object' }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Plan or one or more features not found' })
  @ApiConflictResponse({ description: 'Some features are already added to this plan' })
  async bulkCreatePlanFeatures(@Body() data: BulkCreatePlanFeaturesDto) {
    return this.featuresService.bulkCreatePlanFeatures(data);
  }

  @Put('plan-features/bulk-update')
  @ApiOperation({ 
    summary: 'Bulk update plan features',
    description: 'Update multiple plan-feature relationships in a single transaction'
  })
  @ApiBody({ type: BulkUpdatePlanFeaturesDto, description: 'Bulk plan features update data' })
  @ApiResponse({ 
    status: 200, 
    description: 'Plan features updated successfully',
    schema: {
      type: 'array',
      items: { type: 'object' }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'One or more plan features not found' })
  async bulkUpdatePlanFeatures(@Body() data: BulkUpdatePlanFeaturesDto) {
    return this.featuresService.bulkUpdatePlanFeatures(data);
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

  // =====================
  // WORKSPACE FEATURE USAGE ENDPOINTS
  // =====================

  @Post('workspace-feature-usage')
  @ApiOperation({ 
    summary: 'Create workspace feature usage record',
    description: 'Create a new workspace feature usage record for tracking consumption'
  })
  @ApiBody({ type: CreateWorkspaceFeatureUsageDto, description: 'Workspace feature usage creation data' })
  @ApiResponse({ status: 201, description: 'Workspace feature usage record created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Workspace, office location, or feature not found' })
  @ApiConflictResponse({ description: 'Feature usage for this month already exists' })
  async createWorkspaceFeatureUsage(@Body() data: CreateWorkspaceFeatureUsageDto) {
    return this.catalogService.createWorkspaceFeatureUsage(data);
  }

  @Put('workspace-feature-usage/:id')
  @ApiOperation({ 
    summary: 'Update workspace feature usage record',
    description: 'Update an existing workspace feature usage record'
  })
  @ApiParam({ name: 'id', description: 'Workspace Feature Usage ID', type: 'string' })
  @ApiBody({ type: UpdateWorkspaceFeatureUsageDto, description: 'Workspace feature usage update data' })
  @ApiResponse({ status: 200, description: 'Workspace feature usage record updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data or failed to update' })
  async updateWorkspaceFeatureUsage(@Param('id') id: string, @Body() data: UpdateWorkspaceFeatureUsageDto) {
    return this.catalogService.updateWorkspaceFeatureUsage(id, data);
  }

  @Post('workspace-feature-usage/increment')
  @ApiOperation({ 
    summary: 'Increment workspace feature usage',
    description: 'Increment the usage count for a specific feature, workspace, and office location for the current month'
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        workspaceId: { type: 'string', description: 'Workspace ID' },
        officeLocationId: { type: 'string', description: 'Office Location ID' },
        featureId: { type: 'string', description: 'Feature ID' },
        incrementBy: { type: 'number', description: 'Amount to increment by (default: 1)', default: 1 }
      },
      required: ['workspaceId', 'officeLocationId', 'featureId']
    },
    description: 'Workspace feature usage increment data'
  })
  @ApiResponse({ status: 200, description: 'Workspace feature usage incremented successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data or failed to increment' })
  async incrementWorkspaceFeatureUsage(@Body() data: {
    workspaceId: string;
    officeLocationId: string;
    featureId: string;
    incrementBy?: number;
  }) {
    const { workspaceId, officeLocationId, featureId, incrementBy = 1 } = data;
    return this.catalogService.incrementWorkspaceFeatureUsage(workspaceId, officeLocationId, featureId, incrementBy);
  }
}
