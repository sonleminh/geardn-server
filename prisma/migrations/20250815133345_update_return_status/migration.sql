/*
  Warnings:

  - The values [PENDING] on the enum `ReturnStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReturnStatus_new" AS ENUM ('AWAITING_APPROVAL', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELED');
ALTER TABLE "OrderReturnRequest" ALTER COLUMN "status" TYPE "ReturnStatus_new" USING ("status"::text::"ReturnStatus_new");
ALTER TYPE "ReturnStatus" RENAME TO "ReturnStatus_old";
ALTER TYPE "ReturnStatus_new" RENAME TO "ReturnStatus";
DROP TYPE "ReturnStatus_old";
COMMIT;
