import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { TaskService } from "./task.service";
import { TaskMessageDto } from "src/dtos/support.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { ContextDto } from "src/dtos/user.dto";
import { Context } from "src/common/decorators/context.decorator";
import { CaslAbilityFactory } from "src/authorization/casl/ability.factory";
import { IUser } from "src/common/interfaces/user.interface";

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService, private readonly caslAbilityFactory: CaslAbilityFactory) {}

    @ApiOperation({ summary: 'Get tasks' })
    @Get()
    async getTasks(@Context() context: ContextDto) {
      return this.taskService.getTasks(context.mailboxId);
    }
    
    @Get(':id')
    @ApiOperation({ summary: 'Get task by id' })
    async getTask(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.taskService.getTaskById(id);
    }

    @Post(':id/messages')
    @ApiOperation({ summary: 'Add task message (user)' })
    addMessage(@Param('id') id: string, @Body() dto: TaskMessageDto, @CurrentUser('id') userId: string) {
        return this.taskService.addMessage(id, userId, dto);
    }

}