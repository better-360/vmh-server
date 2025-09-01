import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  UseGuards,
  HttpStatus,
  Post,
  Body,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBearerAuth,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { MailService } from './mail.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MailResponseDto,} from 'src/dtos/mail.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Context } from 'src/common/decorators/context.decorator';
import { ContextDto } from 'src/dtos/user.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { IUser } from 'src/common/interfaces/user.interface';
import { CaslAbilityFactory } from 'src/authorization/casl/ability.factory';
import { MailStatus, MailType } from '@prisma/client';
import { CreateMailActionRequestDto } from 'src/dtos/mail-actions.dto';
import { MailActionsService } from '../actions/actions.service';

@ApiTags('Mail Management')
@ApiBearerAuth()
@Controller('mails')
@UseGuards(JwtAuthGuard)
@Public()
export class MailController {
  constructor(private readonly mailService: MailService,
        private readonly caslAbilityFactory: CaslAbilityFactory,
          private readonly mailActionsService: MailActionsService,
        
    
  ) {}

   @Get()
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


  @Get(':id')
  @ApiOperation({ 
    summary: 'Get mail by ID',
    description: 'Retrieve a specific package with all its items and related information'
  })
  @ApiParam({ name: 'id', description: 'Package ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Mail found',
    type: MailResponseDto
  })
  @ApiNotFoundResponse({ description: 'Package not found' })
  async getMailById(@Param('id') id: string) {
    console.log('Fetching mail with ID:', id);
    return this.mailService.findOne(id);
  }


  @Post('create-action')
      async createMailAction(@Body() dto: CreateMailActionRequestDto, @CurrentUser() user:any) {
        const ability = await this.caslAbilityFactory.createForUser(user);
        return this.mailActionsService.createActionRequest(dto, user.id, ability);
      }
} 