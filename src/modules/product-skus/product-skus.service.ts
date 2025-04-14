import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductSkusDto } from './dto/create-product-skus.dto';
import { UpdateProductSkusDto } from './dto/update-product-skus.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class ProductSkusService {
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

  async create(createProductSkusDto: CreateProductSkusDto) {
    const sku = await this.generateSKU();
    const { productId, imageUrl, price, quantity, attributeValues } =
      createProductSkusDto;

    const existingSkus = await this.prisma.productSKU.findMany({
      where: { productId },
      include: { productSkuAttributes: true },
    });

    const isDuplicate = existingSkus.some((existingSku) => {
      const existingAttributes = existingSku.productSkuAttributes
        .map((attr) => attr.attributeValueId)
        .sort();
      const newAttributes = attributeValues
        .map((attr) => attr.attributeValueId)
        .sort();
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

    if (attributeValues?.length) {
      // Tạo danh sách thuộc tính cho SKU
      await this.prisma.productSKUAttribute.createMany({
        data: attributeValues.map((attr) => ({
          skuId: newSku.id,
          attributeValueId: attr.attributeValueId,
        })),
      });
    }

    // Trả về SKU đã tạo cùng với danh sách thuộc tính
    return this.prisma.productSKU.findUnique({
      where: { id: newSku.id },
      include: {
        productSkuAttributes: {
          include: {
            attribute: true,
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
  }

  async findAll() {
    const [res, total] = await Promise.all([
      this.prisma.productSKU.findMany({
        include: {
          productSkuAttributes: {
            select: {
              id: true,
              attribute: true,
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
        productSkuAttributes: {
          select: {
            id: true,
            attribute: true,
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
    if (!res) {
      throw new NotFoundException('Không tìm thấy mã hàng!');
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
            attribute: true,
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

    if (!product) {
      throw new NotFoundException(`Product SKU with sku "${sku}" not found`);
    }

    return {
      data: product,
    };
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
            attribute: true,
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
    if (!res) {
      throw new NotFoundException('Không tìm thấy sản phẩm!');
    }
    return { data: res };
  }

  async update(id: number, updateProductSkusDto: UpdateProductSkusDto) {
    const { productId, price, quantity, imageUrl, attributeValues } =
      updateProductSkusDto;
    const existingSkus = await this.prisma.productSKU.findMany({
      where: { productId: productId },
      include: { productSkuAttributes: true },
    });

    const filteredSkus = existingSkus.filter((sku) => sku.id !== id);

    const isDuplicate = filteredSkus.some((existingSku) => {
      const existingAttributes = existingSku.productSkuAttributes
        .map((attr) => attr.attributeValueId)
        .sort();
      const newAttributes = attributeValues
        .map((attr) => attr.attributeValueId)
        .sort();
      return (
        JSON.stringify(existingAttributes) === JSON.stringify(newAttributes)
      );
    });

    if (isDuplicate) {
      throw new Error('SKU with the same attributes already exists.');
    }

    const res = await this.prisma.productSKU.update({
      where: { id },
      data: {
        price,
        quantity,
        imageUrl,
        productSkuAttributes: {
          deleteMany: {}, // Remove all existing attributes
          create: updateProductSkusDto?.attributeValues.map((attr) => ({
            attribute: { connect: { id: attr.attributeValueId } }, // Reconnect new attributes
          })),
        },
      },
      include: {
        productSkuAttributes: {
          select: {
            id: true,
            attribute: true,
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
    return { data: res };
  }

  async remove(id: number) {
    await this.prisma.productSKUAttribute.deleteMany({
      where: { skuId: id },
    });

    const sku = await this.prisma.productSKU.findUnique({
      where: { id },
    });

    if (sku?.imageUrl) {
      await this.firebaseService.deleteFile(sku?.imageUrl);
    }

    return this.prisma.productSKU.delete({ where: { id } });
  }
}
