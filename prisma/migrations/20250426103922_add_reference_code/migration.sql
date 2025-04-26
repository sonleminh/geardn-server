/*
  Warnings:

  - A unique constraint covering the columns `[referenceCode]` on the table `AdjustmentLog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[referenceCode]` on the table `ExportLog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[referenceCode]` on the table `ImportLog` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `referenceCode` to the `AdjustmentLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referenceCode` to the `ExportLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costPrice` to the `ExportLogItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referenceCode` to the `ImportLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdjustmentLog" ADD COLUMN     "referenceCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ExportLog" ADD COLUMN     "referenceCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ExportLogItem" ADD COLUMN     "costPrice" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "ImportLog" ADD COLUMN     "referenceCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AdjustmentLog_referenceCode_key" ON "AdjustmentLog"("referenceCode");

-- CreateIndex
CREATE UNIQUE INDEX "ExportLog_referenceCode_key" ON "ExportLog"("referenceCode");

-- CreateIndex
CREATE UNIQUE INDEX "ImportLog_referenceCode_key" ON "ImportLog"("referenceCode");
