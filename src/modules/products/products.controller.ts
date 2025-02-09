import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ProductEntity } from './entities/product.entity';
import { ProductSkusService } from '../product-skus/product-skus.service';

@Controller('products')
@ApiTags('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly productSkusService: ProductSkusService
  ) {}

  @Post()
  @ApiCreatedResponse({ type: ProductEntity })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiCreatedResponse({ type: ProductEntity, isArray: true })
  findAll() {
    return this.productsService.findAll();
  }

  @Get('initial-to-create')
  findInitial() {
    return this.productsService.getInitialProductForCreate();
  }

  @Get(':id')
  @ApiCreatedResponse({ type: ProductEntity })
  findOne(@Param('id') id: number) {
    return this.productsService.findOne(+id);
  }

  @Get(':id/skus')
  @ApiCreatedResponse({ type: ProductEntity })
  findSkusByProductId(@Param('id') id: number) {
    return this.productSkusService.findByProduct(+id);
  }

  @Patch(':id')
  @ApiCreatedResponse({ type: ProductEntity })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @ApiCreatedResponse({ type: ProductEntity })
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
