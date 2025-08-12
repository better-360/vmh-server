/*
  Warnings:

  - The `currentStatus` column on the `Mail` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Mail` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `PackageAction` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."MailStatus" AS ENUM ('PENDING', 'FORWARDED', 'SHREDDED', 'COMPLETED', 'CANCELLED', 'IN_PROCESS');

-- CreateEnum
CREATE TYPE "public"."MailActionType" AS ENUM ('FORWARD', 'SHRED', 'SCAN', 'HOLD', 'JUNK');

-- DropForeignKey
ALTER TABLE "public"."Mailbox" DROP CONSTRAINT "Mailbox_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PackageAction" DROP CONSTRAINT "PackageAction_packageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkspaceMember" DROP CONSTRAINT "WorkspaceMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkspaceMember" DROP CONSTRAINT "WorkspaceMember_workspaceId_fkey";

-- AlterTable
ALTER TABLE "public"."Mail" DROP COLUMN "currentStatus",
ADD COLUMN     "currentStatus" "public"."MailStatus" NOT NULL DEFAULT 'PENDING',
DROP COLUMN "status",
ADD COLUMN     "status" "public"."MailStatus" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "public"."PackageAction";

-- DropEnum
DROP TYPE "public"."PackageActionType";

-- DropEnum
DROP TYPE "public"."PackageStatus";

-- CreateTable
CREATE TABLE "public"."MailAction" (
    "id" UUID NOT NULL,
    "mailId" UUID NOT NULL,
    "type" "public"."MailActionType" NOT NULL,
    "status" "public"."ActionStatus" NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "meta" JSONB,

    CONSTRAINT "MailAction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Mailbox" ADD CONSTRAINT "Mailbox_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MailAction" ADD CONSTRAINT "MailAction_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "public"."Mail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
