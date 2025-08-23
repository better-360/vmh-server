import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  UseGuards,
  HttpStatus,
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
import {  
  PackageResponseDto,
  MailType,
  PackageStatus,
  MailResponseDto,
} from 'src/dtos/mail.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Context } from 'src/common/decorators/context.decorator';
import { ContextDto } from 'src/dtos/user.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Mail Management')
@ApiBearerAuth()
@Controller('mails')
@UseGuards(JwtAuthGuard)
@Public()
export class MailController {
  constructor(private readonly mailService: MailService) {}


  @Get()
  @ApiOperation({
    summary: 'Get all mails',
    description: 'Retrieve all mails'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All mails retrieved',
    type: [MailResponseDto]
  })
  async getMails(@Query() query: any, @Context() context: ContextDto) {
    throw new Error('This endpoint is deprecated. Use /customer/mails for customer access or /admin/mails for admin access.');
  } 

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get mail by ID',
    description: 'Retrieve a specific package with all its items and related information'
  })
  @ApiParam({ name: 'id', description: 'Package ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Package found',
    type: PackageResponseDto
  })
  @ApiNotFoundResponse({ description: 'Package not found' })
  async getMailById(@Param('id') id: string) {
    console.log('Fetching mail with ID:', id);
    return this.mailService.findOne(id);
  }

} 