import { PlanAddonsService } from "../entitlements/plan_addons.service";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { Controller, Post, Body, Get, Param ,Patch, Delete} from '@nestjs/common';
import { CreatePlanAddonDto, PlanAddonResponseDto, UpdatePlanAddonDto } from "src/dtos/plan_entitlements.dto";

@ApiTags('Admin Plan Addon Management')
@Public()
@Controller('admin/plan-addons')
export class PlanAddonsController {
  constructor(private readonly planAddonsService: PlanAddonsService) {}

  @Post('/assign')
  @ApiOperation({ summary: 'Add addon to plan' })
  @ApiResponse({ status: 201, description: 'Addon added to plan successfully' })
  @ApiResponse({ status: 404, description: 'Plan or addon not found' })
  addAddon(@Body() createPlanAddonDto: CreatePlanAddonDto) {
    return this.planAddonsService.assignProductToPlanAddon(createPlanAddonDto);
  }

  @Get('/plan/:id') 
  @ApiOperation({ summary: 'Get addons by plan ID' })
  @ApiResponse({ status: 200, description: 'Addons retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Addons not found' })
  getAddons(@Param('id') id: string) {
    return this.planAddonsService.getPlanAddons(id);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update addon' })
  @ApiResponse({ status: 200, description: 'Addon updated successfully' })
  @ApiResponse({ status: 404, description: 'Addon not found' })
  updateAddon(@Param('id') id: string, @Body() updateAddonDto: UpdatePlanAddonDto) {
    return this.planAddonsService.updatePlanAddon(id, updateAddonDto);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete addon' })
  @ApiResponse({ status: 200, description: 'Addon deleted successfully' })
  @ApiResponse({ status: 404, description: 'Addon not found' })
  deleteAddon(@Param('id') id: string) {
    return this.planAddonsService.removePlanAddon(id);
  }
}  