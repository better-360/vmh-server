/*
  Warnings:

  - You are about to drop the column `amount` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `billingCycle` on the `WorkspaceSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `WorkspaceSubscription` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'CANCELLED', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "SubscriptionItemType" AS ENUM ('PLAN', 'PRODUCT', 'ADDON');

-- CreateEnum
CREATE TYPE "SubscriptionItemStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'CANCELLED', 'EXPIRED', 'SUSPENDED');

-- AlterEnum
ALTER TYPE "BillingCycle" ADD VALUE 'ONE_TIME';

-- DropForeignKey
ALTER TABLE "WorkspaceSubscription" DROP CONSTRAINT "WorkspaceSubscription_planId_fkey";

-- AlterTable
ALTER TABLE "AddonVariant" ADD COLUMN     "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE "PlanPrice" ALTER COLUMN "billingCycle" SET DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "amount",
DROP COLUMN "currency";

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE "WorkspaceSubscription" DROP COLUMN "billingCycle",
DROP COLUMN "planId",
ADD COLUMN     "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "WorkspaceSubscriptionItem" (
    "id" UUID NOT NULL,
    "subscriptionId" UUID NOT NULL,
    "itemType" "SubscriptionItemType" NOT NULL,
    "itemId" UUID NOT NULL,
    "variantId" UUID,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "SubscriptionItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemDescription" TEXT,

    CONSTRAINT "WorkspaceSubscriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkspaceSubscriptionItem_subscriptionId_idx" ON "WorkspaceSubscriptionItem"("subscriptionId");

-- CreateIndex
CREATE INDEX "WorkspaceSubscriptionItem_itemId_idx" ON "WorkspaceSubscriptionItem"("itemId");

-- AddForeignKey
ALTER TABLE "WorkspaceSubscriptionItem" ADD CONSTRAINT "WorkspaceSubscriptionItem_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "WorkspaceSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
