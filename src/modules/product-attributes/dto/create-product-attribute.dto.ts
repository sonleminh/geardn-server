import { ApiProperty } from '@nestjs/swagger';
import { ProductAttributeType } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class CreateProductAttributeDto {
  @ApiProperty()
  @IsNotEmpty()
  type: ProductAttributeType;

  @ApiProperty()
  @IsNotEmpty()
  value: string;
}