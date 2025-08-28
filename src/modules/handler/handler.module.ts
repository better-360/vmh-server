import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { SupportService } from '../support/support.service';
import { MailService } from '../mail/mail.service';
import { WorkspaceService } from '../workspace/workspace.service';
import { MailboxService } from '../mailbox/mailbox.service';
import { LocationService } from '../catalog/location.service';
import { HandlerActionRequestsController, HandlerCustomerController, HandlerSupportController, HandlerTaskController, MailHandlerController } from './handler.controller';
import { HandlerService } from './handler.service';
import { TaskService } from '../task/task.service';

@Module({
    imports: [
        HttpModule],
    providers: [
        MailService,
        SupportService,
        WorkspaceService,
        MailboxService,
        LocationService,
        HandlerService,
        TaskService,

    ],
    controllers: [MailHandlerController, HandlerSupportController,HandlerCustomerController,HandlerActionRequestsController,HandlerTaskController],
})
export class HandlerModule { }
