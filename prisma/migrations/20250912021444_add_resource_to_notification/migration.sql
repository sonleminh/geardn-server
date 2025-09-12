/*
  Warnings:

  - You are about to drop the column `body` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "body",
ADD COLUMN     "resourceId" INTEGER,
ADD COLUMN     "resourceType" TEXT;
