/*
  Warnings:

  - You are about to drop the column `price` on the `ImportLogItem` table. All the data in the column will be lost.
  - Added the required column `costPrice` to the `ImportLogItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ImportLogItem" DROP COLUMN "price",
ADD COLUMN     "costPrice" DECIMAL(65,30) NOT NULL;
