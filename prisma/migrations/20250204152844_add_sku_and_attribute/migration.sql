/*
  Warnings:

  - You are about to drop the column `colorAttributeId` on the `ProductSKU` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `ProductSKU` table. All the data in the column will be lost.
  - You are about to drop the column `sizeAttributeId` on the `ProductSKU` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `ProductSKU` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductSKU" DROP CONSTRAINT "ProductSKU_colorAttributeId_fkey";

-- DropForeignKey
ALTER TABLE "ProductSKU" DROP CONSTRAINT "ProductSKU_sizeAttributeId_fkey";

-- AlterTable
ALTER TABLE "ProductSKU" DROP COLUMN "colorAttributeId",
DROP COLUMN "deletedAt",
DROP COLUMN "sizeAttributeId",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "ProductSKUAttribute" (
    "id" SERIAL NOT NULL,
    "skuId" INTEGER NOT NULL,
    "attributeId" INTEGER NOT NULL,

    CONSTRAINT "ProductSKUAttribute_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductSKUAttribute" ADD CONSTRAINT "ProductSKUAttribute_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "ProductSKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSKUAttribute" ADD CONSTRAINT "ProductSKUAttribute_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "ProductAttribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
