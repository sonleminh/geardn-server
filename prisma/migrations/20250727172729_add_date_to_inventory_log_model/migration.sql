/*
  Warnings:

  - Added the required column `adjustmentDate` to the `AdjustmentLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exportDate` to the `ExportLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `importDate` to the `ImportLog` table without a default value. This is not possible if the table is not empty.
  - Made the column `sellingPrice` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unitCost` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `imageUrl` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AdjustmentLog" ADD COLUMN     "adjustmentDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ExportLog" ADD COLUMN     "exportDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ImportLog" ADD COLUMN     "importDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "sellingPrice" SET NOT NULL,
ALTER COLUMN "unitCost" SET NOT NULL,
ALTER COLUMN "imageUrl" SET NOT NULL;
