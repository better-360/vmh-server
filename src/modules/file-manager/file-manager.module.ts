import { Global, Module } from '@nestjs/common';
import { FileManagerService } from './file-manager.service';
import { S3Service } from './s3.service';

@Global()
@Module({
  providers: [FileManagerService,S3Service],
  exports: [FileManagerService,S3Service],
})
export class FileManagerModule {}
