-- AlterTable
ALTER TABLE "public"."Mail" ADD COLUMN     "recipientId" UUID;

-- CreateTable
CREATE TABLE "public"."Recipient" (
    "id" UUID NOT NULL,
    "mailboxId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Recipient_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Recipient" ADD CONSTRAINT "Recipient_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "public"."Mailbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mail" ADD CONSTRAINT "Mail_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."Recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
