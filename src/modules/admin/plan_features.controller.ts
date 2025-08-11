import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { PlanFeaturesService } from "../entitlements/plan_features.service";
import { ApiOperation, ApiQuery, ApiResponse, ApiBody, ApiParam, ApiNotFoundResponse, ApiBadRequestResponse, ApiConflictResponse, ApiTags } from "@nestjs/swagger";
import { CreatePlanFeatureDto, UpdatePlanFeatureDto } from "src/dtos/plan_entitlements.dto";
import { ApiBearerAuth } from "@nestjs/swagger";

@ApiTags('Admin Plan Feature Management')
@ApiBearerAuth()
@Controller('admin/plan-features')
export class PlanFeaturesController {
  constructor(private readonly planFeaturesService: PlanFeaturesService) {}

  @Get()
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
  async getPlanFeatures(@Query() query: any) {
    return this.planFeaturesService.getPlanFeatures(query);
  }


  @Post('')
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
    return this.planFeaturesService.createPlanFeature(data);
  }

  @Put('/:id')
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
    return this.planFeaturesService.updatePlanFeature(id, data);
  }

  @Delete('/:id')
  @ApiOperation({ 
    summary: 'Remove feature from plan',
    description: 'Soft delete a plan-feature relationship'
  })
  @ApiParam({ name: 'id', description: 'Plan Feature ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Feature removed from plan successfully' })
  @ApiNotFoundResponse({ description: 'Plan feature not found' })
  @ApiBadRequestResponse({ description: 'Failed to remove feature from plan' })
  async deletePlanFeature(@Param('id') id: string) {
    return this.planFeaturesService.deletePlanFeature(id);
  }

  @Post('bulk-create')
  @ApiOperation({ 
    summary: 'Bulk add features to plan',
    description: 'Add multiple features to a plan in a single transaction'
  })
  @ApiBody({ description: 'Bulk plan features creation data' })
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
  async bulkCreatePlanFeatures(@Body() data: any) {
    return this.planFeaturesService.bulkCreatePlanFeatures(data.planId, data.features);
  }

  @Put('bulk-update')
  @ApiOperation({ 
    summary: 'Bulk update plan features',
    description: 'Update multiple plan-feature relationships in a single transaction'
  })
  @ApiBody({ description: 'Bulk plan features update data' })
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
  async bulkUpdatePlanFeatures(@Body() data: any) {
    return this.planFeaturesService.updatePlanFeature(data.id, data);
  }

}