import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { ResetCycle } from '@prisma/client';
import { PriceResponseDto } from './items.dto';
