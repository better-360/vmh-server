import { Body, Controller, Param, Post, Put, Get, Query, Delete, Patch } from '@nestjs/common';
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
import { SubscriptionService, CreateSubscriptionItemDto, UpdateSubscriptionItemDto, SubscriptionItemQueryDto } from './subscription.service';
import { SubscriptionItemStatus, ProductType } from '@prisma/client';

@ApiTags('Subscription Items')
@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
  ) {}

  // =====================
  // SUBSCRIPTION ITEM ENDPOINTS
  // =====================

  @Get()
  @ApiOperation({ 
    summary: 'Get subscription items',
    description: 'Retrieve subscription items with filtering and pagination'
  })
  @ApiQuery({ name: 'mailboxId', required: false, description: 'Filter by mailbox ID' })
  @ApiQuery({ name: 'itemType', required: false, enum: ProductType, description: 'Filter by item type' })
  @ApiQuery({ name: 'status', required: false, enum: SubscriptionItemStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Subscription items retrieved successfully' })
  async getSubscriptionItems(@Query() query: SubscriptionItemQueryDto) {
    return this.subscriptionService.getSubscriptionItems(query);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get subscription item by ID',
    description: 'Retrieve detailed information about a specific subscription item'
  })
  @ApiParam({ name: 'id', description: 'Subscription Item ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Subscription item retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Subscription item not found' })
  async getSubscriptionItemById(@Param('id') id: string) {
    return this.subscriptionService.getSubscriptionItemById(id);
  }

  @Get('mailbox/:mailboxId')
  @ApiOperation({ 
    summary: 'Get subscription items by mailbox',
    description: 'Retrieve all subscription items for a specific mailbox'
  })
  @ApiParam({ name: 'mailboxId', description: 'Mailbox ID', type: 'string' })
  @ApiQuery({ name: 'itemType', required: false, enum: ProductType, description: 'Filter by item type' })
  @ApiQuery({ name: 'status', required: false, enum: SubscriptionItemStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Subscription items retrieved successfully' })
  async getSubscriptionItemsByMailbox(
    @Param('mailboxId') mailboxId: string,
    @Query() query: Omit<SubscriptionItemQueryDto, 'mailboxId'>
  ) {
    return this.subscriptionService.getSubscriptionItemsByMailbox(mailboxId, query);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create subscription item',
    description: 'Add a new item to a mailbox subscription'
  })
  @ApiBody({ 
    description: 'Subscription item creation data',
    schema: {
      type: 'object',
      properties: {
        mailboxId: { type: 'string', description: 'Mailbox ID' },
        itemType: { type: 'string', enum: Object.values(ProductType), description: 'Item type' },
        itemId: { type: 'string', description: 'Product or Addon ID' },
        priceId: { type: 'string', description: 'Price variant ID', nullable: true },
        billingCycle: { type: 'string', description: 'Billing cycle' },
        quantity: { type: 'number', description: 'Quantity', default: 1 },
        unitPrice: { type: 'number', description: 'Unit price in cents' },
        currency: { type: 'string', description: 'Currency', default: 'USD' },
        startDate: { type: 'string', format: 'date-time', description: 'Start date' },
        endDate: { type: 'string', format: 'date-time', description: 'End date', nullable: true },
        itemName: { type: 'string', description: 'Item name' },
        itemDescription: { type: 'string', description: 'Item description', nullable: true },
      },
      required: ['mailboxId', 'itemType', 'itemId', 'unitPrice', 'startDate', 'itemName']
    }
  })
  @ApiResponse({ status: 201, description: 'Subscription item created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Mailbox not found' })
  async createSubscriptionItem(@Body() createDto: CreateSubscriptionItemDto) {
    return this.subscriptionService.createSubscriptionItem(createDto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update subscription item',
    description: 'Update an existing subscription item'
  })
  @ApiParam({ name: 'id', description: 'Subscription Item ID', type: 'string' })
  @ApiBody({ 
    description: 'Subscription item update data',
    schema: {
      type: 'object',
      properties: {
        quantity: { type: 'number', description: 'Quantity' },
        unitPrice: { type: 'number', description: 'Unit price in cents' },
        endDate: { type: 'string', format: 'date-time', description: 'End date', nullable: true },
        status: { type: 'string', enum: Object.values(SubscriptionItemStatus), description: 'Status' },
        isActive: { type: 'boolean', description: 'Active status' },
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Subscription item updated successfully' })
  @ApiNotFoundResponse({ description: 'Subscription item not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async updateSubscriptionItem(
    @Param('id') id: string, 
    @Body() updateDto: UpdateSubscriptionItemDto
  ) {
    return this.subscriptionService.updateSubscriptionItem(id, updateDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ 
    summary: 'Deactivate subscription item',
    description: 'Deactivate a subscription item (soft delete)'
  })
  @ApiParam({ name: 'id', description: 'Subscription Item ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Subscription item deactivated successfully' })
  @ApiNotFoundResponse({ description: 'Subscription item not found' })
  async deactivateSubscriptionItem(@Param('id') id: string) {
    return this.subscriptionService.deactivateSubscriptionItem(id);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete subscription item',
    description: 'Permanently delete a subscription item'
  })
  @ApiParam({ name: 'id', description: 'Subscription Item ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Subscription item deleted successfully' })
  @ApiNotFoundResponse({ description: 'Subscription item not found' })
  async deleteSubscriptionItem(@Param('id') id: string) {
    return this.subscriptionService.deleteSubscriptionItem(id);
  }

  // =====================
  // BULK OPERATIONS
  // =====================

  @Patch('mailbox/:mailboxId/bulk-update')
  @ApiOperation({ 
    summary: 'Bulk update subscription items',
    description: 'Update multiple subscription items for a mailbox'
  })
  @ApiParam({ name: 'mailboxId', description: 'Mailbox ID', type: 'string' })
  @ApiBody({ 
    description: 'Bulk update data',
    schema: {
      type: 'object',
      properties: {
        quantity: { type: 'number', description: 'Quantity' },
        unitPrice: { type: 'number', description: 'Unit price in cents' },
        status: { type: 'string', enum: Object.values(SubscriptionItemStatus), description: 'Status' },
        isActive: { type: 'boolean', description: 'Active status' },
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Subscription items updated successfully' })
  async bulkUpdateSubscriptionItems(
    @Param('mailboxId') mailboxId: string,
    @Body() updateDto: Partial<UpdateSubscriptionItemDto>
  ) {
    return this.subscriptionService.bulkUpdateSubscriptionItems(mailboxId, updateDto);
  }

  @Patch('mailbox/:mailboxId/deactivate-all')
  @ApiOperation({ 
    summary: 'Deactivate all subscription items',
    description: 'Deactivate all subscription items for a mailbox'
  })
  @ApiParam({ name: 'mailboxId', description: 'Mailbox ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'All subscription items deactivated successfully' })
  async deactivateAllSubscriptionItems(@Param('mailboxId') mailboxId: string) {
    return this.subscriptionService.deactivateAllSubscriptionItems(mailboxId);
  }

  // =====================
  // STATISTICS
  // =====================

  @Get('statistics/overview')
  @ApiOperation({ 
    summary: 'Get subscription statistics',
    description: 'Get overview statistics for all subscription items'
  })
  @ApiQuery({ name: 'mailboxId', required: false, description: 'Filter by mailbox ID' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getSubscriptionStatistics(@Query('mailboxId') mailboxId?: string) {
    return this.subscriptionService.getSubscriptionItemStatistics(mailboxId);
  }

  @Get('mailbox/:mailboxId/active')
  @ApiOperation({ 
    summary: 'Get active subscription items for mailbox',
    description: 'Get all active subscription items for a specific mailbox'
  })
  @ApiParam({ name: 'mailboxId', description: 'Mailbox ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Active subscription items retrieved successfully' })
  async getActiveSubscriptionItemsForMailbox(@Param('mailboxId') mailboxId: string) {
    return this.subscriptionService.getActiveSubscriptionItemsForMailbox(mailboxId);
  }
}