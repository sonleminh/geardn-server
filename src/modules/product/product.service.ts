import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryService } from '../category/category.service';
import { ProductSkuService } from '../product-sku/product-sku.service';
import { generateSlug } from 'src/utils/slug';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';
import { createSearchFilter } from '../../common/helpers/query.helper';
import { ProductListQueryDto } from './dto/product-list.dto';
import { AdminFindProductsDto } from './dto/admin-find-products.dto';
import { ProductListByCateQueryDto } from './dto/product-list-by-cate.dto';
import { SearchProductsDto } from './dto/search-product.dto';

type CursorV1 =
  | { v: 1; k: 'createdAt'; c: string; id: number }
  | { v: 1; k: 'priceMin'; p: number; id: number };

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private readonly categoryService: CategoryService,
    private readonly productSkuService: ProductSkuService,
  ) {}

  encodeCursor(c: CursorV1): string {
    return Buffer.from(JSON.stringify(c)).toString('base64url');
  }
  decodeCursor(s?: string | null): CursorV1 | null {
    if (!s) return null;
    try {
      const obj = JSON.parse(Buffer.from(s, 'base64url').toString('utf8'));
      if (obj?.v !== 1 || typeof obj?.id !== 'number') return null;
      if (obj.k === 'createdAt' && typeof obj.c === 'string')
        return obj as CursorV1;
      if (obj.k === 'priceMin' && typeof obj.p === 'number')
        return obj as CursorV1;
      return null;
    } catch {
      return null;
    }
  }

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

  async findAll(dto: ProductListQueryDto) {
    const { page = 1, limit: rawLimit = 9, sortBy, order } = dto;

    const limit = Math.min(Math.max(rawLimit, 1), 100);
    const skip = (page - 1) * limit;

    const sortFieldMap: Record<
      string,
      keyof Prisma.ProductOrderByWithRelationInput
    > = {
      createdAt: 'createdAt',
      price: 'priceMin',
    };
    const orderByField = sortFieldMap[sortBy] ?? 'createdAt';

    const orderBy: Prisma.ProductOrderByWithRelationInput[] = [
      { [orderByField]: order },
      { id: 'desc' },
    ];

    const where: Prisma.ProductWhereInput = {
      AND: [{ isDeleted: false }],
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          // có thể thêm select tối ưu nếu bảng to
        },
      }),
      this.prisma.product.count({ where }),
    ]);
    // console.log('products', products);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
        sortBy,
        order,
      },
      message: 'Product list retrieved successfully',
    };
  }

  async search(dto: SearchProductsDto) {
    const rawLimit = dto.limit ?? 20;
    const limit = Math.min(Math.max(rawLimit, 1), 100);

    const sortDir: 'asc' | 'desc' = dto.order ?? 'desc';
    const sortByPrice = !!dto.order;

    const cur = this.decodeCursor(dto.cursor); // { v:1, k:'priceMin'|'createdAt', p?:number, c?:string, id:number }

    const baseWhere: Prisma.ProductWhereInput = {
      AND: [
        dto.keyword ? { OR: [{ name: createSearchFilter(dto.keyword) }] } : {},
        { isDeleted: false },
      ],
    };

    // điều kiện “seek”
    const seekWhere: Prisma.ProductWhereInput = (() => {
      if (!cur) return {};
      if (sortByPrice && cur.k === 'priceMin' && typeof cur.p === 'number') {
        // (priceMin > p) OR (priceMin = p AND id > lastId) với asc
        // Ngược lại dùng < và id < cho desc
        const cmpPrice = sortDir === 'asc' ? 'gt' : 'lt';
        const cmpId = sortDir === 'asc' ? 'gt' : 'lt';
        return {
          OR: [
            { priceMin: { [cmpPrice]: cur.p } } as any,
            { AND: [{ priceMin: cur.p }, { id: { [cmpId]: cur.id } }] },
          ],
        };
      }
      if (!sortByPrice && cur.k === 'createdAt' && cur.c) {
        const lastC = new Date(cur.c);
        const cmpDate = sortDir === 'asc' ? 'gt' : 'lt';
        const cmpId = sortDir === 'asc' ? 'gt' : 'lt';
        return {
          OR: [
            { createdAt: { [cmpDate]: lastC } } as any,
            { AND: [{ createdAt: lastC }, { id: { [cmpId]: cur.id } }] },
          ],
        };
      }
      return {};
    })();

    const where: Prisma.ProductWhereInput = { AND: [baseWhere, seekWhere] };

    const orderBy: Prisma.ProductOrderByWithRelationInput[] = sortByPrice
      ? [{ priceMin: sortDir }, { id: 'asc' }]
      : [{ createdAt: sortDir }, { id: 'desc' }];

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        take: limit + 1,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          priceMin: true,
          priceMax: true,
          createdAt: true,
        },
      }),
      this.prisma.product.count({ where: baseWhere }),
    ]);

    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;

    const last = sliced.at(-1);
    const nextCursor =
      hasMore && last
        ? sortByPrice
          ? this.encodeCursor({
              v: 1,
              k: 'priceMin',
              p: +last.priceMin,
              id: last.id,
            })
          : this.encodeCursor({
              v: 1,
              k: 'createdAt',
              c: last.createdAt.toISOString(),
              id: last.id,
            })
        : null;

    return {
      data: sliced,
      meta: {
        nextCursor,
        hasMore,
        total,
        limit,
      },
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
            sellingPrice: true,
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
            sellingPrice: true,
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
            sellingPrice: true,
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

  async getProductsByCategorySlug(
    slug: string,
    dto: ProductListByCateQueryDto,
  ) {
    const rawLimit = dto.limit ?? 20;
    const limit = Math.min(Math.max(rawLimit, 1), 100);

    // sort theo priceMin nếu có dto.sort, mặc định theo createdAt desc
    const sortDir: 'asc' | 'desc' = dto.order ?? 'desc';
    const sortByPrice = !!dto.order;

    // decode cursor đầu vào (nếu có). Nên để decode trả về null nếu hỏng.
    const cur = this.decodeCursor(dto.cursor); // { v:1, k:'priceMin'|'createdAt', p?:number, c?:string, id:number }

    // Lấy category
    const cat = await this.categoryService.findOneBySlug(slug);
    const categoryId = cat?.data?.id;
    if (!categoryId) {
      return {
        data: [],
        meta: { nextCursor: null, hasMore: false, total: 0 },
        category: { id: undefined, slug, name: undefined },
        message: 'Category not found',
      };
    }

    // where cơ bản
    const baseWhere: Prisma.ProductWhereInput = {
      isDeleted: false,
      categoryId,
    };

    // Seek condition cho trang tiếp theo, thay vì Prisma cursor
    const seekWhere: Prisma.ProductWhereInput = (() => {
      if (!cur) return {};
      if (sortByPrice && cur.k === 'priceMin' && typeof cur.p === 'number') {
        // (priceMin > p) OR (priceMin = p AND id > lastId) với asc
        // Ngược lại dùng < và id < cho desc
        const cmpPrice = sortDir === 'asc' ? 'gt' : 'lt';
        const cmpId = sortDir === 'asc' ? 'gt' : 'lt';
        return {
          OR: [
            { priceMin: { [cmpPrice]: cur.p } } as any,
            { AND: [{ priceMin: cur.p }, { id: { [cmpId]: cur.id } }] },
          ],
        };
      }
      if (!sortByPrice && cur.k === 'createdAt' && cur.c) {
        const lastC = new Date(cur.c);
        const cmpDate = sortDir === 'asc' ? 'gt' : 'lt';
        const cmpId = sortDir === 'asc' ? 'gt' : 'lt';
        return {
          OR: [
            { createdAt: { [cmpDate]: lastC } } as any,
            { AND: [{ createdAt: lastC }, { id: { [cmpId]: cur.id } }] },
          ],
        };
      }
      return {};
    })();

    const where: Prisma.ProductWhereInput = { AND: [baseWhere, seekWhere] };

    // Order ổn định với tie-breaker id
    const orderBy: Prisma.ProductOrderByWithRelationInput[] = sortByPrice
      ? [{ priceMin: sortDir }, { id: 'asc' }]
      : [{ createdAt: sortDir }, { id: 'desc' }];

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        take: limit + 1,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          priceMin: true,
          priceMax: true,
          createdAt: true,
        },
      }),
      this.prisma.product.count({ where: baseWhere }),
    ]);

    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;

    // Tạo nextCursor theo khóa sắp xếp hiện tại
    const last = sliced.at(-1);
    const nextCursor =
      hasMore && last
        ? sortByPrice
          ? this.encodeCursor({
              v: 1,
              k: 'priceMin',
              p: +last.priceMin,
              id: last.id,
            })
          : this.encodeCursor({
              v: 1,
              k: 'createdAt',
              c: last.createdAt.toISOString(),
              id: last.id,
            })
        : null;

    return {
      data: sliced,
      meta: { nextCursor, hasMore, total, limit },
      category: { id: categoryId, slug: cat.data.slug, name: cat.data.name },
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
              sellingPrice: true,
              status: true,
              // isDeleted: true,
              stocks: {
                select: {
                  quantity: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const formattedProducts = products.map((product) => {
      const totalStock = product.skus.reduce(
        (sum, sku) =>
          sum + sku.stocks.reduce((sum, stock) => sum + stock.quantity, 0),
        0,
      );
      return {
        ...product,
        totalStock,
      };
    });

    return {
      data: formattedProducts,
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

  async updateIsVisible(productId: number, isVisible: boolean) {
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

  async restore(id: number) {
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
    await this.prisma.$transaction(async (tx) => {
      // Check for dependencies that should prevent hard deletion
      const [orderItemCnt, cartItemCnt, skuCnt] = await Promise.all([
        tx.orderItem.count({ where: { productId: id } }),
        tx.cartItem.count({ where: { productId: id } }),
        tx.productSKU.count({ where: { productId: id } }),
      ]);

      // If there are order items, don't allow hard delete (historical data)
      if (orderItemCnt || cartItemCnt || skuCnt) {
        throw new Error(
          'Product đã có lịch sử đơn hàng. Chỉ được soft-delete.',
        );
      }

      // Clean up cart items and SKUs first
      if (cartItemCnt > 0) {
        await tx.cartItem.deleteMany({ where: { productId: id } });
      }

      if (skuCnt > 0) {
        // Delete all SKUs and their dependencies
        const skuIds = await tx.productSKU.findMany({
          where: { productId: id },
          select: { id: true },
        });

        for (const sku of skuIds) {
          // Delete SKU attributes
          await tx.productSKUAttribute.deleteMany({ where: { skuId: sku.id } });
          // Delete stocks
          await tx.stock.deleteMany({ where: { skuId: sku.id } });
          // Delete SKU
          await tx.productSKU.delete({ where: { id: sku.id } });
        }
      }

      // Finally delete the product
      await tx.product.delete({ where: { id } });
    });

    return {
      message: 'Product deleted successfully',
    };
  }
}
