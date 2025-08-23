import { Body, Controller, Get, Param, Patch, Post, Delete, Query, UseGuards } from "@nestjs/common";
import { TaskService } from "./task.service";
import { TaskMessageDto } from "src/dtos/support.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}


    @Get(':id')
    @ApiOperation({ summary: 'Get task by id' })
    get(@Param('id') id: string) {
        return this.taskService.getTaskById(id);
    }

    @Get('office-location/:officeLocationId')
    @ApiOperation({ summary: 'List tasks by office location' })
    listByOffice(@Param('officeLocationId') officeLocationId: string) {
        return this.taskService.listTasksByOfficeLocation(officeLocationId);
    }

    @Get('mailbox/:mailboxId')
    @ApiOperation({ summary: 'List tasks by mailbox' })
    listByMailbox(@Param('mailboxId') mailboxId: string) {
        return this.taskService.listTasksByMailbox(mailboxId);
    }

    @Post(':id/messages')
    @ApiOperation({ summary: 'Add task message (user)' })
    addMessage(@Param('id') id: string, @Body() dto: TaskMessageDto, @CurrentUser('id') userId: string) {
        return this.taskService.addMessage(id, userId, dto);
    }
}