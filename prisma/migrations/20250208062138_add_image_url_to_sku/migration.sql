/*
  Warnings:

  - Added the required column `imageUrl` to the `ProductSKU` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductSKU" ADD COLUMN     "imageUrl" TEXT NOT NULL;
