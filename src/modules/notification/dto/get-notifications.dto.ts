/* eslint-disable prettier/prettier, linebreak-style */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsBooleanString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GetNotificationsDto {
  @ApiPropertyOptional({ enum: NotificationType })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ description: 'Filter by read state' })
  @IsOptional()
  @IsBooleanString()
  unreadOnly?: string;

  @ApiPropertyOptional({ description: 'Pagination cursor (notification id)' })
  @IsOptional()
  @IsString()
  cursorId?: string;

  @ApiPropertyOptional({ description: 'Pagination cursor (notification createdAt)' })
  @IsOptional()
  @IsString()
  cursorCreatedAt?: string;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

