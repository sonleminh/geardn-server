/*
  Warnings:

  - You are about to drop the column `sku_name` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Product_sku_name_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "sku_name";
