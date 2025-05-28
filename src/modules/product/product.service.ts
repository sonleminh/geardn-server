import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CategoryService } from '../category/category.service';
import { ProductSkuService } from '../product-sku/product-sku.service';
import { generateSlug } from 'src/utils/slug.until';
import { CreateProductDto } from './dto/create-product.dto';
import { TAGS } from './dto/tag.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';
import { createSearchFilter } from '../../common/helpers/query.helper';
import { FindProductsDto } from './dto/find-product.dto';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private readonly categoryService: CategoryService,
    private readonly productSkuService: ProductSkuService,
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
    const res = await this.categoryService.getCategoryInitial();
    const tags = Object.keys(TAGS).map((key) => ({
      value: key,
      label: TAGS[key as keyof typeof TAGS],
    }));
    return { data: { categories: res, tags: tags } };
  }

  async findAll(query: {
    categoryIds?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { categoryIds, page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    // Convert categoryIds string to array of numbers if it exists
    const categoryIdArray = categoryIds ? categoryIds.split(',').map(Number) : undefined;

    const where: Prisma.ProductWhereInput = {
      AND: [
        // Search filter
        ...(search ? [{ OR: [{ name: createSearchFilter(search) }] }] : []),
        // Category filter
        ...(categoryIdArray?.length ? [{ categoryId: { in: categoryIdArray } }] : []),
      ],
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
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
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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
            // quantity: true,
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
            // quantity: true,
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

  async getProductsByCategorySlug(slug: string, query: FindProductsDto) {
    const category = await this.categoryService.findOneBySlug(slug);

    if (!category?.data) {
      throw new NotFoundException('No products found based on category');
    }

    const total = await this.prisma.product.count({
      where: { categoryId: category.data.id },
    });

    const res = await this.prisma.product.findMany({
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
            imageUrl: true,
            productSkuAttributes: {
              select: {
                id: true,
                attributeValue: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: query.sort || 'desc',
      },
    });

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
}
