/*
  Warnings:

  - The values [PLAN] on the enum `SubscriptionItemType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `billingCycle` to the `WorkspaceSubscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planId` to the `WorkspaceSubscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planPriceId` to the `WorkspaceSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionItemType_new" AS ENUM ('PRODUCT', 'ADDON');
ALTER TABLE "WorkspaceSubscriptionItem" ALTER COLUMN "itemType" TYPE "SubscriptionItemType_new" USING ("itemType"::text::"SubscriptionItemType_new");
ALTER TYPE "SubscriptionItemType" RENAME TO "SubscriptionItemType_old";
ALTER TYPE "SubscriptionItemType_new" RENAME TO "SubscriptionItemType";
DROP TYPE "SubscriptionItemType_old";
COMMIT;

-- AlterTable
ALTER TABLE "WorkspaceSubscription" ADD COLUMN     "billingCycle" "BillingCycle" NOT NULL,
ADD COLUMN     "planId" UUID NOT NULL,
ADD COLUMN     "planPriceId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "WorkspaceSubscription" ADD CONSTRAINT "WorkspaceSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceSubscription" ADD CONSTRAINT "WorkspaceSubscription_planPriceId_fkey" FOREIGN KEY ("planPriceId") REFERENCES "PlanPrice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
