import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export class QueryParamDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'Sort must be "asc" or "desc"' })
  sort?: 'asc' | 'desc';
}
