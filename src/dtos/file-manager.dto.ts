import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class GeneratePresignedUrlDto{

  @ApiProperty({
    description: 'File original name',
    example: 'ScreenShot-2025-12-12',
  })
  @IsString()
  @IsNotEmpty()
  originalName: string;

    @ApiProperty({
    description: 'File Type',
    example: 'png',
  })
  @IsString()
  @IsNotEmpty()
  contentType: string;

    @ApiProperty({
    description: 'Folder',
    example: 'tickets',
  })
  @IsString()
  @IsNotEmpty()
  folder: string;

}


export class GeneratePresignedUrlFromStuffDto{

  @ApiProperty({
    description: 'File original name',
    example: 'ScreenShot-2025-12-12',
  })
  @IsString()
  @IsNotEmpty()
  originalName: string;

    @ApiProperty({
    description: 'File Type',
    example: 'png',
  })
  @IsString()
  @IsNotEmpty()
  contentType: string;

    @ApiProperty({
    description: 'Folder',
    example: 'tickets',
  })
  @IsString()
  @IsNotEmpty()
  folder: string;

  @ApiProperty({example:'uuid-131231-1231-1231-13-',description:'Mailbox UUID'})
  @IsString()
  @IsNotEmpty()
  mailboxId:string

}