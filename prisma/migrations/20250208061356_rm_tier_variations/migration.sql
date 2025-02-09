/*
  Warnings:

  - You are about to drop the `TierVariant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TierVariant" DROP CONSTRAINT "TierVariant_productId_fkey";

-- DropTable
DROP TABLE "TierVariant";
