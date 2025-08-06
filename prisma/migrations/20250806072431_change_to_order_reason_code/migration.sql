/*
  Warnings:

  - The `cancelReasonCode` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `reasonCode` on the `OrderReturnRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OrderReasonCode" AS ENUM ('CUSTOMER_CHANGED_MIND', 'OUT_OF_STOCK', 'DUPLICATE_ORDER', 'PAYMENT_FAILED', 'REFUSED_ON_DELIVERY', 'DEFECTIVE', 'WRONG_ITEM', 'BETTER_PRICE_FOUND', 'OTHER');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "cancelReasonCode",
ADD COLUMN     "cancelReasonCode" "OrderReasonCode";

-- AlterTable
ALTER TABLE "OrderReturnRequest" DROP COLUMN "reasonCode",
ADD COLUMN     "reasonCode" "OrderReasonCode" NOT NULL;

-- DropEnum
DROP TYPE "CancelReasonCode";

-- DropEnum
DROP TYPE "ReturnReasonCode";
