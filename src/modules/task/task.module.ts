import { Module } from "@nestjs/common";
import { TaskService } from "./task.service";
import { TaskController } from "./task.controller";
import { CaslAbilityFactory } from "src/authorization/casl/ability.factory";

@Module({
    imports: [],
    controllers: [TaskController],
    providers: [TaskService, CaslAbilityFactory],
})
export class TaskModule {}