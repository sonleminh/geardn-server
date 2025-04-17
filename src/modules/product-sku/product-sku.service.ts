import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductSkuDto } from './dto/create-product-sku.dto';
import { UpdateProductSkuDto } from './dto/update-product-sku.dto';

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

  async create(createProductSkusDto: CreateProductSkuDto) {
    const sku = await this.generateSKU();
    const { productId, imageUrl, price, attributeValues } =
      createProductSkusDto;

    const existingSkus = await this.prisma.productSKU.findMany({
      where: { productId },
      include: { productSkuAttribute: true },
    });

    const isDuplicate = existingSkus.some((existingSku) => {
      const existingAttribute = existingSku.productSkuAttribute
        .map((attr) => attr.attributeValueId)
        .sort();
      const newAttribute = attributeValues
        .map((attr) => attr.attributeValueId)
        .sort();
      return JSON.stringify(existingAttribute) === JSON.stringify(newAttribute);
    });

    if (isDuplicate) {
      throw new Error('SKU with the same attribute already exists.');
    }

    // Tạo SKU trước
    const newSku = await this.prisma.productSKU.create({
      data: {
        productId,
        sku,
        imageUrl,
        price,
        // quantity,
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
        productSkuAttribute: {
          include: {
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
  }

  async findAll() {
    const [res, total] = await Promise.all([
      this.prisma.productSKU.findMany({
        include: {
          productSkuAttribute: {
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
        productSkuAttribute: {
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
    if (!res) {
      throw new NotFoundException('Product not found');
    }
    return { message: 'success', data: res };
  }

  async getProductSkuBySlug(sku: string) {
    const product = await this.prisma.productSKU.findUnique({
      where: { sku },
      include: {
        productSkuAttribute: {
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
        // quantity: true,
        imageUrl: true,
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        productSkuAttribute: {
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
    if (!res) {
      throw new NotFoundException('Không tìm thấy sản phẩm!');
    }
    return { data: res };
  }

  async update(id: number, updateProductSkusDto: UpdateProductSkuDto) {
    const { productId, price, imageUrl, attributeValues } =
      updateProductSkusDto;
    const existingSkus = await this.prisma.productSKU.findMany({
      where: { productId: productId },
      include: { productSkuAttribute: true },
    });

    const filteredSkus = existingSkus.filter((sku) => sku.id !== id);

    const isDuplicate = filteredSkus.some((existingSku) => {
      const existingAttribute = existingSku.productSkuAttribute
        .map((attr) => attr.attributeValueId)
        .sort();
      const newAttribute = attributeValues
        .map((attr) => attr.attributeValueId)
        .sort();
      return JSON.stringify(existingAttribute) === JSON.stringify(newAttribute);
    });

    if (isDuplicate) {
      throw new Error('SKU with the same attribute already exists.');
    }

    const res = await this.prisma.productSKU.update({
      where: { id },
      data: {
        price,
        // quantity,
        imageUrl,
        productSkuAttribute: {
          deleteMany: {}, // Remove all existing attribute
          create: updateProductSkusDto?.attributeValues.map((attr) => ({
            attributeValue: { connect: { id: attr.attributeValueId } }, // Reconnect new attribute
          })),
        },
      },
      include: {
        productSkuAttribute: {
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
