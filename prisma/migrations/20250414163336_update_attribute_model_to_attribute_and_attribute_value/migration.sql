/*
  Warnings:

  - You are about to drop the column `attributeId` on the `ProductSKUAttribute` table. All the data in the column will be lost.
  - You are about to drop the `AttributeType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductAttribute` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[skuId,attributeValueId]` on the table `ProductSKUAttribute` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `attributeValueId` to the `ProductSKUAttribute` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductAttribute" DROP CONSTRAINT "ProductAttribute_typeId_fkey";

-- DropForeignKey
ALTER TABLE "ProductSKUAttribute" DROP CONSTRAINT "ProductSKUAttribute_attributeId_fkey";

-- DropIndex
DROP INDEX "ProductSKUAttribute_skuId_attributeId_key";

-- AlterTable
ALTER TABLE "ProductSKUAttribute" DROP COLUMN "attributeId",
ADD COLUMN     "attributeValueId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "AttributeType";

-- DropTable
DROP TABLE "ProductAttribute";

-- CreateTable
CREATE TABLE "Attribute" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttributeValue" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "attributeId" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_name_key" ON "Attribute"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSKUAttribute_skuId_attributeValueId_key" ON "ProductSKUAttribute"("skuId", "attributeValueId");

-- AddForeignKey
ALTER TABLE "AttributeValue" ADD CONSTRAINT "AttributeValue_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSKUAttribute" ADD CONSTRAINT "ProductSKUAttribute_attributeValueId_fkey" FOREIGN KEY ("attributeValueId") REFERENCES "AttributeValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
