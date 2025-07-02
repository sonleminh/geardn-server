import { IsDateString, IsOptional } from 'class-validator';

/**
 * DTO for getting profit and revenue stats between two dates.
 */
export class GetProfitRevenueStatsDto {
  @IsDateString()
  fromDate!: string;

  @IsDateString()
  toDate!: string;
}