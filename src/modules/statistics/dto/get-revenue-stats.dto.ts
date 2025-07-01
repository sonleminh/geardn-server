import { IsOptional, IsArray, IsEnum, IsDateString } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class GetRevenueStatsDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
} 