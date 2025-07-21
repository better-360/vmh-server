import { Module } from "@nestjs/common";
import { PackageService } from "./package.service";
import { PackageController } from "./package.controller";
import { PrismaService } from "src/prisma.service";

@Module({
    imports: [],
    providers: [PackageService, PrismaService],
    exports: [PackageService],
    controllers: [PackageController],
})
export class PackageModule {}