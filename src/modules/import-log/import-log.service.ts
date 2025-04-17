import { Injectable } from "@nestjs/common";
import { CreateImportLogDto } from "./dto/create-import-log.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ImportLogService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateImportLogDto, userId: number) {
    const importLog = await this.prisma.importLog.create({
      data: {
        ...dto,
        createdBy: userId,
      },
    });

    // Cập nhật stock sau khi nhập kho
    await this.prisma.stock.upsert({
      where: {
        skuId_warehouseId: {
          skuId: dto.skuId,
          warehouseId: dto.warehouseId,
        },
      },
      update: {
        quantity: {
          increment: dto.quantity,
        },
      },
      create: {
        skuId: dto.skuId,
        warehouseId: dto.warehouseId,
        quantity: dto.quantity,
      },
    });

    return importLog;
  }

  async findAll() {
    return this.prisma.importLog.findMany({
      include: {
        warehouse: true,
        items: {
          include: {
            sku: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
