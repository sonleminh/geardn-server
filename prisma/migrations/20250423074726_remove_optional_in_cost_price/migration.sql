/*
  Warnings:

  - Made the column `costPrice` on table `Stock` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Stock" ALTER COLUMN "costPrice" SET NOT NULL;
