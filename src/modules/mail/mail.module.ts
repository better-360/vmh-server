import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MailController } from "./mail.controller";
import { PrismaService } from "src/prisma.service";
import { CaslAbilityFactory } from "src/authorization/casl/ability.factory";
import { MailActionsService } from "../actions/actions.service";

@Module({
    imports: [],
    providers: [MailService,CaslAbilityFactory,MailActionsService],
    exports: [MailService],
    controllers: [MailController],
})
export class MailModule {}