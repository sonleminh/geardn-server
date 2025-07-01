import { IsDateString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class GetTimeRangeStatsDto {
  @IsDateString()
  fromDate: string;

  @IsDateString()
  toDate: string;

  @IsOptional()
  @IsArray()
  @IsEnum(OrderStatus, { each: true })
  statuses?: OrderStatus[];
} 