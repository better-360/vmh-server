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
import { CatalogService } from '../catalog/catalog.service';
import { FeaturesService } from '../catalog/features.service';
import { PlansService } from '../catalog/plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFeatureDto, UpdateFeatureDto } from 'src/dtos/feature.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { CreatePlanFeatureDto, UpdatePlanFeatureDto } from 'src/dtos/plan_entitlements.dto';

@ApiTags('Admin Feature Management')
@ApiBearerAuth()
@Controller('admin/features')
@UseGuards(JwtAuthGuard)
@Public()
export class AdminFeaturesController {
  constructor(
    private readonly featuresService: FeaturesService,
  ) {}
  
  // =====================
  // PLAN FEATURES ENDPOINTS
  // =====================

  @Get('plan-features/:id')
  @ApiOperation({ 
    summary: 'Get plan feature by ID',
    description: 'Retrieve detailed information about a specific plan-feature relationship'
  })
  @ApiParam({ name: 'id', description: 'Plan Feature ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Plan feature retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Plan feature not found' })
  async getPlanFeatureById(@Param('id') id: string) {
    return this.featuresService.getFeatureById(id);
  }

  // =====================
  // FEATURES ENDPOINTS
  // =====================

  @Get('all')
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
  async getFeatures(@Query() query: any) {
    return this.featuresService.getFeatures(query);
  }

  @Get('/:id')
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

  @Post('create')
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

  @Put(':id/update')
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

  @Delete(':id/delete')
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

  @Get(':id/usage-in-plans')
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
    return this.featuresService.getFeatureUsageStats(featureId);
  }
}
