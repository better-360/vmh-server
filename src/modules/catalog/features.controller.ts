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
  FeatureQueryDto,
  CreateFeatureDto,
  UpdateFeatureDto,
} from 'src/dtos/plan.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Feature Management')
@ApiBearerAuth()
@Controller('features')
@UseGuards(JwtAuthGuard)
@Public()
export class FeaturesController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly featuresService: FeaturesService,
    private readonly plansService: PlansService,
  ) {}
  
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
}
