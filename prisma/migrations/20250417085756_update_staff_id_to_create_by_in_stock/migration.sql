/*
  Warnings:

  - You are about to drop the column `staffId` on the `ImportLog` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `ProductSKU` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `ImportLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ImportLog" DROP CONSTRAINT "ImportLog_staffId_fkey";

-- AlterTable
ALTER TABLE "ImportLog" DROP COLUMN "staffId",
ADD COLUMN     "createdBy" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ProductSKU" DROP COLUMN "quantity";

-- CreateTable
CREATE TABLE "Stock" (
    "id" SERIAL NOT NULL,
    "skuId" INTEGER NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Stock_skuId_idx" ON "Stock"("skuId");

-- CreateIndex
CREATE INDEX "Stock_warehouseId_idx" ON "Stock"("warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_skuId_warehouseId_key" ON "Stock"("skuId", "warehouseId");

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "ProductSKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportLog" ADD CONSTRAINT "ImportLog_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
