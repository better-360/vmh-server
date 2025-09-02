/*
  Warnings:

  - You are about to drop the column `weightKg` on the `Mail` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."MailStatus" ADD VALUE 'CONSOLIDATED';
ALTER TYPE "public"."MailStatus" ADD VALUE 'SCANNED';
ALTER TYPE "public"."MailStatus" ADD VALUE 'COMPLETED';

-- AlterEnum
ALTER TYPE "public"."MailType" ADD VALUE 'CONSOLIDATED';

-- AlterTable
ALTER TABLE "public"."Mail" DROP COLUMN "weightKg",
ADD COLUMN     "isJunked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentMailId" UUID,
ADD COLUMN     "weight" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "public"."ConsolidationAction" (
    "id" UUID NOT NULL,
    "officeLocationId" UUID,
    "status" "public"."ActionStatus" NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdPackageMailId" UUID,

    CONSTRAINT "ConsolidationAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ConsolidationActionToMail" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ConsolidationActionToMail_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConsolidationAction_createdPackageMailId_key" ON "public"."ConsolidationAction"("createdPackageMailId");

-- CreateIndex
CREATE INDEX "_ConsolidationActionToMail_B_index" ON "public"."_ConsolidationActionToMail"("B");

-- CreateIndex
CREATE INDEX "Mail_parentMailId_idx" ON "public"."Mail"("parentMailId");

-- AddForeignKey
ALTER TABLE "public"."Mail" ADD CONSTRAINT "Mail_parentMailId_fkey" FOREIGN KEY ("parentMailId") REFERENCES "public"."Mail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConsolidationAction" ADD CONSTRAINT "ConsolidationAction_createdPackageMailId_fkey" FOREIGN KEY ("createdPackageMailId") REFERENCES "public"."Mail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ConsolidationActionToMail" ADD CONSTRAINT "_ConsolidationActionToMail_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."ConsolidationAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ConsolidationActionToMail" ADD CONSTRAINT "_ConsolidationActionToMail_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Mail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
