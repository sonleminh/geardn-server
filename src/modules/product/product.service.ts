import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryService } from '../category/category.service';
import { ProductSkuService } from '../product-sku/product-sku.service';
import { generateSlug } from 'src/utils/slug.until';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';
import { createSearchFilter } from '../../common/helpers/query.helper';
import { FindProductsDto } from './dto/find-product.dto';
import { ProductStatus } from '@prisma/client';
import { AdminFindProductsDto } from './dto/admin-find-products.dto';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private readonly categoryService: CategoryService,
    private readonly productSkuService: ProductSkuService,
  ) {}
  async create(createProductDto: CreateProductDto) {
    const data = {
      ...createProductDto,
      slug: generateSlug(createProductDto.name),
      tags: JSON.parse(JSON.stringify(createProductDto.tags)),
    };

    const res = await this.prisma.product.create({
      data,
    });
    return {
      data: res,
    };
  }

  async findAll(query: FindProductsDto) {
    const { categoryIds, page = 1, limit = 10, search, statuses } = query;
    const skip = (page - 1) * limit;
    // Convert categoryIds string to array of numbers if it exists
    const categoryIdArray = categoryIds
      ? categoryIds.split(',').map(Number)
      : undefined;

    const where: Prisma.ProductWhereInput = {
      AND: [
        // Search filter
        ...(search ? [{ OR: [{ name: createSearchFilter(search) }] }] : []),
        // Category filter
        ...(categoryIdArray?.length
          ? [{ categoryId: { in: categoryIdArray } }]
          : []),
        // Status filter
        ...(statuses ? [{ status: { in: statuses } }] : []),
        { isDeleted: false },
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
            imageUrl: true,
            productSkuAttributes: {
              select: {
                id: true,
                attributeValue: {
                  select: {
                    value: true,
                    attribute: {
                      select: {
                        id: true,
                        name: true,
                        label: true,
                      },
                    },
                  },
                },
              },
            },
            stocks: {
              select: {
                id: true,
                quantity: true,
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
                attributeValue: {
                  select: {
                    value: true,
                    attribute: {
                      select: {
                        id: true,
                        name: true,
                        label: true,
                      },
                    },
                  },
                },
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

  async getProductsByCategory(id: number) {
    const category = await this.categoryService.findOne(+id);
    if (!category?.data) {
      throw new NotFoundException('No products found based on category');
    }
    const total = await this.prisma.product.count({
      where: { categoryId: category.data.id },
    });

    const res = await this.prisma.product.findMany({
      where: { categoryId: category.data.id },
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
        skus: {
          select: {
            id: true,
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
    });

    return {
      data: res,
      total: total,
      message: 'Product list retrieved successfully',
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

  async adminFindAll(query: AdminFindProductsDto) {
    const {
      categoryIds,
      page = 1,
      limit = 10,
      search,
      statuses,
      isDeleted,
    } = query;
    const skip = (page - 1) * limit;

    // Convert categoryIds string to array of numbers if it exists
    const categoryIdArray = categoryIds
      ? categoryIds.split(',').map(Number)
      : undefined;

    const where = {
      AND: [
        // Search filter
        ...(search ? [{ OR: [{ name: createSearchFilter(search) }] }] : []),
        // Category filter
        ...(categoryIdArray?.length
          ? [{ categoryId: { in: categoryIdArray } }]
          : []),
        // Status filter
        ...(statuses?.length ? [{ status: { in: statuses } }] : []),
        // Deleted filter
        ...(typeof isDeleted === 'boolean' ? [{ isDeleted }] : []),
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
              id: true,
              sku: true,
              price: true,
              status: true,
              isDeleted: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
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
      message: 'Admin product list retrieved successfully',
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    console.log('updateProductDto', updateProductDto);
    const data: Prisma.ProductUpdateInput = {
      ...updateProductDto,
      tags: updateProductDto.tags
        ? JSON.parse(JSON.stringify(updateProductDto.tags))
        : undefined,
    };

    // Generate new slug if name is being updated
    if (data.name) {
      data.slug = generateSlug(data.name as string);
    }

    const res = await this.prisma.product.update({
      where: { id },
      data,
    });
    return { data: res };
  }

  async updateIsVisible(productId: number, isVisible: boolean, userId: number) {
    await this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { isVisible },
      });

      // await tx.productLog.create({
      //   data: {
      //     productId,
      //     field: 'isVisible',
      //     oldValue: isVisible.toString(),
      //     newValue: isVisible.toString(),
      //     changedBy: userId,
      //   },
      // });
    });

    return { message: 'Product isVisible updated successfully' };
  }

  async softDelete(id: number): Promise<{ deleteCount: number }> {
    const entity = await this.prisma.product.findUnique({
      where: { id, isDeleted: false },
    });

    if (!entity) {
      throw new NotFoundException('Product not found');
    }
    await this.prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });
    return {
      deleteCount: 1,
    };
  }

  async restoreProduct(id: number) {

    const entity = await this.prisma.product.findUnique({
      where: { id, isDeleted: true },
    });

    if (!entity) {
      throw new NotFoundException('Product not found');
    }
    await this.prisma.product.update({
      where: { id },
      data: { isDeleted: false },
    });
    return {
      message: 'Product restored successfully',
    };
  }

  async forceDelete(id: number) {
    await this.prisma.product.delete({
      where: { id },
    });
    return {
      message: 'Product deleted successfully',
    };
  }
}
