import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FileManagerService {

  constructor(private readonly configService: ConfigService, private readonly prismaService: PrismaService) {
  }
}
