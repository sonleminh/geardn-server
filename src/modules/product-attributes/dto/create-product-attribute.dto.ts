import { ApiProperty } from '@nestjs/swagger';
import { ProductAttributeType } from '@prisma/client';

export class CreateProductAttributeDto {
  @ApiProperty()
  type: ProductAttributeType;

  @ApiProperty()
  value: string;
}