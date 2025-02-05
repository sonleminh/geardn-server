import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  @IsOptional()
  categoryId: number;

  @ApiProperty()
  @IsOptional()
  @IsArray({ message: 'Images must be an array.' })
  images: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  tags: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;

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
