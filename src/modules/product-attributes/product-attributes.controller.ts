import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateProductAttributeDto } from './dto/create-product-attribute.dto';
import { UpdateProductAttributeDto } from './dto/update-product-attribute.dto';
import { ProductAttributesService } from './product-attributes.service';

@Controller('product-attributes')
export class ProductAttributesController {
  constructor(
    private readonly productAttributesService: ProductAttributesService,
  ) {}

  @Post()
  create(@Body() createProductAttributeDto: CreateProductAttributeDto) {
    return this.productAttributesService.create(createProductAttributeDto);
  }

  @Get()
  findAll() {
    return this.productAttributesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productAttributesService.findOne(+id);
  }

  @Get('type/:id')
  findByType(@Param('id') type: string) {
    return this.productAttributesService.findByType(type);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductAttributeDto: UpdateProductAttributeDto,
  ) {
    return this.productAttributesService.update(+id, updateProductAttributeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productAttributesService.remove(+id);
  }
}
