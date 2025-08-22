-- DropForeignKey
ALTER TABLE "public"."Ticket" DROP CONSTRAINT "Ticket_workspaceId_fkey";

-- AlterTable
ALTER TABLE "public"."Ticket" ADD COLUMN     "mailboxId" UUID;

-- AddForeignKey
ALTER TABLE "public"."Ticket" ADD CONSTRAINT "Ticket_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "public"."Mailbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;
