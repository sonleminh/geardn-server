import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  images: string[];

  @ApiProperty()
  sku_name: string;

  @ApiProperty({ required: false })
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
