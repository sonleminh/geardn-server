/*
  Warnings:

  - You are about to drop the column `sellPrice` on the `OrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "sellPrice",
ADD COLUMN     "sellingPrice" DECIMAL(65,30);
