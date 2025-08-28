import { Body, Controller, Post } from "@nestjs/common";
import { FileManagerService } from "./file-manager.service";
import { S3Service } from "./s3.service";

@Controller('file-manager')
export class FileManagerController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('presigned-url')
  async getPresignedUrl(@Body() body: any) {
    return this.s3Service.generatePresignedUrl(body.originalName, body.contentType, body.folder, body.applicationNumber);
  }

  @Post('admin-presigned-url')
  async getAdminPresignedUrl(@Body() body: any) {
    return this.s3Service.getAdminPresignedUrl(body);
  }
}