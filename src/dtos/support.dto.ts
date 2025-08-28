import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { IsUUID } from 'class-validator';
import { TaskStatus, TaskPriority, TaskType, $Enums } from '@prisma/client';
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

export class TaskDto {

  @ApiPropertyOptional({ description: 'Title' ,example:'Task title',default:'Task title'})
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Description' ,example:'Task description',default:'Task description'})
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Icon' ,example:'system',default:'system'})
  @IsString()
  @IsOptional()
  Icon?: string;

  @ApiProperty({ enum: TaskPriority ,example:'MEDIUM',default:TaskPriority.MEDIUM})
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @ApiPropertyOptional({ description: 'Due date (ISO)' ,example:'2025-01-01',default:'2025-01-01'})
  @IsDateString()
  @IsOptional()
  dueDate?: string;

}

export class CreateTaskDto extends PartialType(TaskDto) {

  @ApiProperty({ description: 'Mailbox ID' ,example:'123e4567-e89b-12d3-a456-426614174000',default:"e7195890-483d-40c6-86e7-f51fa2d0a6e9"})
  @IsUUID()
  mailboxId: string;

  @ApiPropertyOptional({ type: FirstTicketMessageDto ,example:{message:'Task message'},default:{message:'Task message'}})
  @ValidateNested()
  @Type(() => FirstTicketMessageDto)
  @IsOptional()
  message?: FirstTicketMessageDto;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({ description: 'Due date (ISO)' ,example:'2025-01-01',default:'2025-01-01'})
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ enum: TaskStatus ,description:'Task status',example:'OPEN',default:'OPEN'})
  @IsEnum(TaskStatus)
  @IsOptional()
  status: TaskStatus;


  @ApiPropertyOptional({ enum: TaskType ,description:'Task type',example:'MANUAL',default:'MANUAL'})
  @IsEnum(TaskType)
  @IsOptional()
  type: TaskType;

}

export class TaskMessageDto {
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


