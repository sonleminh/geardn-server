-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shipment" JSONB NOT NULL DEFAULT '{}';
