-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ReturnReasonCode" AS ENUM ('DEFECTIVE', 'WRONG_ITEM', 'CUSTOMER_CHANGED_MIND', 'BETTER_PRICE_FOUND', 'OTHER');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'DELIVERY_FAILED';

-- CreateTable
CREATE TABLE "OrderReturnRequest" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "status" "ReturnStatus" NOT NULL,
    "reasonCode" "ReturnReasonCode" NOT NULL,
    "reasonNote" TEXT,
    "createdById" INTEGER NOT NULL,
    "approvedById" INTEGER,
    "userId" INTEGER,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderReturnRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderReturnItem" (
    "id" SERIAL NOT NULL,
    "returnRequestId" INTEGER NOT NULL,
    "orderItemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "OrderReturnItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderReturnRequest" ADD CONSTRAINT "OrderReturnRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderReturnRequest" ADD CONSTRAINT "OrderReturnRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderReturnRequest" ADD CONSTRAINT "OrderReturnRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderReturnRequest" ADD CONSTRAINT "OrderReturnRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderReturnItem" ADD CONSTRAINT "OrderReturnItem_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "OrderReturnRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderReturnItem" ADD CONSTRAINT "OrderReturnItem_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
