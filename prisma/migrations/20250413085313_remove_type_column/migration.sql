/*
  Warnings:

  - You are about to drop the column `type` on the `ProductAttribute` table. All the data in the column will be lost.
  - Made the column `typeId` on table `ProductAttribute` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ProductAttribute" DROP CONSTRAINT "ProductAttribute_typeId_fkey";

-- AlterTable
ALTER TABLE "ProductAttribute" DROP COLUMN "type",
ALTER COLUMN "typeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ProductAttribute" ADD CONSTRAINT "ProductAttribute_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "AttributeType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
