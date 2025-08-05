/*
  Warnings:

  - Added the required column `type` to the `OrderReturnRequest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReturnRequestType" AS ENUM ('CANCEL', 'RETURN', 'DELIVERY_FAIL');

-- AlterTable
ALTER TABLE "OrderReturnRequest" ADD COLUMN     "type" "ReturnRequestType" NOT NULL;
