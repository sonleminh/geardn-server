import { Product } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { TagsDto } from '../dto/tag.dto';
import { TierVariantDto } from '../dto/tier-variation';
import { DetailsDto } from '../dto/details';

export class ProductEntity implements Product {
  @ApiProperty()
  id: number;

  @ApiProperty({ required: false, nullable: true })
  name: string;

  @ApiProperty()
  categoryId: number;
  
  @ApiProperty()
  tags: TagsDto[];

  @ApiProperty()
  images: string[];

  @ApiProperty()
  tier_variations: TierVariantDto[];

  @ApiProperty({ uniqueItems: true })
  sku_name: string;

  @ApiProperty({ default: 'Không' })
  brand: string;

  @ApiProperty()
  details: DetailsDto;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty({ required: true })
  slug: string;

  @ApiProperty({ required: true })
  is_deleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
