/*
  Warnings:

  - You are about to drop the column `slugId` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[skuId,attributeId]` on the table `ProductSKUAttribute` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Product_slugId_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "slugId",
ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSKUAttribute_skuId_attributeId_key" ON "ProductSKUAttribute"("skuId", "attributeId");
