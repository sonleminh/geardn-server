/*
  Warnings:

  - A unique constraint covering the columns `[sku_name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sku_name` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" TEXT NOT NULL DEFAULT 'Không',
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sku_name" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Tags" (
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "productId" INTEGER
);

-- CreateTable
CREATE TABLE "TierVariant" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "options" TEXT[],
    "images" TEXT[],
    "productId" INTEGER,

    CONSTRAINT "TierVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Details" (
    "guarantee" INTEGER NOT NULL,
    "material" TEXT NOT NULL,
    "productId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Tags_value_key" ON "Tags"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Details_productId_key" ON "Details"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_name_key" ON "Product"("sku_name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- AddForeignKey
ALTER TABLE "Tags" ADD CONSTRAINT "Tags_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TierVariant" ADD CONSTRAINT "TierVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Details" ADD CONSTRAINT "Details_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
