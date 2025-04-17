import { Attribute } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AttributeEntity implements Attribute {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  label: string;

  @ApiProperty({ default: false })
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
