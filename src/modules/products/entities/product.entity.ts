import { Product } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
// import { TagDto } from '../dto/tag.dto';
import { TierVariantDto } from '../dto/tier-variation';
import { DetailsDto } from '../dto/details';
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

  @ApiProperty()
  tier_variations: TierVariantDto[];

  @ApiProperty({ default: 'Không' })
  brand: string;

  @ApiProperty()
  details: DetailsDto;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty({ uniqueItems: true })
  id_slug: string;

  @ApiProperty({ required: true })
  is_deleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
