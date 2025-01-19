import { Category } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryEntity implements Category {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: true })
  icon: string;

  @ApiProperty({ required: true })
  slug: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
