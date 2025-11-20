import { OrderStatus } from '@prisma/client';
import { IsOptional, IsArray, IsEnum, IsDateString } from 'class-validator';

export class GetProfitStatsDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(OrderStatus, { each: true })
  statuses?: OrderStatus[];
} 