import { CreateDeliveryAddressDto, DeliveryAddressResponseDto, UpdateDeliveryAddressDto } from "src/dtos/delivery-address.dto";
import { MailboxService } from "./mailbox.service";
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { Context, CurrentUser } from "src/common/decorators";
import { ContextDto } from "src/dtos/user.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CaslAbilityFactory } from "src/authorization/casl/ability.factory";
import { IUser } from "src/common/interfaces/user.interface";

@ApiBearerAuth()
@Controller('mailboxes')
export class MailboxController {
  constructor(private readonly mailboxService: MailboxService, private readonly caslAbilityFactory: CaslAbilityFactory) {}


  @Get('dashboard')
  async getMailboxDashboard(@Context() context: ContextDto): Promise<any> {
    return this.mailboxService.getMailboxDashboard(context.mailboxId);
  }

  @Post('delivery-address')
  async createDeliveryAddress(@Body() createDeliveryAddressDto: CreateDeliveryAddressDto,@Context() context: ContextDto): Promise<DeliveryAddressResponseDto> {
    return this.mailboxService.createDeliveryAddress(context.mailboxId, createDeliveryAddressDto);
  }

  @Get('delivery-addresses')
  async getDeliveryAddresses(@Context() context: ContextDto): Promise<DeliveryAddressResponseDto[]> {
    return this.mailboxService.getDeliveryAddresses(context.mailboxId);
  } 

  @Put('delivery-address/:id')
  async updateDeliveryAddress(@Param('id') id: string, @Body() updateDeliveryAddressDto: UpdateDeliveryAddressDto,@CurrentUser() user: IUser): Promise<DeliveryAddressResponseDto> {
    const ability = await this.caslAbilityFactory.createForUser(user);
    return this.mailboxService.updateDeliveryAddress(id, updateDeliveryAddressDto, ability);
  }

  @Delete('delivery-address/:id')
  async deleteDeliveryAddress(@Param('id') id: string,@CurrentUser() user: IUser): Promise<void> {
    const ability = await this.caslAbilityFactory.createForUser(user);
    return this.mailboxService.deleteDeliveryAddress(id, ability);
  }
}   