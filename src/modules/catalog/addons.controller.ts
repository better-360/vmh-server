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

  // =====================
  // ADDON ENDPOINTS
  // =====================

  @Get('all')
  @ApiOperation({ 
    summary: 'Get all addons',
    description: 'Retrieve a paginated list of all addons with their variants and plan associations'
  })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in addon name and description' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page (default: 10)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Addons retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { 
          type: 'array', 
          items: { 
            $ref: '#/components/schemas/AddonResponseDto'
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
  async getAddons(@Query() query: AddonQueryDto) {
    return this.addonsService.getAddons(query);
  }

  @Get('active')
  @ApiOperation({ 
    summary: 'Get active addons',
    description: 'Retrieve all active addons with their variants for public use'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Active addons retrieved successfully',
    type: [AddonResponseDto]
  })
  async getActiveAddons() {
    return this.addonsService.getActiveAddons();
  }

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

  @Post()
  @ApiOperation({ 
    summary: 'Create a new addon',
    description: 'Create a new addon without variants'
  })
  @ApiBody({ 
    type: CreateAddonDto,
    description: 'Addon creation data'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Addon created successfully',
    type: AddonResponseDto
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Addon with this name already exists' })
  async createAddon(@Body() createAddonDto: CreateAddonDto) {
    return this.addonsService.createAddon(createAddonDto);
  }

  @Post('with-variants')
  @ApiOperation({ 
    summary: 'Create addon with variants',
    description: 'Create a new addon along with its pricing variants in a single request'
  })
  @ApiBody({ 
    type: CreateAddonWithVariantsDto,
    description: 'Addon and variants creation data'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Addon with variants created successfully',
    type: AddonResponseDto
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Addon with this name already exists' })
  async createAddonWithVariants(@Body() createAddonWithVariantsDto: CreateAddonWithVariantsDto) {
    return this.addonsService.createAddonWithVariants(createAddonWithVariantsDto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update addon',
    description: 'Update an existing addon by ID'
  })
  @ApiParam({ name: 'id', description: 'Addon ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ 
    type: UpdateAddonDto,
    description: 'Addon update data'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Addon updated successfully',
    type: AddonResponseDto
  })
  @ApiNotFoundResponse({ description: 'Addon not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Addon with this name already exists' })
  async updateAddon(@Param('id') id: string, @Body() updateAddonDto: UpdateAddonDto) {
    return this.addonsService.updateAddon(id, updateAddonDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete addon',
    description: 'Soft delete an addon by ID. This will mark the addon as deleted but keep it in the database.'
  })
  @ApiParam({ name: 'id', description: 'Addon ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Addon deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Addon deleted successfully' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Addon not found' })
  async deleteAddon(@Param('id') id: string) {
    return this.addonsService.deleteAddon(id);
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

  @Post('variants')
  @ApiOperation({ 
    summary: 'Create addon variant',
    description: 'Create a new pricing variant for an existing addon'
  })
  @ApiBody({ 
    type: CreateAddonVariantDto,
    description: 'Addon variant creation data'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Addon variant created successfully',
    type: AddonVariantResponseDto
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Addon not found' })
  async createAddonVariant(@Body() createAddonVariantDto: CreateAddonVariantDto) {
    return this.addonsService.createAddonVariant(createAddonVariantDto);
  }

  @Put('variants/:id')
  @ApiOperation({ 
    summary: 'Update addon variant',
    description: 'Update an existing addon variant by ID'
  })
  @ApiParam({ name: 'id', description: 'Addon variant ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ 
    type: UpdateAddonVariantDto,
    description: 'Addon variant update data'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Addon variant updated successfully',
    type: AddonVariantResponseDto
  })
  @ApiNotFoundResponse({ description: 'Addon variant not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async updateAddonVariant(@Param('id') id: string, @Body() updateAddonVariantDto: UpdateAddonVariantDto) {
    return this.addonsService.updateAddonVariant(id, updateAddonVariantDto);
  }

  @Delete('variants/:id')
  @ApiOperation({ 
    summary: 'Delete addon variant',
    description: 'Soft delete an addon variant by ID'
  })
  @ApiParam({ name: 'id', description: 'Addon variant ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Addon variant deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Addon variant deleted successfully' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Addon variant not found' })
  async deleteAddonVariant(@Param('id') id: string) {
    return this.addonsService.deleteAddonVariant(id);
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

  @Post('plan-addons')
  @ApiOperation({ 
    summary: 'Create plan addon association',
    description: 'Associate an addon with a plan, defining how it should be offered to plan subscribers'
  })
  @ApiBody({ 
    type: CreatePlanAddonDto,
    description: 'Plan addon association data'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Plan addon created successfully',
    type: PlanAddonResponseDto
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Plan or addon not found' })
  @ApiConflictResponse({ description: 'This addon is already associated with the plan' })
  async createPlanAddon(@Body() createPlanAddonDto: CreatePlanAddonDto) {
    return this.addonsService.createPlanAddon(createPlanAddonDto);
  }

  @Post('plan-addons/bulk')
  @ApiOperation({ 
    summary: 'Bulk create plan addon associations',
    description: 'Associate multiple addons with a plan in a single request'
  })
  @ApiBody({ 
    type: BulkCreatePlanAddonsDto,
    description: 'Bulk plan addon creation data'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Plan addons created successfully',
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
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Plan not found' })
  async bulkCreatePlanAddons(@Body() bulkCreatePlanAddonsDto: BulkCreatePlanAddonsDto) {
    return this.addonsService.bulkCreatePlanAddons(bulkCreatePlanAddonsDto);
  }

  @Put('plan-addons/:id')
  @ApiOperation({ 
    summary: 'Update plan addon association',
    description: 'Update an existing plan-addon association by ID'
  })
  @ApiParam({ name: 'id', description: 'Plan addon ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ 
    type: UpdatePlanAddonDto,
    description: 'Plan addon update data'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Plan addon updated successfully',
    type: PlanAddonResponseDto
  })
  @ApiNotFoundResponse({ description: 'Plan addon not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async updatePlanAddon(@Param('id') id: string, @Body() updatePlanAddonDto: UpdatePlanAddonDto) {
    return this.addonsService.updatePlanAddon(id, updatePlanAddonDto);
  }

  @Put('plan-addons/bulk')
  @ApiOperation({ 
    summary: 'Bulk update plan addon associations',
    description: 'Update multiple plan-addon associations in a single request'
  })
  @ApiBody({ 
    type: BulkUpdatePlanAddonsDto,
    description: 'Bulk plan addon update data'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Plan addons updated successfully',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/PlanAddonResponseDto' }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async bulkUpdatePlanAddons(@Body() bulkUpdatePlanAddonsDto: BulkUpdatePlanAddonsDto) {
    return this.addonsService.bulkUpdatePlanAddons(bulkUpdatePlanAddonsDto);
  }

  @Delete('plan-addons/:id')
  @ApiOperation({ 
    summary: 'Delete plan addon association',
    description: 'Soft delete a plan-addon association by ID'
  })
  @ApiParam({ name: 'id', description: 'Plan addon ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Plan addon deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Plan addon deleted successfully' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Plan addon not found' })
  async deletePlanAddon(@Param('id') id: string) {
    return this.addonsService.deletePlanAddon(id);
  }

  @Delete('plans/:planId/addons/:addonId')
  @ApiOperation({ 
    summary: 'Remove addon from plan',
    description: 'Completely remove an addon from a plan (hard delete the association)'
  })
  @ApiParam({ name: 'planId', description: 'Plan ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiParam({ name: 'addonId', description: 'Addon ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Addon removed from plan successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Addon removed from plan successfully' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Plan addon relation not found' })
  async removeAddonFromPlan(@Param('planId') planId: string, @Param('addonId') addonId: string) {
    return this.addonsService.removeAddonFromPlan(planId, addonId);
  }
}