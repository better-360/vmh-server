import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED',
}

enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export class EditTicketStatusDto {
  @ApiProperty({
    description: 'Status of the ticket',
    example: 'OPEN|IN_PROGRESS|CLOSED',
  })
  @IsEnum(TicketStatus)
  status: TicketStatus;

  @ApiProperty({
    description: 'Status of the ticket',
    example: 'LOW|MEDIUM|HIGH',
  })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;
}


export class MessageAttachment {
  @ApiProperty({ 
    description: 'File name',
    example: 'document.pdf' 
  })
  @IsString()
  name: string;
  
  @ApiProperty({ 
    description: 'File URL',
    example: 'https://example.com/file.pdf' 
  })
  @IsString()
  url: string;
  
  @ApiProperty({ 
    description: 'File type',
    example: 'pdf' 
  })
  @IsString()
  type: string;
}


export class TicketMessageDto {
  @ApiProperty({
    description: 'Subject of the ticket',
    example: 'I have a problem with my account',
  })
  @IsString()
  ticketId: string;

  @ApiProperty({
    description: 'Message of the ticket',
    example: 'I cannot login to my account',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({ type: [MessageAttachment] })
  @Type(() => MessageAttachment)
  @IsOptional()
  @IsArray()
  attachments?: MessageAttachment[];
}


export class FirstTicketMessageDto {
  @ApiProperty({
    description: 'Message of the ticket',
    example: 'I cannot login to my account',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({ 
    description: 'Message attachments',
    type: [MessageAttachment] 
  })
  @ValidateNested({ each: true })
  @Type(() => MessageAttachment)
  @IsOptional()
  @IsArray()
  attachments?: MessageAttachment[];
}

export class CreateTicketDto {
  @ApiProperty({
    description: 'Subject of the ticket',
    example: 'I have a problem with my account',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Category of the ticket',
    example: 'ACCOUNT|PAYMENT|TECHNICAL',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Initial message for the ticket',
    type: FirstTicketMessageDto
  })
  @ValidateNested()
  @Type(() => FirstTicketMessageDto)
  message: FirstTicketMessageDto;

  @ApiProperty({
    description: 'Status of the ticket',
    example: 'LOW|MEDIUM|HIGH',
  })
  @IsEnum(TicketPriority)
  priority: TicketPriority;

}