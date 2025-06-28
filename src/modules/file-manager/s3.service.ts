// s3.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });
  }

  private getFileExtension(originalName: string): string {
    const lastDotIndex = originalName.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return '';
    }
    return originalName.substring(lastDotIndex + 1);
  }

  async generatePresignedUrl(
    originalName: string,
    contentType: string,
    folder: string,
    applicationNumber: string
  ): Promise<{ presignedUrl: string; fileKey: string }> {
    const fileExtension = this.getFileExtension(originalName);
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const fileKey = `applicatorfiles/${folder}/${applicationNumber}/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
    });

    // expiresIn saniye cinsinden (ör: 600 = 10 dakika)
    const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 600 });
    return { presignedUrl, fileKey };
  }

  async getAdminPresignedUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
    });

    // expiresIn burada da saniye cinsinden (ör: 6000 = 100 dakika)
    const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 6000 });
    return presignedUrl;
  }
}
