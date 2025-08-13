/*
  Warnings:

  - You are about to drop the column `currentStatus` on the `Mail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Mail" DROP COLUMN "currentStatus";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "currentMailboxId" TEXT,
ADD COLUMN     "currentWorkspaceId" TEXT;
