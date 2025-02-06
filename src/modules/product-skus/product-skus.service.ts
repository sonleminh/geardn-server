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
    const { attributes, ...skuData } = createProductSkusDto;
    try {
      const newSKU = await this.prisma.productSKU.create({
        data: {
          ...skuData,
          attributes: {
            create: attributes.map((attr) => ({
              attributeId: attr.attributeId,
            })),
          },
        },
        include: {
          attributes: true,
        },
      });

      return newSKU;
    } catch (error) {
      throw new Error(`Error creating SKU: ${error.message}`);
    }
  }

  findAll() {
    return `This action returns all productSkus`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productSkus`;
  }

  async findByProduct(id: number) {
    const res = await this.prisma.productSKU.findMany({
      where: { productId: id },
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
