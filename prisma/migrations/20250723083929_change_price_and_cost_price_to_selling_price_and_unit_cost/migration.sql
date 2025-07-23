/*
  Warnings:

  - You are about to drop the column `price` on the `ProductSKU` table. All the data in the column will be lost.
  - You are about to drop the column `costPrice` on the `Stock` table. All the data in the column will be lost.
  - Added the required column `sellingPrice` to the `ProductSKU` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductSKU" DROP COLUMN "price",
ADD COLUMN     "sellingPrice" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "costPrice",
ADD COLUMN     "unitCost" DECIMAL(65,30) NOT NULL DEFAULT 0;
