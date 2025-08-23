import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { TaskService } from '../task/task.service';
import { CreateTaskDto, UpdateTaskDto, TaskMessageDto } from 'src/dtos/support.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Context, Public } from 'src/common/decorators';
import { ContextDto } from 'src/dtos/user.dto';
import { isValidUUID } from 'src/utils/validate';

@ApiTags('Admin - Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN, Role.STAFF, Role.SUPERADMIN)
@Controller('admin/tasks')
export class AdminTaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('office-location/:officeLocationId')
  @ApiOperation({ summary: 'List tasks by office location' })
  @ApiParam({ name: 'officeLocationId' })
  listByOffice(@Param('officeLocationId') officeLocationId: string) {
    return this.taskService.listTasksByOfficeLocation(officeLocationId);
  }


  @Post()
  @ApiOperation({ summary: 'Create task' })
  create(@Body() dto: CreateTaskDto, @CurrentUser('id') userId: string, @Context() context: ContextDto) {
    return this.taskService.createTask(userId, dto);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a task' })
  getTask(@Param('id') id: string, @CurrentUser('id') userId: string) {
      return this.taskService.getTaskById(id);
  }
  
  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.taskService.updateTask(id, dto as any);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  delete(@Param('id') id: string) {
    return this.taskService.deleteTask(id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Add message as staff' })
  addMessage(@Param('id') taskId: string, @Body() dto: TaskMessageDto, @CurrentUser('id') userId: string) {
    if(!isValidUUID(taskId)) throw new BadRequestException('Invalid task ID');
    return this.taskService.addMessage(taskId, userId, dto);
  }
}


