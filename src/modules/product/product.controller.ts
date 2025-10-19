import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Delete,
  Req,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ENUM_LABELS } from 'src/common/constants/enum-labels';
import { ProductTag } from 'src/common/enums/product-tag.enum';
import { ProductSkuService } from '../product-sku/product-sku.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsDto } from './dto/find-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { ProductService } from './product.service';
import { AdminFindProductsDto } from './dto/admin-find-products.dto';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-admin-auth.guard';
import { FindSkusByProductDto } from '../product-sku/dto/find-skus-by-product.dto';
import { FindProductsByCateDto } from './dto/find-product-by-cate.dto';

@Controller('products')
@ApiTags('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productSkuService: ProductSkuService,
  ) {}

  @UseGuards(JwtAdminAuthGuard)
  @Post()
  @ApiCreatedResponse({ type: ProductEntity })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiCreatedResponse({ type: ProductEntity, isArray: true })
  findAll(@Query() dto: FindProductsDto) {
    console.log('dto', dto);
    return this.productService.findAll(dto);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Get('admin')
  @ApiOperation({ summary: 'Get products for admin dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: [ProductEntity],
  })
  async adminFindAll(@Query() dto: AdminFindProductsDto) {
    return this.productService.adminFindAll(dto);
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

  @Get('/category/:id')
  async getProductByCate(@Param('id') id: number) {
    return await this.productService.getProductsByCategory(+id);
  }

  @Get('/category/slug/:slug')
  async getProductByCateSlug(
    @Param('slug') slug: string,
    @Query() dto: FindProductsByCateDto,
  ) {
    console.log('dto', dto)
    return await this.productService.getProductsByCategorySlug(slug, dto);
  }

  @Get(':id/skus')
  @ApiCreatedResponse({ type: ProductEntity })
  findSkusByProductId(
    @Param('id') id: number,
    @Query() dto: FindSkusByProductDto,
  ) {
    return this.productSkuService.findByProduct(+id, dto.state);
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
          label: { type: 'string' },
        },
      },
    },
  })
  getProductTags() {
    return ENUM_LABELS['product-tag'];
  }

  @UseGuards(JwtAdminAuthGuard)
  @Patch(':id')
  @ApiCreatedResponse({ type: ProductEntity })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Patch(':id/is-visible')
  @ApiCreatedResponse({ type: ProductEntity })
  updateIsVisible(
    @Param('id') id: string,
    @Body() { isVisible }: { isVisible: boolean },
  ) {
    return this.productService.updateIsVisible(+id, isVisible);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Delete(':id')
  @ApiCreatedResponse({ type: ProductEntity })
  remove(@Param('id') id: string) {
    return this.productService.softDelete(+id);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Patch(':id/restore')
  @ApiCreatedResponse({ type: ProductEntity })
  restore(@Param('id') id: string) {
    return this.productService.restore(+id);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Delete(':id/permanent')
  @ApiCreatedResponse({ type: ProductEntity })
  forceDelete(@Param('id') id: string) {
    return this.productService.forceDelete(+id);
  }
}
