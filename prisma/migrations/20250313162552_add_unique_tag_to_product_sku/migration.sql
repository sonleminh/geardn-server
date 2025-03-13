/*
  Warnings:

  - A unique constraint covering the columns `[sku]` on the table `ProductSKU` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProductSKU_sku_key" ON "ProductSKU"("sku");
