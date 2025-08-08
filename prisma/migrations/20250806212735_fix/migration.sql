/*
  Warnings:

  - You are about to drop the column `workspaceId` on the `ForwardingRequest` table. All the data in the column will be lost.
  - Added the required column `mailboxId` to the `ForwardingRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ForwardingRequest" DROP CONSTRAINT "ForwardingRequest_workspaceId_fkey";

-- AlterTable
ALTER TABLE "public"."ForwardingRequest" DROP COLUMN "workspaceId",
ADD COLUMN     "mailboxId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."ForwardingRequest" ADD CONSTRAINT "ForwardingRequest_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "public"."Mailbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;
