import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ProductSkusService } from '../product-skus/product-skus.service';
import { CategoriesService } from '../categories/categories.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import { paginateCalculator } from 'src/utils/page-helpers';
import { generateSlug } from 'src/utils/slug.until';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryParamDto } from 'src/dtos/query-params.dto';
import { TAGS } from './dto/tag.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
    private readonly productSkusService: ProductSkusService,
  ) {}
  async create(createProductDto: CreateProductDto) {
    const res = await this.prisma.product.create({
      data: { ...createProductDto, slug: generateSlug(createProductDto.name) },
    });
    return {
      data: res,
    };
  }

  async getInitialProductForCreate() {
    const res = await this.categoriesService.getCategoryInitial();
    const tags = Object.keys(TAGS).map((key) => ({
      value: key,
      label: TAGS[key as keyof typeof TAGS],
    }));
    return { data: { categories: res, tags: tags } };
  }

  async findAll(queryParam: QueryParamDto) {
    const { resPerPage, passedPage } = paginateCalculator(
      queryParam.page,
      queryParam.limit,
    );

    let products = await this.prisma.product.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        skus: {
          select: {
            price: true,
          },
          orderBy: {
            price: 'asc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: passedPage,
      take: resPerPage,
    });

    if (queryParam.sort === 'asc' || queryParam.sort === 'desc') {
      products = products.sort((a, b) => {
        const priceA = a.skus.length ? +a.skus[0].price : Number.MAX_VALUE;
        const priceB = b.skus.length ? +b.skus[0].price : Number.MAX_VALUE;
        return queryParam.sort === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }

    const total = await this.prisma.product.count({
      where: {
        isDeleted: false,
      },
    });

    return {
      data: products,
      meta: {
        total,
        page: passedPage + 1,
        pageSize: resPerPage,
      },
      message: 'Product list retrieved successfully',
    };
  }

  async findOne(id: number) {
    const res = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        skus: {
          // Thêm phần này để lấy thông tin SKU
          select: {
            id: true,
            sku: true,
            price: true,
            quantity: true,
            productSkuAttributes: {
              select: {
                id: true,
                attributeValue: true,
                // {
                //   select: {
                //     id: true,
                //     : true,
                //     value: true,
                //   },
                // },
              },
            },
          },
        },
      },
    });
    if (!res) {
      throw new NotFoundException('Cannot find product!');
    }
    return { data: res };
  }

  async getProductBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        skus: {
          select: {
            id: true,
            productId: true,
            sku: true,
            price: true,
            quantity: true,
            imageUrl: true,
            productSkuAttributes: {
              select: {
                id: true,
                attributeValue: true,
                // {
                //   select: {
                //     id: true,
                //     type: true,
                //     value: true,
                //   },
                // },
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    return {
      data: product,
    };
  }

  async getProductsByCategorySlug(slug: string, queryParam: QueryParamDto) {
    const category = await this.categoriesService.findOneBySlug(slug);

    if (!category?.data) {
      throw new NotFoundException('No products found based on category');
    }

    const total = await this.prisma.product.count({
      where: { categoryId: category.data.id },
    });

    let res = await this.prisma.product.findMany({
      where: { categoryId: category.data.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        skus: {
          select: {
            id: true,
            productId: true,
            sku: true,
            price: true,
            quantity: true,
            imageUrl: true,
            productSkuAttributes: {
              select: {
                id: true,
                attributeValue: true,
                // {
                //   select: {
                //     id: true,
                //     type: true,
                //     value: true,
                //   },
                // },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (queryParam.sort === 'asc' || queryParam.sort === 'desc') {
      res = res.sort((a, b) => {
        const priceA = a.skus.length ? +a.skus[0].price : Number.MAX_VALUE;
        const priceB = b.skus.length ? +b.skus[0].price : Number.MAX_VALUE;
        return queryParam.sort === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }

    return {
      data: res,
      total: total,
      message: 'Product list retrieved successfully',
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const res = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
    return { data: res };
  }

  async softDelete(id: number): Promise<{ deleteCount: number }> {
    const entity = await this.prisma.product.findUnique({
      where: { id, isDeleted: false },
    });

    if (!entity) {
      throw new NotFoundException('Đối tượng không tồn tại!!');
    }
    await this.prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });
    return {
      deleteCount: 1,
    };
  }

  async remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }
}
