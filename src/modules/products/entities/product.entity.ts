import { Product } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
// import { TagDto } from '../dto/tag.dto';
import { JsonValue } from '@prisma/client/runtime/library';

export interface TagDto {
  value: string;
  label: string;
}

export class ProductEntity implements Product {
  @ApiProperty()
  id: number;

  @ApiProperty({ required: false, nullable: true })
  name: string;

  @ApiProperty()
  categoryId: number;

  @ApiProperty()
  tags: JsonValue;

  @ApiProperty()
  images: string[];

  @ApiProperty({ default: 'Không' })
  brand: string;

  @ApiProperty()
  details: JsonValue;

  @ApiProperty()
  description: string | null;

  @ApiProperty({ uniqueItems: true })
  slugId: string;

  @ApiProperty({ required: true })
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
