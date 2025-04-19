/*
  Warnings:

  - Added the required column `type` to the `ImportLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costPrice` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ImportType" AS ENUM ('NEW', 'RETURN', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "ExportType" AS ENUM ('CUSTOMER_ORDER', 'RETURN_TO_SUPPLIER', 'TRANSFER', 'DAMAGE_LOSS', 'MANUAL');

-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('INCREASE', 'DECREASE');

-- AlterTable
ALTER TABLE "ImportLog" ADD COLUMN     "type" "ImportType" NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "costPrice" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "ProductSKU" ADD COLUMN     "costPrice" DECIMAL(65,30) DEFAULT 0;

-- CreateTable
CREATE TABLE "ExportLog" (
    "id" SERIAL NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "type" "ExportType" NOT NULL,
    "orderId" INTEGER,
    "note" TEXT,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportLogItem" (
    "id" SERIAL NOT NULL,
    "exportLogId" INTEGER NOT NULL,
    "skuId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "ExportLogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdjustmentLog" (
    "id" SERIAL NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "type" "AdjustmentType" NOT NULL,
    "note" TEXT,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdjustmentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdjustmentLogItem" (
    "id" SERIAL NOT NULL,
    "adjustmentLogId" INTEGER NOT NULL,
    "skuId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(65,30),
    "note" TEXT,

    CONSTRAINT "AdjustmentLogItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExportLog" ADD CONSTRAINT "ExportLog_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportLog" ADD CONSTRAINT "ExportLog_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportLog" ADD CONSTRAINT "ExportLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportLogItem" ADD CONSTRAINT "ExportLogItem_exportLogId_fkey" FOREIGN KEY ("exportLogId") REFERENCES "ExportLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportLogItem" ADD CONSTRAINT "ExportLogItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "ProductSKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdjustmentLog" ADD CONSTRAINT "AdjustmentLog_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdjustmentLog" ADD CONSTRAINT "AdjustmentLog_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdjustmentLogItem" ADD CONSTRAINT "AdjustmentLogItem_adjustmentLogId_fkey" FOREIGN KEY ("adjustmentLogId") REFERENCES "AdjustmentLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdjustmentLogItem" ADD CONSTRAINT "AdjustmentLogItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "ProductSKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
