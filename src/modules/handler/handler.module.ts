import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { SupportService } from '../support/support.service';
import { MailService } from '../mail/mail.service';
import { HandlerMailController } from './mail.controller';
import { WorkspaceService } from '../workspace/workspace.service';
import { MailboxService } from '../mailbox/mailbox.service';
import { LocationService } from '../catalog/location.service';

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
        HandlerMailController,
    ],
})
export class HandlerModule { }
