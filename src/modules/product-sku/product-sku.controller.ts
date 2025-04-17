import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductSkuService } from './product-sku.service';
import { CreateProductSkuDto } from './dto/create-product-sku.dto';
import { UpdateProductSkuDto } from './dto/update-product-sku.dto';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { ProductSkuEntity } from './entities/product-sku.entity';

@Controller('product-skus')
export class ProductSkuController {
  constructor(private readonly productSkuService: ProductSkuService) {}

  @Post()
  create(@Body() createProductSkusDto: CreateProductSkuDto) {
    return this.productSkuService.create(createProductSkusDto);
  }

  @Get()
  findAll() {
    return this.productSkuService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productSkuService.findOne(+id);
  }

  @Get('sku/:sku')
  @ApiCreatedResponse({ type: ProductSkuEntity })
  getProductBySlug(@Param('sku') sku: string) {
    return this.productSkuService.getProductSkuBySlug(sku);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateProductSkusDto: UpdateProductSkuDto,
  ) {
    return this.productSkuService.update(id, updateProductSkusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productSkuService.remove(+id);
  } 
}
