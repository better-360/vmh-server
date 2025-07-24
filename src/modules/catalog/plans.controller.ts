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
import { PlansService } from './plans.service';
import { AddonsService } from './addons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreatePlanDto,
  UpdatePlanDto,
  PlanQueryDto,
  CreatePlanPriceDto,
  UpdatePlanPriceDto,
  PlanPriceQueryDto,
  CreatePlanFromTemplateDto,
  CreatePlanWithFeaturesDto,
  FormattedPlanResponseDto,
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
    private readonly addonsService: AddonsService,
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
  async getPlans(@Query() query: PlanQueryDto) {
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
  @ApiOkResponse({ type: FormattedPlanResponseDto, description: 'Plan retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Plan not found' })
  async getPlanById(@Param('id') id: string) {
    return this.plansService.getPlanById(id);
  }


  // =====================
  // PLAN PRICES ENDPOINTS
  // =====================

 

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
    return this.addonsService.getAddonsByPlanId(planId);
  }

}
