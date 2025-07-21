/*
  Warnings:

  - You are about to drop the `ProductLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductLog" DROP CONSTRAINT "ProductLog_changedBy_fkey";

-- DropForeignKey
ALTER TABLE "ProductLog" DROP CONSTRAINT "ProductLog_productId_fkey";

-- DropTable
DROP TABLE "ProductLog";
