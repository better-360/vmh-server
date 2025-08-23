import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MailType, MailStatus, User } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Context } from 'src/common/decorators/context.decorator';
import { ContextDto } from 'src/dtos/user.dto';
import { PoliciesGuard } from 'src/authorization/guards/policies.guard';
import { CheckPolicies } from 'src/authorization/decorators/check-policies.decorator';
import { PermissionAction } from '@prisma/client';
import { MailEntity } from 'src/common/entities/mail.entity';
import { CaslAbilityFactory } from 'src/authorization/casl/ability.factory';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { IUser } from 'src/common/interfaces/user.interface';

@ApiTags('Admin - Mail Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PoliciesGuard)
@Roles(Role.ADMIN, Role.STAFF, Role.SUPERADMIN)
@Controller('admin/mails')
export class AdminMailController {
  constructor(
    private readonly mailService: MailService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all packages (Admin/Staff only)',
    description: 'Retrieve a paginated list of all packages with filtering options. Only accessible by Admin and Staff users.'
  })
  @ApiQuery({ name: 'type', required: false, enum: MailType, description: 'Filter by package type' })
  @ApiQuery({ name: 'status', required: false, enum: MailStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'steNumber', required: false, type: String, description: 'Filter by STE number' })
  @ApiQuery({ name: 'senderName', required: false, type: String, description: 'Filter by sender name' })
  @ApiQuery({ name: 'carrier', required: false, type: String, description: 'Filter by carrier' })
  @ApiQuery({ name: 'mailboxId', required: false, type: String, description: 'Filter by mailbox ID' })
  @ApiQuery({ name: 'workspaceId', required: false, type: String, description: 'Filter by workspace ID' })
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
  @CheckPolicies((ability) => ability.can(PermissionAction.MANAGE, MailEntity))
  async getAllMails(
    @Query() query: any, 
    @CurrentUser('id') userId: string,
    @CurrentUser() user: IUser,
    @Context() context: ContextDto,
  ) {    
    // CASL ability oluştur (async)
    const ability = await this.caslAbilityFactory.createForUser(user);
    
    return this.mailService.findAll(query, userId, context, ability);
  }
}
