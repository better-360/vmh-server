/*
  Warnings:

  - You are about to drop the column `subscriptionId` on the `Mail` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[steNumber]` on the table `Mailbox` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mailboxId` to the `Mail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `steNumber` to the `Mailbox` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Mail" DROP CONSTRAINT "Mail_subscriptionId_fkey";

-- DropIndex
DROP INDEX "public"."Mail_subscriptionId_idx";

-- AlterTable
ALTER TABLE "public"."Mail" DROP COLUMN "subscriptionId",
ADD COLUMN     "mailboxId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."Mailbox" ADD COLUMN     "steNumber" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Mail_mailboxId_idx" ON "public"."Mail"("mailboxId");

-- CreateIndex
CREATE UNIQUE INDEX "Mailbox_steNumber_key" ON "public"."Mailbox"("steNumber");

-- AddForeignKey
ALTER TABLE "public"."Mail" ADD CONSTRAINT "Mail_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "public"."Mailbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;
