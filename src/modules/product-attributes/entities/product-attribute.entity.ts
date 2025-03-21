import { ProductAttribute, ProductAttributeType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ProductAttributeEntity implements ProductAttribute {
  @ApiProperty()
  id: number;

  @ApiProperty()
  type: ProductAttributeType;

  @ApiProperty()
  value: string;

  @ApiProperty({ default: false })
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
