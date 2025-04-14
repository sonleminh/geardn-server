/*
  Warnings:

  - You are about to drop the column `key` on the `AttributeType` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `AttributeType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `AttributeType` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AttributeType_key_key";

-- AlterTable
ALTER TABLE "AttributeType" DROP COLUMN "key",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AttributeType_name_key" ON "AttributeType"("name");
