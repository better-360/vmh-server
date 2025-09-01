import {
    Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { MailActionsService } from './actions.service';
import { CarrierService, PackagingOptionService, ShippingSpeedService } from '../shipping/shipping.service';
import { CreateMailActionDto } from 'src/dtos/mail-actions.dto';

@ApiTags('Mail Actions')
@Public()
@Controller('actions')
export class MailActionsController {
  constructor(private readonly actionsService: MailActionsService,
    private readonly packagingService: PackagingOptionService,
    private readonly carrierService: CarrierService,
    private readonly speedService: ShippingSpeedService,
  ) {}

  @Get('speeds/:locationId')
  @ApiOperation({ summary: 'List active shipping speeds for a location' })
  @ApiParam({ name: 'locationId', description: 'Office location ID' })
  @ApiResponse({ status: 200, description: 'List of speeds.' })
  async findSpeedOptions(@Param('locationId') locationId: string) {
    return await this.speedService.findAssigned(locationId);
  }

  @Get('packaging/:locationId')
  @ApiOperation({ summary: 'List active packaging options for a location' })
  @ApiParam({ name: 'locationId', description: 'Office location ID' })
  @ApiResponse({ status: 200, description: 'List of packaging options.' })
  findPackagingOptions(@Param('locationId') locationId: string) {
    return this.packagingService.findAssigned(locationId);
  }

  @Get('carrier/:locationId')
  @ApiOperation({ summary: 'List active carriers for a location' })
  @ApiParam({ name: 'locationId', description: 'Office location ID' })
  @ApiResponse({ status: 200, description: 'List of carriers.' })
  findAllCarriers(@Param('locationId') locationId: string) {
    return this.carrierService.findAssigned(locationId);
  }
}
