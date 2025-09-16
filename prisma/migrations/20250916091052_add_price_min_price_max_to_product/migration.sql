-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "priceMax" DECIMAL(65,30),
ADD COLUMN     "priceMin" DECIMAL(65,30);

-- CreateIndex
CREATE INDEX "Product_priceMin_idx" ON "Product"("priceMin");

-- CreateIndex
CREATE INDEX "Product_priceMax_idx" ON "Product"("priceMax");
