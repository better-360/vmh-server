import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";


@Injectable()
export class ShippingService{
  private readonly logger = new Logger(ShippingService.name);
private readonly prisma:PrismaService
  constructor() {}

  async test(){
    this.logger.debug('Shipping module inited');
  }

}