import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';
import { TAGS } from './dto/tag.dto';
import { generateSlug } from 'src/utils/slug.until';
import { ProductSkusService } from '../product-skus/product-skus.service';
import { QueryParamDto } from 'src/dtos/query-params.dto';
import { paginateCalculator } from 'src/utils/page-helpers';

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
      status: HttpStatus.CREATED,
      message: 'success',
      data: res,
    };
  }

  async getInitialProductForCreate() {
    const categories = await this.categoriesService.getCategoryInitial();
    const tags = Object.keys(TAGS).map((key) => ({
      value: key,
      label: TAGS[key as keyof typeof TAGS],
    }));
    return { categories, tags: tags };
  }

  async findAll(queryParam: QueryParamDto) {
    const { resPerPage, passedPage } = paginateCalculator(
      queryParam.page,
      queryParam.limit,
    );
    const [res, total] = await Promise.all([
      this.prisma.product.findMany({
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
              price: 'asc', // Sắp xếp giá từ thấp đến cao
            },
            take: 1, // Chỉ lấy SKU có giá thấp nhất
          },
        },
        skip: passedPage,
        take: resPerPage
      }),
      this.prisma.product.count({
        where: {
          isDeleted: false
        }
      }),
    ]);
    return {
      products: res,
      total,
      status: HttpStatus.OK,
      message: 'success',
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
        skus: { // Thêm phần này để lấy thông tin SKU
          select: {
            id: true,
            sku: true,
            price: true,
            quantity: true,
            productSkuAttributes: {
              select: {
                id: true,
                attribute: {
                  select: {
                    id: true,
                    type: true,
                    value: true,
                  },
                },
              },
            }
          },
        },
      },
    });
    if (!res) {
      throw new NotFoundException('Không tìm thấy sản phẩm!');
    }
    return { status: HttpStatus.OK, message: 'success', data: res };
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
                attribute: {
                  select: {
                    id: true,
                    type: true,
                    value: true,
                  },
                },
              },
            }
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const res = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
    return { status: HttpStatus.OK, message: 'success', data: res };
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

  remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }
}
