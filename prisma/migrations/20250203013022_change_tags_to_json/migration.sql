/*
  Warnings:

  - You are about to drop the column `slug` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Tags` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id_slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tags` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Tags" DROP CONSTRAINT "Tags_productId_fkey";

-- DropIndex
DROP INDEX "Product_slug_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "slug",
ADD COLUMN     "id_slug" TEXT,
ADD COLUMN     "tags" JSONB NOT NULL;

-- DropTable
DROP TABLE "Tags";

-- CreateIndex
CREATE UNIQUE INDEX "Product_id_slug_key" ON "Product"("id_slug");
