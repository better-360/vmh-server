/*
  Warnings:

  - The values [FORWARD] on the enum `MailActionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."MailActionType_new" AS ENUM ('SHRED', 'SCAN', 'HOLD', 'JUNK', 'CHECK_DEPOSIT');
ALTER TABLE "public"."MailAction" ALTER COLUMN "type" TYPE "public"."MailActionType_new" USING ("type"::text::"public"."MailActionType_new");
ALTER TYPE "public"."MailActionType" RENAME TO "MailActionType_old";
ALTER TYPE "public"."MailActionType_new" RENAME TO "MailActionType";
DROP TYPE "public"."MailActionType_old";
COMMIT;
