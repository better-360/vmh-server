import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AssignHandlerDto, ToggleHandlerDto } from 'src/dtos/handler.dto';
import { HandlerService } from '../handler/handler.service';

@ApiTags('Admin - Mail Handlers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN)
@Controller('admin/handlers')
export class AdminHandlerController {
  constructor(private readonly handlerService: HandlerService) {}

  @Post('assign')
  @ApiOperation({ summary: 'Assign a user to an office location as handler' })
  assign(@Body() dto: AssignHandlerDto) {
    return this.handlerService.assignUserToOfficeLocation(dto.userId, dto.officeLocationId);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Revoke handler assignment from user' })
  @ApiParam({ name: 'userId' })
  revoke(@Param('userId') userId: string) {
    return this.handlerService.revokeUserFromOfficeLocation(userId);
  }

  @Get('office-location/:officeLocationId')
  @ApiOperation({ summary: 'List handlers by office location' })
  @ApiParam({ name: 'officeLocationId' })
  listByLocation(@Param('officeLocationId') officeLocationId: string) {
    return this.handlerService.listHandlersByOfficeLocation(officeLocationId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get assignment by user' })
  @ApiParam({ name: 'userId' })
  getByUser(@Param('userId') userId: string) {
    return this.handlerService.getAssignmentByUser(userId);
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Toggle assignment active status' })
  @ApiParam({ name: 'userId' })
  toggle(@Param('userId') userId: string, @Body() body: ToggleHandlerDto) {
    const { isActive } = body;
    if (typeof isActive !== 'boolean') {
      // If not provided, default to deactivating
      return this.handlerService.setAssignmentActive(userId, false);
    }
    return this.handlerService.setAssignmentActive(userId, isActive);
  }
}


