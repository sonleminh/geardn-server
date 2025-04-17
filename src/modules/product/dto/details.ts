import { IsOptional } from 'class-validator';

export class DetailsDto {
  @IsOptional()
  guarantee: string;

  @IsOptional()
  weight: string;

  @IsOptional()
  material: string;
}
