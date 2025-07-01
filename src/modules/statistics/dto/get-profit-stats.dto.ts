import { IsOptional, IsArray, IsEnum, IsDateString } from 'class-validator';
import { OrderStatus } from '@prisma/client';

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