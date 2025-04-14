import { ProductAttribute } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ProductAttributeEntity implements ProductAttribute {
  @ApiProperty()
  id: number;

  @ApiProperty()
  typeId: number;

  @ApiProperty()
  value: string;

  @ApiProperty({ default: false })
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
