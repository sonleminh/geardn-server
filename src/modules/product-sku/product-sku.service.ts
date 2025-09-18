import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductSkuDto } from './dto/create-product-sku.dto';
import { UpdateProductSkuDto } from './dto/update-product-sku.dto';
import { Prisma } from '@prisma/client';
import { RecordState } from './dto/find-skus-by-product.dto';

@Injectable()
export class ProductSkuService {
  constructor(
    private prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async generateSKU(): Promise<string> {
    // Tìm SKU mới nhất
    const lastProduct = await this.prisma.productSKU.findFirst({
      orderBy: { sku: 'desc' }, // Sắp xếp giảm dần để lấy SKU lớn nhất
      select: { sku: true },
    });

    let nextNumber = 1;
    if (lastProduct?.sku) {
      const lastNumber = parseInt(lastProduct.sku.replace('GDN', ''), 10);
      nextNumber = lastNumber + 1;
    }

    // Định dạng SKU (GDN0001, GDN0002, ...)
    return `GDN${nextNumber.toString().padStart(4, '0')}`;
  }

  async recalcProductPriceRange(
    productId: number,
    tx: Prisma.TransactionClient,
  ) {
    const agg = await tx.productSKU.aggregate({
      where: {
        productId,
        isDeleted: false,
        status: 'ACTIVE',
        // Nếu muốn chỉ tính SKU còn hàng:
        // stocks: { some: { quantity: { gt: 0 } } }
      },
      _min: { sellingPrice: true },
      _max: { sellingPrice: true },
    });

    await tx.product.update({
      where: { id: productId },
      data: {
        priceMin: agg._min.sellingPrice ?? null,
        priceMax: agg._max.sellingPrice ?? null,
      },
    });
  }

  async create(createProductSkusDto: CreateProductSkuDto) {
    const { productId, imageUrl, sellingPrice, attributeValues } =
      createProductSkusDto;

    return this.prisma.$transaction(async (tx) => {
      const existingSkus = await this.prisma.productSKU.findMany({
        where: { productId },
        include: { productSkuAttributes: true },
      });

      const isDuplicate = existingSkus.some((existingSku) => {
        const existingAttribute = existingSku.productSkuAttributes
          .map((attr) => attr.attributeValueId)
          .sort();
        const newAttribute = attributeValues
          .map((attr) => attr.attributeValueId)
          .sort();
        return (
          JSON.stringify(existingAttribute) === JSON.stringify(newAttribute)
        );
      });

      if (isDuplicate) {
        throw new Error('SKU with the same attribute already exists.');
      }

      const sku = await this.generateSKU();

      const newSku = await this.prisma.productSKU.create({
        data: {
          productId,
          sku,
          imageUrl,
          sellingPrice,
          // quantity,
        },
      });
      if (attributeValues?.length) {
        await tx.productSKUAttribute.createMany({
          data: attributeValues.map((attr) => ({
            skuId: newSku.id,
            attributeValueId: attr.attributeValueId,
          })),
        });
      }

      await this.recalcProductPriceRange(productId, tx);

      return tx.productSKU.findUnique({
        where: { id: newSku.id },
        include: {
          productSkuAttributes: {
            include: { attributeValue: true },
          },
        },
      });
    });
  }

  async findAll() {
    const [res, total] = await Promise.all([
      this.prisma.productSKU.findMany({
        include: {
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
      }),
      this.prisma.productSKU.count(),
    ]);
    return {
      data: res,
      total,
    };
  }

  async findOne(id: number) {
    const res = await this.prisma.productSKU.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            name: true,
          },
        },
        productSkuAttributes: {
          select: {
            id: true,
            attributeValue: {
              select: {
                id: true,
                attribute: true,
                value: true,
              },
            },
          },
        },
      },
    });
    if (!res) {
      throw new NotFoundException('Product not found');
    }
    return { message: 'success', data: res };
  }

  async getProductSkuBySlug(sku: string) {
    const product = await this.prisma.productSKU.findUnique({
      where: { sku },
      include: {
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
        stocks: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product SKU with sku "${sku}" not found`);
    }

    return {
      data: product,
    };
  }

  async findByProduct(id: number, state: RecordState) {
    const where: Prisma.ProductSKUWhereInput = { productId: id };
    if (state === RecordState.ACTIVE || !state) where.isDeleted = false;
    else if (state === RecordState.DELETED) where.isDeleted = true;

    const res = await this.prisma.productSKU.findMany({
      where,
      select: {
        id: true,
        sku: true,
        sellingPrice: true,
        // quantity: true,
        imageUrl: true,
        product: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
        productSkuAttributes: {
          select: {
            id: true,
            attributeValue: {
              include: {
                attribute: {
                  select: {
                    label: true,
                  },
                },
              },
            },
            // {
            //   select: {
            //     id: true,
            //     type: true,
            //     value: true,
            //   },
            // },
          },
        },
        stocks: true,
        isDeleted: true,
      },
    });
    if (!res) {
      throw new NotFoundException('Không tìm thấy sản phẩm!');
    }
    return { data: res };
  }

  async update(id: number, updateProductSkusDto: UpdateProductSkuDto) {
    const { productId, sellingPrice, imageUrl, attributeValues } =
      updateProductSkusDto;

    return this.prisma.$transaction(async (tx) => {
      const existingSkus = await this.prisma.productSKU.findMany({
        where: { productId: productId },
        include: { productSkuAttributes: true },
      });

      const filteredSkus = existingSkus.filter((sku) => sku.id !== id);

      const isDuplicate = filteredSkus.some((existingSku) => {
        const existingAttribute = existingSku.productSkuAttributes
          .map((attr) => attr.attributeValueId)
          .sort();
        const newAttribute = attributeValues
          .map((attr) => attr.attributeValueId)
          .sort();
        return (
          JSON.stringify(existingAttribute) === JSON.stringify(newAttribute)
        );
      });

      if (isDuplicate) {
        throw new Error('SKU with the same attribute already exists.');
      }

      const res = await this.prisma.productSKU.update({
        where: { id },
        data: {
          sellingPrice,
          // quantity,
          imageUrl,
          productSkuAttributes: {
            deleteMany: {}, // Remove all existing attribute
            create: updateProductSkusDto?.attributeValues.map((attr) => ({
              attributeValue: { connect: { id: attr.attributeValueId } }, // Reconnect new attribute
            })),
          },
        },
        include: {
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
      });
      await this.recalcProductPriceRange(productId, tx);
      return { data: res };
    });
  }

  async softDelete(id: number): Promise<{ deleteCount: number }> {
    return this.prisma.$transaction(async (tx) => {
      const entity = await this.prisma.productSKU.findUnique({
        where: { id, isDeleted: false },
      });

      if (!entity) {
        throw new NotFoundException('Product SKU not found');
      }
      await tx.productSKU.update({
        where: { id },
        data: { isDeleted: true },
      });
      await this.recalcProductPriceRange(entity.productId, tx);
      return {
        deleteCount: 1,
      };
    });
  }

  async restore(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const entity = await this.prisma.productSKU.findUnique({
        where: { id, isDeleted: true },
      });

      if (!entity) {
        throw new NotFoundException('Product SKU not found');
      }
      await tx.productSKU.update({
        where: { id },
        data: { isDeleted: false },
      });
      await this.recalcProductPriceRange(entity.productId, tx);
      return {
        message: 'Product SKU restored successfully',
      };
    });
  }

  async forceDelete(id: number) {
    await this.prisma.$transaction(async (tx) => {
      const [orderCnt, importCnt, exportCnt, adjustCnt, stockCnt, cartCnt] =
        await Promise.all([
          tx.orderItem.count({ where: { skuId: id } }),
          tx.importLogItem.count({ where: { skuId: id } }),
          tx.exportLogItem.count({ where: { skuId: id } }),
          tx.adjustmentLogItem.count({ where: { skuId: id } }),
          tx.stock.count({ where: { skuId: id } }),
          tx.cartItem.count({ where: { skuId: id } }),
        ]);

      if (orderCnt || importCnt || exportCnt || adjustCnt || stockCnt) {
        throw new Error('SKU đã có lịch sử. Chỉ được soft-delete.');
      }

      if (cartCnt) await tx.cartItem.deleteMany({ where: { skuId: id } });
      await tx.productSKUAttribute.deleteMany({ where: { skuId: id } });

      const sku = await tx.productSKU.findUniqueOrThrow({
        where: { id },
        select: { productId: true },
      });

      await tx.productSKU.delete({ where: { id } });
      await this.recalcProductPriceRange(sku.productId, tx);
    });
  }
}
