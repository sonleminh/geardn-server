/*
  Warnings:

  - You are about to drop the column `costPrice` on the `ProductSKU` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductSKU" DROP COLUMN "costPrice";

-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "costPrice" DECIMAL(65,30) DEFAULT 0;
