import { IsNumberString, IsOptional, IsString } from "class-validator";

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
  @IsString()
  sort?: 'asc' | 'desc';
}
