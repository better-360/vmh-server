import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { 
  CreateMailboxDto, 
  UpdateMailboxDto, 
  MailboxResponseDto 
} from 'src/dtos/mailbox.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MailboxService } from '../mailbox/mailbox.service';
import { MailType, MailStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';

@ApiTags('Customer Operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customer')
export class CustomerController {
  constructor(private readonly mailboxService: MailboxService,
    private readonly mailService: MailService,
  ) {}

@Get('workspace/:workspaceId/mailboxes')
  @ApiOperation({ summary: 'Get mailboxes by workspace' })
  @ApiResponse({
    status: 200,
    description: 'Workspace mailboxes retrieved successfully',
    type: [MailboxResponseDto],
  })
  findByWorkspace(@Param('workspaceId') workspaceId: string): Promise<MailboxResponseDto[]> {
    return this.mailboxService.findByWorkspace(workspaceId);
  }


   @Get('mails')
    @ApiOperation({ 
      summary: 'Get all packages',
      description: 'Retrieve a paginated list of all packages with filtering options'
    })
    @ApiQuery({ name: 'workspaceAddressId', required: false, type: String, description: 'Filter by workspace address ID' })
    @ApiQuery({ name: 'type', required: false, enum: MailType, description: 'Filter by package type' })
    @ApiQuery({ name: 'status', required: false, enum: MailStatus, description: 'Filter by status' })
    @ApiQuery({ name: 'steNumber', required: false, type: String, description: 'Filter by STE number' })
    @ApiQuery({ name: 'senderName', required: false, type: String, description: 'Filter by sender name' })
    @ApiQuery({ name: 'carrier', required: false, type: String, description: 'Filter by carrier' })
    @ApiQuery({ name: 'isShereded', required: false, type: Boolean, description: 'Filter by shredded status' })
    @ApiQuery({ name: 'isForwarded', required: false, type: Boolean, description: 'Filter by forwarded status' })
    @ApiQuery({ name: 'receivedAtStart', required: false, type: String, description: 'Filter by received date start (YYYY-MM-DD)' })
    @ApiQuery({ name: 'receivedAtEnd', required: false, type: String, description: 'Filter by received date end (YYYY-MM-DD)' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page (default: 10)' })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Packages retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          data: { 
            type: 'array', 
            items: { 
              $ref: '#/components/schemas/PackageResponseDto'
            }
          },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
              totalPages: { type: 'number' }
            }
          }
        }
      }
    })
    async getMails(@Query() query: any) {
      return this.mailService.findAll(query);
    }
}