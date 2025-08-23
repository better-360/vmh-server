/*
  Warnings:

  - A unique constraint covering the columns `[mailId,type]` on the table `MailAction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "public"."MailActionType" ADD VALUE 'CHECK_DEPOSIT';

-- AlterTable
ALTER TABLE "public"."Mail" ADD COLUMN     "isScanned" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."CheckDeposit" (
    "id" UUID NOT NULL,
    "mailId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "depositedAt" TIMESTAMP(3),
    "status" "public"."ActionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CheckDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CheckDeposit_mailId_idx" ON "public"."CheckDeposit"("mailId");

-- CreateIndex
CREATE UNIQUE INDEX "MailAction_mailId_type_key" ON "public"."MailAction"("mailId", "type");

-- AddForeignKey
ALTER TABLE "public"."CheckDeposit" ADD CONSTRAINT "CheckDeposit_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "public"."Mail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
