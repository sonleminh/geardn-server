/*
  Warnings:

  - You are about to drop the column `note` on the `AdjustmentLogItem` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `AdjustmentLogItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `AdjustmentLogItem` table. All the data in the column will be lost.
  - Changed the type of `reason` on the `AdjustmentLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `quantityBefore` to the `AdjustmentLogItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantityChange` to the `AdjustmentLogItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warehouseId` to the `AdjustmentLogItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AdjustmentReason" AS ENUM ('INVENTORY_AUDIT', 'DAMAGED', 'LOST', 'FOUND', 'CUSTOMER_RETURN', 'DATA_CORRECTION');

-- AlterTable
ALTER TABLE "AdjustmentLog" DROP COLUMN "reason",
ADD COLUMN     "reason" "AdjustmentReason" NOT NULL;

-- AlterTable
ALTER TABLE "AdjustmentLogItem" DROP COLUMN "note",
DROP COLUMN "price",
DROP COLUMN "quantity",
ADD COLUMN     "costPriceAfter" DECIMAL(65,30),
ADD COLUMN     "costPriceBefore" DECIMAL(65,30),
ADD COLUMN     "quantityBefore" INTEGER NOT NULL,
ADD COLUMN     "quantityChange" INTEGER NOT NULL,
ADD COLUMN     "warehouseId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
