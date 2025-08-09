import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpStatus
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
  ApiConflictResponse,
  ApiOkResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreatePlanDto,
  UpdatePlanDto,
  CreatePlanPriceDto,
  UpdatePlanPriceDto,
  CreatePlanWithFeaturesDto,
} from 'src/dtos/plan.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { PlansService } from '../catalog/plans.service';
import { PlanAddonsService } from '../entitlements/plan_addons.service';

@ApiTags('Admin Plans Management')
@ApiBearerAuth()
@Controller('admin/plans')
@UseGuards(JwtAuthGuard)
@Public()
export class AdminPlansController {
  constructor(
    private readonly plansService: PlansService,
    private readonly planAddonsService: PlanAddonsService,
  ) {}

  // =====================
  // PLANS ENDPOINTS
  // =====================

  @Get('all')
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
  async getPlans(@Query() query: any) {
    return this.plansService.getPlans(query);
  }

  @Get('active')
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

  @Get('/:id')
  @ApiOperation({ 
    summary: 'Get plan by ID',
    description: 'Retrieve detailed information about a specific plan including prices and features'
  })
  @ApiParam({ name: 'id', description: 'Plan ID', type: 'string' })
  @ApiNotFoundResponse({ description: 'Plan not found' })
  async getPlanById(@Param('id') id: string) {
    return this.plansService.getPlanById(id);
  }

  @Post('create')
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

  @Post('create-with-features')
  @ApiOperation({ 
    summary: 'Create a complete plan with features and prices',
    description: 'Create a new subscription plan with all features and pricing options in one request'
  })
  @ApiBody({ 
    type: CreatePlanWithFeaturesDto, 
    description: 'Complete plan creation data with features and prices',
    examples: {
      'Premium Business Plan': {
        value: {
          officeLocationId: "123e4567-e89b-12d3-a456-426614174000",
          name: "Premium Business Plan",
          slug: "premium-business", 
          description: "Comprehensive business plan with advanced features",
          imageUrl: "https://example.com/premium-plan.png",
          isActive: true,
          features: [
            {
              featureId: "be2294ec-a909-462f-a81c-276d6ebbfb58",
              includedLimit: 10,
              unitPrice: 500,
              isActive: true
            },
            {
              featureId: "5e37ea6d-cba2-4413-8209-57b3b2a77035", 
              includedLimit: null,
              unitPrice: null,
              isActive: true
            }
          ],
          prices: [
            {
              billingCycle: "MONTHLY",
              amount: 4999,
              currency: "USD",
              description: "Monthly subscription"
            },
            {
              billingCycle: "YEARLY",
              amount: 49999, 
              currency: "USD",
              description: "Annual subscription (save 17%)"
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Plan with features and prices created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        slug: { type: 'string' },
        description: { type: 'string' },
        officeLocation: { type: 'object' },
        features: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              featureId: { type: 'string' },
              includedLimit: { type: 'number', nullable: true },
              unitPrice: { type: 'number', nullable: true },
              feature: { type: 'object' }
            }
          }
        },
        prices: {
          type: 'array', 
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              billingCycle: { type: 'string' },
              amount: { type: 'number' },
              currency: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data or features not found' })
  @ApiNotFoundResponse({ description: 'Office location not found' })
  @ApiConflictResponse({ description: 'Plan with this slug already exists for this location' })
  async createPlanWithFeatures(@Body() data: CreatePlanWithFeaturesDto) {
    return this.plansService.createPlanWithFeatures(data);
  }



  @Put('/:id')
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

  @Delete('/:id')
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

  @Get('plan-prices/all')
  @ApiOperation({ 
    summary: 'Get plan prices',
    description: 'Retrieve plan prices with optional filtering by plan, billing cycle, or currency'
  })
  @ApiQuery({ name: 'planId', required: false, type: String, description: 'Filter by plan ID' })
  @ApiQuery({ name: 'billingCycle', required: false, type: String, description: 'Filter by billing cycle (monthly, yearly, etc.)' })
  @ApiQuery({ name: 'currency', required: false, type: String, description: 'Filter by currency code' })
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
  async getPlanPrices(@Query() query: any) {
    console.log('raw',query)
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


  @Get(':planId/addons')
  @ApiOperation({ 
    summary: 'Get addons for a specific plan',
    description: 'Retrieve all addons associated with a specific plan, formatted for easy consumption'
  })
  @ApiParam({ name: 'planId', description: 'Plan ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Plan addons retrieved successfully',
    schema: {
      type: 'array',
      items: {
        allOf: [
          { $ref: '#/components/schemas/AddonResponseDto' },
          {
            type: 'object',
            properties: {
              planAddonConfig: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  isIncludedInPlan: { type: 'boolean' },
                  discountPercent: { type: 'number' },
                  isRequired: { type: 'boolean' },
                  displayOrder: { type: 'number' }
                }
              }
            }
          }
        ]
      }
    }
  })
  async getAddonsByPlanId(@Param('planId') planId: string) {
    return this.planAddonsService.getPlanAddons(planId);
  }


}
