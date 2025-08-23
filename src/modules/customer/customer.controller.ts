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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MailType, MailStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Context } from 'src/common/decorators/context.decorator';
import { ContextDto } from 'src/dtos/user.dto';
import { PoliciesGuard } from 'src/authorization/guards/policies.guard';
import { CheckPolicies } from 'src/authorization/decorators/check-policies.decorator';
import { PermissionAction } from '@prisma/client';
import { MailEntity } from 'src/common/entities/mail.entity';
import { CaslAbilityFactory } from 'src/authorization/casl/ability.factory';
import { IUser } from 'src/common/interfaces/user.interface';
import { CreateMailActionRequestDto } from 'src/dtos/mail-actions.dto';
import { MailActionsService } from '../actions/actions.service';

@ApiTags('Customer Operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customer')
export class CustomerController {
  constructor(
    private readonly mailService: MailService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly mailActionsService: MailActionsService,
  ) {}

   @Get('mails')
    @ApiOperation({ 
      summary: 'Get all packages',
      description: 'Retrieve a paginated list of all packages with filtering options'
    })
    @ApiQuery({ name: 'type', required: false, enum: MailType, description: 'Filter by mail type' })
    @ApiQuery({ name: 'status', required: false, enum: MailStatus, description: 'Filter by mail status' })
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

    async getMails(
      @Query() query: any, 
      @CurrentUser('id') userId: string,
      @CurrentUser() user: IUser,
      @Context() context: ContextDto
    ) {
      const ability = await this.caslAbilityFactory.createForUser(user);
      
      return this.mailService.findAll(query, userId, context, ability);
    }


    @Post('mail-actions/create')
    async createMailAction(@Body() dto: CreateMailActionRequestDto, @CurrentUser() user:any) {
      const ability = await this.caslAbilityFactory.createForUser(user);
      return this.mailActionsService.createActionRequest(dto, user.id, ability);
    }


}