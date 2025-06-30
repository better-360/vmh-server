import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { CreateFeatureUsageDto, CreateWorkspaceFeatureUsageDto, UpdateFeatureUsageDto } from 'src/dtos/plan.dto';
import { ApiResponse } from '@nestjs/swagger';
import {ApiConflictResponse, ApiNotFoundResponse,ApiBadRequestResponse,ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import { PlansService } from '../catalog/plans.service';
import { CatalogService } from '../catalog/catalog.service';
import { FeaturesService } from '../catalog/features.service';

@Controller('subscription')
export class SubscriptionController {
    constructor(
        private readonly catalogService: CatalogService,
        private readonly featuresService: FeaturesService,
        private readonly plansService: PlansService,
      ) {}

    // =====================
  // FEATURE USAGE ENDPOINTS
  // =====================

  @Post('feature-usage')
  @ApiOperation({ 
    summary: 'Create feature usage record',
    description: 'Create a new feature usage record for tracking user consumption'
  })
  @ApiBody({ type: CreateFeatureUsageDto, description: 'Feature usage creation data' })
  @ApiResponse({ status: 201, description: 'Feature usage record created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'User, office location, or feature not found' })
  @ApiConflictResponse({ description: 'Feature usage for this month already exists' })
  async createFeatureUsage(@Body() data: CreateWorkspaceFeatureUsageDto) {
    return this.catalogService.createWorkspaceFeatureUsage(data);
  }

  @Put('feature-usage/:id')
  @ApiOperation({ 
    summary: 'Update feature usage record',
    description: 'Update an existing feature usage record'
  })
  @ApiParam({ name: 'id', description: 'Feature Usage ID', type: 'string' })
  @ApiBody({ type: UpdateFeatureUsageDto, description: 'Feature usage update data' })
  @ApiResponse({ status: 200, description: 'Feature usage record updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data or failed to update' })
  async updateFeatureUsage(@Param('id') id: string, @Body() data: UpdateFeatureUsageDto) {
    return this.catalogService.updateWorkspaceFeatureUsage(id, data);
  }

  @Post('feature-usage/increment')
  @ApiOperation({ 
    summary: 'Increment feature usage',
    description: 'Increment the usage count for a specific feature, user, and office location for the current month'
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' },
        officeLocationId: { type: 'string', description: 'Office Location ID' },
        featureId: { type: 'string', description: 'Feature ID' },
        incrementBy: { type: 'number', description: 'Amount to increment by (default: 1)', default: 1 }
      },
      required: ['userId', 'officeLocationId', 'featureId']
    },
    description: 'Feature usage increment data'
  })
  @ApiResponse({ status: 200, description: 'Feature usage incremented successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data or failed to increment' })
  async incrementFeatureUsage(@Body() data: {
    userId: string;
    officeLocationId: string;
    featureId: string;
    incrementBy?: number;
  }) {
    const { userId, officeLocationId, featureId, incrementBy = 1 } = data;
    return this.catalogService.incrementWorkspaceFeatureUsage(userId, officeLocationId, featureId, incrementBy);
  }
}
