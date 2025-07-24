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
  ApiConflictResponse
} from '@nestjs/swagger';
import { AddonsService } from './addons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateAddonDto,
  UpdateAddonDto,
  AddonQueryDto,
  AddonResponseDto,
  CreateAddonVariantDto,
  UpdateAddonVariantDto,
  AddonVariantQueryDto,
  AddonVariantResponseDto,
  CreatePlanAddonDto,
  UpdatePlanAddonDto,
  PlanAddonQueryDto,
  PlanAddonResponseDto,
  CreateAddonWithVariantsDto,
  BulkCreatePlanAddonsDto,
  BulkUpdatePlanAddonsDto,
} from 'src/dtos/addons.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Addon Management')
@ApiBearerAuth()
@Controller('addons')
@UseGuards(JwtAuthGuard)
@Public()
export class AddonsController {
  constructor(private readonly addonsService: AddonsService) {}

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get addon by ID',
    description: 'Retrieve a specific addon with all its variants and plan associations'
  })
  @ApiParam({ name: 'id', description: 'Addon ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Addon found',
    type: AddonResponseDto
  })
  @ApiNotFoundResponse({ description: 'Addon not found' })
  async getAddonById(@Param('id') id: string) {
    return this.addonsService.getAddonById(id);
  }

  // =====================
  // ADDON VARIANT ENDPOINTS
  // =====================

  @Get('variants/all')
  @ApiOperation({ 
    summary: 'Get all addon variants',
    description: 'Retrieve a paginated list of all addon variants with filtering options'
  })
  @ApiQuery({ name: 'addonId', required: false, type: String, description: 'Filter by addon ID' })
  @ApiQuery({ name: 'currency', required: false, type: String, description: 'Filter by currency' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page (default: 10)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Addon variants retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { 
          type: 'array', 
          items: { 
            $ref: '#/components/schemas/AddonVariantResponseDto'
          }
        },
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
  async getAddonVariants(@Query() query: AddonVariantQueryDto) {
    return this.addonsService.getAddonVariants(query);
  }

  @Get('variants/:id')
  @ApiOperation({ 
    summary: 'Get addon variant by ID',
    description: 'Retrieve a specific addon variant with its addon details'
  })
  @ApiParam({ name: 'id', description: 'Addon variant ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Addon variant found',
    type: AddonVariantResponseDto
  })
  @ApiNotFoundResponse({ description: 'Addon variant not found' })
  async getAddonVariantById(@Param('id') id: string) {
    return this.addonsService.getAddonVariantById(id);
  }

  // =====================
  // PLAN ADDON ENDPOINTS
  // =====================

  @Get('plan-addons/all')
  @ApiOperation({ 
    summary: 'Get all plan-addon associations',
    description: 'Retrieve all associations between plans and addons with filtering options'
  })
  @ApiQuery({ name: 'planId', required: false, type: String, description: 'Filter by plan ID' })
  @ApiQuery({ name: 'addonId', required: false, type: String, description: 'Filter by addon ID' })
  @ApiQuery({ name: 'isIncludedInPlan', required: false, type: Boolean, description: 'Filter by included status' })
  @ApiQuery({ name: 'isRequired', required: false, type: Boolean, description: 'Filter by required status' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page (default: 10)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Plan addons retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { 
          type: 'array', 
          items: { 
            $ref: '#/components/schemas/PlanAddonResponseDto'
          }
        },
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
  async getPlanAddons(@Query() query: PlanAddonQueryDto) {
    return this.addonsService.getPlanAddons(query);
  }

  @Get('plan-addons/:id')
  @ApiOperation({ 
    summary: 'Get plan addon by ID',
    description: 'Retrieve a specific plan-addon association by ID'
  })
  @ApiParam({ name: 'id', description: 'Plan addon ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Plan addon found',
    type: PlanAddonResponseDto
  })
  @ApiNotFoundResponse({ description: 'Plan addon not found' })
  async getPlanAddonById(@Param('id') id: string) {
    return this.addonsService.getPlanAddonById(id);
  }
}