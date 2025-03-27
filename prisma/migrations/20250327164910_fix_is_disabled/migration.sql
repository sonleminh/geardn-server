/*
  Warnings:

  - You are about to drop the column `isDisable` on the `PaymentMethod` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PaymentMethod" DROP COLUMN "isDisable",
ADD COLUMN     "isDisabled" BOOLEAN NOT NULL DEFAULT false;
