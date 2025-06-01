import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiCreatedResponse, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductEntity } from './entities/product.entity';
import { ProductSkuService } from '../product-sku/product-sku.service';
import { FindProductsDto } from './dto/find-product.dto';
import { ProductTag } from 'src/common/enums/product-tag.enum';
import { ENUM_LABELS } from 'src/common/constants/enum-labels';

@Controller('products')
@ApiTags('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productSkuService: ProductSkuService,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: ProductEntity })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiCreatedResponse({ type: ProductEntity, isArray: true })
  findAll(@Query() query: FindProductsDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @ApiCreatedResponse({ type: ProductEntity })
  findOne(@Param('id') id: number) {
    return this.productService.findOne(+id);
  }

  @Get('slug/:slug')
  @ApiCreatedResponse({ type: ProductEntity })
  getProductBySlug(@Param('slug') slug: string) {
    return this.productService.getProductBySlug(slug);
  }

  @Get('/category/:slug')
  async getProductByCateSlug(
    @Param('slug') slug: string,
    @Query() query: FindProductsDto,
  ) {
    return await this.productService.getProductsByCategorySlug(slug, query);
  }

  @Get(':id/skus')
  @ApiCreatedResponse({ type: ProductEntity })
  findSkusByProductId(@Param('id') id: number) {
    return this.productSkuService.findByProduct(+id);
  }

  @Patch(':id')
  @ApiCreatedResponse({ type: ProductEntity })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Patch(':id')
  @ApiCreatedResponse({ type: ProductEntity })
  remove(@Param('id') id: string) {
    return this.productService.softDelete(+id);
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all product tags' })
  @ApiResponse({
    status: 200,
    description: 'Returns all available product tags with their labels',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string', enum: Object.values(ProductTag) },
          label: { type: 'string' }
        }
      }
    }
  })
  getProductTags() {
    return ENUM_LABELS['product-tag'];
  }
}
