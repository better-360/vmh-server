import { Module } from "@nestjs/common";
import { PackageService } from "./package.service";


@Module({
    imports: [],
    providers: [PackageService],
    exports: [PackageService],
    controllers: [],
})
export class PackageModule {}