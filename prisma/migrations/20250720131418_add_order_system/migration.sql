/*
  Warnings:

  - Added the required column `type` to the `Package` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('BANK_CHECK', 'LEGAL_DOCUMENT', 'ENVELOPE', 'PACKAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "OrderItemType" AS ENUM ('PLAN', 'ADDON', 'PRODUCT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'PAYMENT_PROCESSING';
ALTER TYPE "OrderStatus" ADD VALUE 'PAYMENT_SUCCEEDED';
ALTER TYPE "OrderStatus" ADD VALUE 'PAYMENT_FAILED';
ALTER TYPE "OrderStatus" ADD VALUE 'PAYMENT_CANCELLED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PackageStatus" ADD VALUE 'FORWARDED';
ALTER TYPE "PackageStatus" ADD VALUE 'SHREDDED';

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "currentStatus" "PackageStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "isForwarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isShereded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "PackageType" NOT NULL;

-- AlterTable
ALTER TABLE "PackageItem" ADD COLUMN     "isForwarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isShereded" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "OrderStatus" NOT NULL DEFAULT 'PAYMENT_PENDING',
    "stripePaymentIntentId" TEXT,
    "stripeCustomerId" TEXT,
    "stripeSessionId" TEXT,
    "stripeClientSecret" TEXT,
    "userId" UUID,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "itemType" "OrderItemType" NOT NULL,
    "itemId" UUID NOT NULL,
    "variantId" UUID,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "itemName" TEXT NOT NULL,
    "itemDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Order_email_idx" ON "Order"("email");

-- CreateIndex
CREATE INDEX "Order_stripePaymentIntentId_idx" ON "Order"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_itemType_idx" ON "OrderItem"("itemType");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
