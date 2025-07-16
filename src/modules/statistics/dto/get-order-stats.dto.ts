import { IsDateString } from 'class-validator';

/**
 * DTO for getting profit and revenue stats between two dates.
 */
export class GetOrderStatsDto {
  @IsDateString()
  fromDate!: string;

  @IsDateString()
  toDate!: string;
}