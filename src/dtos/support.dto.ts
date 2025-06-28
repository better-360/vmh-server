import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
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
  @ApiProperty({ example: 'Dosya adı' })
  name: string;
  @ApiProperty({ example: 'https://example.com/file.pdf' })
  url: string;
  @ApiProperty({ example: 'pdf' })
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


export class CreateTicketDto {

  @ApiPropertyOptional({
    description: 'Company ID of the ticket',
    example: 'UUID',
  })
  @IsString()
  @IsOptional()
  companyId?: string;

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

  @ApiProperty({type: [TicketMessageDto]})
  @Type(() => TicketMessageDto)
  message: TicketMessageDto;

  @ApiProperty({
    description: 'Status of the ticket',
    example: 'LOW|MEDIUM|HIGH',
  })
  @IsEnum(TicketPriority)
  priority: TicketPriority;

}