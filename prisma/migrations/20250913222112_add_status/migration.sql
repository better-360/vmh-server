/*
  Warnings:

  - The `description` column on the `Plan` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `bankAccountId` to the `CheckDeposit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."MailStatus" ADD VALUE 'WAITING_FOR_CONSOLIDATION';
ALTER TYPE "public"."MailStatus" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "public"."CheckDeposit" ADD COLUMN     "bankAccountId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."Plan" ADD COLUMN     "bestFor" JSONB,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB;

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "displayFeatures" JSONB;

-- CreateTable
CREATE TABLE "public"."BankAccount" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "accountNickname" TEXT NOT NULL,
    "holderName" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "swiftCode" TEXT,
    "routingNumber" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_workspaceId_isDefault_key" ON "public"."BankAccount"("workspaceId", "isDefault");

-- AddForeignKey
ALTER TABLE "public"."CheckDeposit" ADD CONSTRAINT "CheckDeposit_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "public"."BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BankAccount" ADD CONSTRAINT "BankAccount_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
