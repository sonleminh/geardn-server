-- CreateEnum
CREATE TYPE "CancelReasonCode" AS ENUM ('CUSTOMER_CHANGED_MIND', 'OUT_OF_STOCK', 'DUPLICATE_ORDER', 'PAYMENT_FAILED', 'REFUSED_ON_DELIVERY', 'OTHER');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cancelReasonCode" "CancelReasonCode";
