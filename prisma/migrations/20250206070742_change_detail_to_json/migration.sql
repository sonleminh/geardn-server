/*
  Warnings:

  - You are about to drop the `Details` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Details" DROP CONSTRAINT "Details_productId_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "details" JSONB;

-- DropTable
DROP TABLE "Details";
