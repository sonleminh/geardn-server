/*
  Warnings:

  - Made the column `skuId` on table `CartItem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_skuId_fkey";

-- AlterTable
ALTER TABLE "CartItem" ALTER COLUMN "skuId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "ProductSKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
