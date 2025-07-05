import { Global, Module } from "@nestjs/common";
import { WorkspaceService } from "./workspace.service";
import { WorkspaceController } from "./workspace.controller";
import { PrismaModule } from "src/prisma.module";
@Global()
@Module({
    imports: [PrismaModule],
    providers: [WorkspaceService],
    exports: [WorkspaceService],
    controllers: [WorkspaceController],
})
export class WorkspaceModule {}