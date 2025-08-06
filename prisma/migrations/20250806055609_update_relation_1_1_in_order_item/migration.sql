/*
  Warnings:

  - A unique constraint covering the columns `[orderItemId]` on the table `OrderReturnItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderId]` on the table `OrderReturnRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OrderReturnItem_orderItemId_key" ON "OrderReturnItem"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderReturnRequest_orderId_key" ON "OrderReturnRequest"("orderId");
