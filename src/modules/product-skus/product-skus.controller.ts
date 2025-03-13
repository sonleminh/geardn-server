import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductSkusService } from './product-skus.service';
import { CreateProductSkusDto } from './dto/create-product-skus.dto';
import { UpdateProductSkusDto } from './dto/update-product-skus.dto';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { ProductSkusEntity } from './entities/product-skus.entity';

@Controller('product-skus')
export class ProductSkusController {
  constructor(private readonly productSkusService: ProductSkusService) {}

  @Post()
  create(@Body() createProductSkusDto: CreateProductSkusDto) {
    return this.productSkusService.create(createProductSkusDto);
  }

  @Get()
  findAll() {
    return this.productSkusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productSkusService.findOne(+id);
  }

  @Get('sku/:sku')
  @ApiCreatedResponse({ type: ProductSkusEntity })
  getProductBySlug(@Param('sku') sku: string) {
    return this.productSkusService.getProductSkuBySlug(sku);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductSkusDto: UpdateProductSkusDto,
  ) {
    return this.productSkusService.update(+id, updateProductSkusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productSkusService.remove(+id);
  }
}
