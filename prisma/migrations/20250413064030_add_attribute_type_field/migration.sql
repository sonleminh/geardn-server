-- AlterTable
ALTER TABLE "ProductAttribute" ADD COLUMN     "typeId" INTEGER,
ALTER COLUMN "type" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AttributeType" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttributeType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AttributeType_key_key" ON "AttributeType"("key");

-- AddForeignKey
ALTER TABLE "ProductAttribute" ADD CONSTRAINT "ProductAttribute_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "AttributeType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
