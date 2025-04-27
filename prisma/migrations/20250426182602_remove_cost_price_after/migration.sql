/*
  Warnings:

  - You are about to drop the column `costPriceAfter` on the `AdjustmentLogItem` table. All the data in the column will be lost.
  - Made the column `costPriceBefore` on table `AdjustmentLogItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AdjustmentLogItem" DROP COLUMN "costPriceAfter",
ALTER COLUMN "costPriceBefore" SET NOT NULL;
