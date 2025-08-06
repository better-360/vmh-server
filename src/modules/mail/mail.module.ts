import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MailController } from "./mail.controller";
import { PrismaService } from "src/prisma.service";

@Module({
    imports: [],
    providers: [MailService, PrismaService],
    exports: [MailService],
    controllers: [MailController],
})
export class MailModule {}