import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsOptional } from 'class-validator';
import { DetailsDto } from './details';

export class CreateProductDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty()
  @IsArray({ message: 'Images must be an array.' })
  @ArrayNotEmpty({ message: 'Images array must not be empty.' })
  @IsNotEmpty({ each: true, message: 'Each image must not be empty.' })
  images: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  tags: string;

  @ApiProperty()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsOptional()
  details: string;

  @ApiProperty()
  @IsOptional()
  brand: string;
}
