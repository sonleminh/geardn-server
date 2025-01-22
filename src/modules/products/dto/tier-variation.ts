import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TierVariantDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsArray()
  options: string[];

  @IsOptional()
  @IsArray()
  images: string[];
}
