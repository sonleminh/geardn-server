import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { TagDto } from './tag.dto';

export class CreateProductDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  images: string[];

  @ApiProperty()
  tags: string;

  @ApiProperty()
  sku_name: string;

  @ApiProperty({ required: false })
  description?: string;

  // @IsArray()
  // @IsOptional()
  // @ValidateNested({ each: true })
  // @Type(() => TagDto)
  // tags: TagDto[];

  @ApiProperty({
    description:
      'Category of the product. Either provide an existing category ID to connect or the details to create a new category.',
    required: true,
  })
  category: {
    connect?: { id: number }; // To connect to an existing category
    create?: { 
      name: string; 
      icon: string; 
      slug: string; 
    }; // To create a new category
  };
}
