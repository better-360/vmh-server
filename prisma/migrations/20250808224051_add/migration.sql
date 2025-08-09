/*
  Warnings:

  - You are about to drop the column `itemDescription` on the `SubscriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `itemName` on the `SubscriptionItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."SubscriptionItem" DROP COLUMN "itemDescription",
DROP COLUMN "itemName";

-- AddForeignKey
ALTER TABLE "public"."SubscriptionItem" ADD CONSTRAINT "SubscriptionItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
