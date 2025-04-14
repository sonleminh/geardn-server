import { AttributeValue } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ProductAttributeEntity implements AttributeValue {
  @ApiProperty()
  id: number;

  @ApiProperty()
  attributeId: number;

  @ApiProperty()
  value: string;

  @ApiProperty({ default: false })
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
