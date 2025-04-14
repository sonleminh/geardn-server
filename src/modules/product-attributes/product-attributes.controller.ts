import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateProductAttributeDto } from './dto/create-product-attribute.dto';
import { UpdateProductAttributeDto } from './dto/update-product-attribute.dto';
import { ProductAttributesService } from './product-attributes.service';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-auth.guard';

@Controller('product-attributes')
export class ProductAttributesController {
  constructor(
    private readonly productAttributesService: ProductAttributesService,
  ) {}

  @Post()
  create(@Body() createProductAttributeDto: CreateProductAttributeDto) {
    return this.productAttributesService.create(createProductAttributeDto);
  }

  // @UseGuards(JwtAdminAuthGuard)
  @Get()
  findAll() {
    return this.productAttributesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productAttributesService.findOne(+id);
  }

  @Get('type/:id')
  findByType(@Param('id') typeId: string) {
    return this.productAttributesService.findByType(+typeId);
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
