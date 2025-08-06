/*
  Warnings:

  - You are about to drop the column `userId` on the `OrderReturnRequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderReturnRequest" DROP CONSTRAINT "OrderReturnRequest_userId_fkey";

-- AlterTable
ALTER TABLE "OrderReturnRequest" DROP COLUMN "userId";
