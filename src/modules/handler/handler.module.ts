import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { SupportService } from '../support/support.service';
import { MailService } from '../mail/mail.service';
import { WorkspaceService } from '../workspace/workspace.service';
import { MailboxService } from '../mailbox/mailbox.service';
import { LocationService } from '../catalog/location.service';
import { MailHandlerController } from './handler.controller';

@Module({
    imports: [
        HttpModule],
    providers: [
        MailService,
        SupportService,
        WorkspaceService,
        MailboxService,
        LocationService,

    ],
    controllers: [
        MailHandlerController    ],
})
export class HandlerModule { }
