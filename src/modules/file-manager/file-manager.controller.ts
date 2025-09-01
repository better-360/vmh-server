import { Body, Controller, Post } from "@nestjs/common";
import { S3Service } from "./s3.service";
import { Context } from "src/common/decorators";
import { ContextDto } from "src/dtos/user.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { GeneratePresignedUrlDto, GeneratePresignedUrlFromStuffDto } from "src/dtos/file-manager.dto";

@ApiBearerAuth()
@Controller('file-manager')
export class FileManagerController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('presigned-url')
  async getPresignedUrl(@Body() body: GeneratePresignedUrlDto,@Context()context:ContextDto) {
    console.log("asda")
    return this.s3Service.generatePresignedUrl(body.originalName, body.contentType, body.folder, context.mailboxId);
  }

  @Post('create-url')
  async createPresignedUrl(@Body() body: GeneratePresignedUrlFromStuffDto) {
    console.log("asda")
    return this.s3Service.generatePresignedUrl(body.originalName, body.contentType, body.folder, body.mailboxId);
  }

  
  @Post('admin-presigned-url')
  async getAdminPresignedUrl(@Body() body: any) {
    return this.s3Service.getAdminPresignedUrl(body);
  }
}