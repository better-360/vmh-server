import {
  Injectable,
  OnModuleInit,
  OnApplicationShutdown,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnApplicationShutdown
{
  private static instance: PrismaService;
  private logger = new Logger('PrismaService');
  constructor() {
    super();
    if (!PrismaService.instance) {
      PrismaService.instance = this;
      this.$connect();
    }
    return PrismaService.instance;
  }

  async onModuleInit() {
    this.logger.log('PrismaService Initialized');
  }

  async onApplicationShutdown() {
    this.logger.log('PrismaService Shutting Down');
    await this.$disconnect();
  }
}
