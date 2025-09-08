/*
  Warnings:

  - You are about to drop the column `userId` on the `Forms` table. All the data in the column will be lost.
  - Added the required column `mailboxId` to the `Forms` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Forms" DROP CONSTRAINT "Forms_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Forms" DROP COLUMN "userId",
ADD COLUMN     "mailboxId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Forms" ADD CONSTRAINT "Forms_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "public"."Mailbox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
