/*
  Warnings:

  - You are about to drop the column `costPriceBefore` on the `AdjustmentLogItem` table. All the data in the column will be lost.
  - You are about to drop the column `costPrice` on the `ExportLogItem` table. All the data in the column will be lost.
  - You are about to drop the column `costPrice` on the `ImportLogItem` table. All the data in the column will be lost.
  - You are about to drop the column `costPrice` on the `OrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AdjustmentLogItem" DROP COLUMN "costPriceBefore",
ADD COLUMN     "unitCostBefore" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "ExportLogItem" DROP COLUMN "costPrice",
ADD COLUMN     "unitCost" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "ImportLogItem" DROP COLUMN "costPrice",
ADD COLUMN     "unitCost" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "costPrice",
ADD COLUMN     "unitCost" DECIMAL(65,30);
