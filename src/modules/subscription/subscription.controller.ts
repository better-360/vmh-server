import { Body, Controller, Param, Post, Put, Get, Query, Delete, Patch } from '@nestjs/common';
import { 
  CreateInitialSubscriptionDto, 
  AddItemToSubscriptionDto,
  UpdateWorkspaceSubscriptionDto,
  UpdateWorkspaceSubscriptionItemDto,
  WorkspaceSubscriptionQueryDto 
} from 'src/dtos/plan.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ApiConflictResponse, 
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBody, 
  ApiOperation, 
  ApiParam,
  ApiQuery 
} from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';

@ApiTags('Workspace Subscriptions')
@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
  ) {}

  // =====================
  // WORKSPACE SUBSCRIPTION ENDPOINTS
  // =====================

  @Get()
  @ApiOperation({ 
    summary: 'Get workspace subscriptions',
    description: 'Retrieve workspace subscriptions with filtering and pagination'
  })
  @ApiQuery({ type: WorkspaceSubscriptionQueryDto, required: false })
  @ApiResponse({ status: 200, description: 'Subscriptions retrieved successfully' })
  async getWorkspaceSubscriptions(@Query() query?: WorkspaceSubscriptionQueryDto) {
    return this.subscriptionService.getWorkspaceSubscriptions(query);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get workspace subscription by ID',
    description: 'Retrieve a specific workspace subscription with its items'
  })
  @ApiParam({ name: 'id', description: 'Subscription ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Subscription not found' })
  async getWorkspaceSubscriptionById(@Param('id') id: string) {
    return this.subscriptionService.getWorkspaceSubscriptionById(id);
  }

  @Post('initial')
  @ApiOperation({ 
    summary: 'Create initial subscription',
    description: 'Create a new workspace subscription with initial plans, products, and addons'
  })
  @ApiBody({ type: CreateInitialSubscriptionDto, description: 'Initial subscription data' })
  @ApiResponse({ status: 201, description: 'Initial subscription created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Workspace or office location not found' })
  @ApiConflictResponse({ description: 'Active subscription already exists for this office location' })
  async createInitialSubscription(@Body() data: CreateInitialSubscriptionDto) {
    return this.subscriptionService.createInitialSubscription(data);
  }

  @Post('add-item')
  @ApiOperation({ 
    summary: 'Add item to existing subscription',
    description: 'Add a new plan, product, or addon to an existing subscription'
  })
  @ApiBody({ type: AddItemToSubscriptionDto, description: 'Add item data' })
  @ApiResponse({ status: 201, description: 'Item added to subscription successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Subscription or item not found' })
  async addItemToSubscription(@Body() data: AddItemToSubscriptionDto) {
    return this.subscriptionService.addItemToSubscription(data);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update workspace subscription',
    description: 'Update workspace subscription details'
  })
  @ApiParam({ name: 'id', description: 'Subscription ID', type: 'string' })
  @ApiBody({ type: UpdateWorkspaceSubscriptionDto, description: 'Subscription update data' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data or failed to update' })
  @ApiNotFoundResponse({ description: 'Subscription not found' })
  async updateWorkspaceSubscription(
    @Param('id') id: string, 
    @Body() data: UpdateWorkspaceSubscriptionDto
  ) {
    return this.subscriptionService.updateWorkspaceSubscription(id, data);
  }

  @Patch('item/:itemId')
  @ApiOperation({ 
    summary: 'Update subscription item',
    description: 'Update a specific subscription item (plan, product, or addon)'
  })
  @ApiParam({ name: 'itemId', description: 'Subscription Item ID', type: 'string' })
  @ApiBody({ type: UpdateWorkspaceSubscriptionItemDto, description: 'Item update data' })
  @ApiResponse({ status: 200, description: 'Subscription item updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data or failed to update' })
  @ApiNotFoundResponse({ description: 'Subscription item not found' })
  async updateWorkspaceSubscriptionItem(
    @Param('itemId') itemId: string, 
    @Body() data: UpdateWorkspaceSubscriptionItemDto
  ) {
    return this.subscriptionService.updateWorkspaceSubscriptionItem(itemId, data);
  }

  @Delete(':id/cancel')
  @ApiOperation({ 
    summary: 'Cancel workspace subscription',
    description: 'Cancel workspace subscription and all its items'
  })
  @ApiParam({ name: 'id', description: 'Subscription ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled successfully' })
  @ApiBadRequestResponse({ description: 'Failed to cancel subscription' })
  @ApiNotFoundResponse({ description: 'Subscription not found' })
  async cancelWorkspaceSubscription(@Param('id') id: string) {
    return this.subscriptionService.cancelWorkspaceSubscription(id);
  }

  @Delete('item/:itemId/cancel')
  @ApiOperation({ 
    summary: 'Cancel subscription item',
    description: 'Cancel a specific subscription item'
  })
  @ApiParam({ name: 'itemId', description: 'Subscription Item ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Subscription item cancelled successfully' })
  @ApiBadRequestResponse({ description: 'Failed to cancel subscription item' })
  @ApiNotFoundResponse({ description: 'Subscription item not found' })
  async cancelSubscriptionItem(@Param('itemId') itemId: string) {
    return this.subscriptionService.cancelSubscriptionItem(itemId);
  }

  // =====================
  // UTILITY ENDPOINTS
  // =====================

  @Get('office/:officeLocationId/active')
  @ApiOperation({ 
    summary: 'Get active subscriptions for office',
    description: 'Retrieve all active subscriptions for a specific office location'
  })
  @ApiParam({ name: 'officeLocationId', description: 'Office Location ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Active subscriptions retrieved successfully' })
  async getActiveSubscriptionsForOffice(@Param('officeLocationId') officeLocationId: string) {
    return this.subscriptionService.getActiveSubscriptionsForOffice(officeLocationId);
  }

  @Get('workspace/:workspaceId/active')
  @ApiOperation({ 
    summary: 'Get active subscriptions for workspace',
    description: 'Retrieve all active subscriptions for a specific workspace'
  })
  @ApiParam({ name: 'workspaceId', description: 'Workspace ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Active subscriptions retrieved successfully' })
  async getWorkspaceActiveSubscriptions(@Param('workspaceId') workspaceId: string) {
    return this.subscriptionService.getWorkspaceActiveSubscriptions(workspaceId);
  }
}
