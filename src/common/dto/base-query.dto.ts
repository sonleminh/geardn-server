import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class BaseQueryDto {
  @IsOptional()
  @IsString()
  sort?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => {
    if (!value) return 1;
    const num = Number(value);
    return isNaN(num) ? 1 : num;
  })
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => {
    if (!value) return 10;
    const num = Number(value);
    return isNaN(num) ? 10 : num;
  })
  limit?: number = 10;
} 