/*
  Warnings:

  - The values [COMPLETED,CANCELLED] on the enum `MailStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."MailStatus_new" AS ENUM ('PENDING', 'FORWARDED', 'SHREDDED', 'JUNKED', 'HOLDING_FOR_PICKUP', 'IN_PROCESS');
ALTER TABLE "public"."Mail" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Mail" ALTER COLUMN "status" TYPE "public"."MailStatus_new" USING ("status"::text::"public"."MailStatus_new");
ALTER TYPE "public"."MailStatus" RENAME TO "MailStatus_old";
ALTER TYPE "public"."MailStatus_new" RENAME TO "MailStatus";
DROP TYPE "public"."MailStatus_old";
ALTER TABLE "public"."Mail" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
