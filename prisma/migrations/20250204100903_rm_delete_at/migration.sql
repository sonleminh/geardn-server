-- CreateEnum
CREATE TYPE "ProductAttributeType" AS ENUM ('COLOR', 'SWITCH');

-- CreateTable
CREATE TABLE "ProductAttribute" (
    "id" SERIAL NOT NULL,
    "type" "ProductAttributeType" NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSKU" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "sizeAttributeId" INTEGER,
    "colorAttributeId" INTEGER,
    "sku" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductSKU_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductSKU" ADD CONSTRAINT "ProductSKU_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSKU" ADD CONSTRAINT "ProductSKU_sizeAttributeId_fkey" FOREIGN KEY ("sizeAttributeId") REFERENCES "ProductAttribute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSKU" ADD CONSTRAINT "ProductSKU_colorAttributeId_fkey" FOREIGN KEY ("colorAttributeId") REFERENCES "ProductAttribute"("id") ON DELETE SET NULL ON UPDATE CASCADE;
