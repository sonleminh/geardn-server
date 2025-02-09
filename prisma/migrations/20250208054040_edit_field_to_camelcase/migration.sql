/*
  Warnings:

  - You are about to drop the column `id_slug` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slugId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Product_id_slug_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "id_slug",
DROP COLUMN "is_deleted",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slugId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Product_slugId_key" ON "Product"("slugId");
