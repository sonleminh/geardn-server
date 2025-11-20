import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsString,
  ValidateNested,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { JsonValue } from '@prisma/client/runtime/library';
import { Type } from 'class-transformer';
import { TagDto } from './tag.dto';
import { ProductStatus } from '@prisma/client';
import { ProductTag } from 'src/common/enums/product-tag.enum';

export class CreateProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty()
  @IsArray({ message: 'Images must be an array.' })
  @ArrayNotEmpty({ message: 'Images array must not be empty.' })
  @IsNotEmpty({ each: true, message: 'Each image must not be empty.' })
  images: string[];

  @ApiProperty({ type: [TagDto], enum: ProductTag })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagDto)
  tags: TagDto[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: { weight: '1kg', material: 'cotton', guarantee: '12 months' },
  })
  @IsOptional()
  @IsObject()
  details: JsonValue;

  @ApiProperty()
  @IsOptional()
  @IsString()
  brand: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isVisible: boolean;
}
