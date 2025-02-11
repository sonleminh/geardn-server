import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductSkusDto } from './dto/create-product-skus.dto';
import { UpdateProductSkusDto } from './dto/update-product-skus.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductSkusService {
  constructor(private prisma: PrismaService) {}

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

  async create(createProductSkusDto: CreateProductSkusDto) {
    const sku = await this.generateSKU();
    const { productId, imageUrl, price, quantity, attributes } =
      createProductSkusDto;

    const existingSkus = await this.prisma.productSKU.findMany({
      where: { productId },
      include: { productSkuAttributes: true },
    });

    const isDuplicate = existingSkus.some((existingSku) => {
      const existingAttributes = existingSku.productSkuAttributes
        .map((attr) => attr.attributeId)
        .sort();
      const newAttributes = attributes.map((attr) => attr.attributeId).sort();
      return (
        JSON.stringify(existingAttributes) === JSON.stringify(newAttributes)
      );
    });

    if (isDuplicate) {
      throw new Error('SKU with the same attributes already exists.');
    }

    // Tạo SKU trước
    const newSku = await this.prisma.productSKU.create({
      data: {
        productId,
        sku,
        imageUrl,
        price,
        quantity,
      },
    });

    if (attributes?.length) {
      // Tạo danh sách thuộc tính cho SKU
      await this.prisma.productSKUAttribute.createMany({
        data: attributes.map((attr) => ({
          skuId: newSku.id,
          attributeId: attr.attributeId,
        })),
      });
    }

    // Trả về SKU đã tạo cùng với danh sách thuộc tính
    return this.prisma.productSKU.findUnique({
      where: { id: newSku.id },
      include: {
        productSkuAttributes: {
          include: {
            attribute: {
              select: {
                id: true,
                type: true,
                value: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll() {
    const [res, total] = await Promise.all([
      this.prisma.productSKU.findMany({
        include: {
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
          },
        },
      }),
      this.prisma.productSKU.count(),
    ]);
    return {
      productSkus: res,
      total,
      status: HttpStatus.OK,
      message: 'success',
    };
  }

  async findOne(id: number) {
    const res = await this.prisma.productSKU.findUnique({
      where: { id },
      include: {
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
        },
      },
    });
    if (!res) {
      throw new NotFoundException('Không tìm thấy mã hàng!');
    }
    return { status: HttpStatus.OK, message: 'success', data: res };
  }

  async findByProduct(id: number) {
    const res = await this.prisma.productSKU.findMany({
      where: { productId: id },
      select: {
        id: true,
        sku: true,
        price: true,
        quantity: true,
        imageUrl: true,
        product: {
          select: {
            id: true,
            name: true,
          },
        },
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
        },
      },
    });
    if (!res) {
      throw new NotFoundException('Không tìm thấy sản phẩm!');
    }
    return { status: HttpStatus.OK, message: 'success', data: res };
  }

  update(id: number, updateProductSkusDto: UpdateProductSkusDto) {
    return `This action updates a #${id} productSkus`;
  }

  remove(id: number) {
    return `This action removes a #${id} productSkus`;
  }
}
