/*
  Warnings:

  - Added the required column `productName` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productSlug` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skuAttributes` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skuCode` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productName" TEXT NOT NULL,
ADD COLUMN     "productSlug" TEXT NOT NULL,
ADD COLUMN     "skuAttributes" JSONB NOT NULL,
ADD COLUMN     "skuCode" TEXT NOT NULL;
