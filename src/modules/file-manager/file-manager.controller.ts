import { Body, Controller, Post } from "@nestjs/common";
import { S3Service } from "./s3.service";
import { Context } from "src/common/decorators";
import { ContextDto } from "src/dtos/user.dto";
import { ApiBearerAuth } from "@nestjs/swagger";

@ApiBearerAuth()
@Controller('file-manager')
export class FileManagerController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('presigned-url')
  async getPresignedUrl(@Body() body: any,@Context()context:ContextDto) {
    return this.s3Service.generatePresignedUrl(body.originalName, body.contentType, body.folder, context.mailboxId);
  }

  @Post('admin-presigned-url')
  async getAdminPresignedUrl(@Body() body: any) {
    return this.s3Service.getAdminPresignedUrl(body);
  }
}