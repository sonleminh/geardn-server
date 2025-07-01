import { IsNumber, IsOptional, IsArray, IsEnum, Min, Max } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class GetMonthlyStatsDto {
  @IsNumber()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsOptional()
  @IsArray()
  @IsEnum(OrderStatus, { each: true })
  statuses?: OrderStatus[];
} 