// easypost.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as EasyPost from '@easypost/api';
import { EasyPostService } from './easypost.service';

@Global()
@Module({
  providers: [
    {
      provide: 'EASYPOST_CLIENT',
      useFactory: (config: ConfigService) => {
        const EasyPostClient = require('@easypost/api');
        return new EasyPostClient(config.get('EASYPOST_API_KEY'));
      },
      inject: [ConfigService],
    },
    EasyPostService,
  ],
  exports: ['EASYPOST_CLIENT', EasyPostService],
})
export class EasyPostModule {}
