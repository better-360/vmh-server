-- CreateEnum
CREATE TYPE "public"."MailActionPriority" AS ENUM ('STANDARD', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "public"."ForwardingRequest" ADD COLUMN     "priority" "public"."MailActionPriority" NOT NULL DEFAULT 'STANDARD';

-- AlterTable
ALTER TABLE "public"."MailAction" ADD COLUMN     "priority" "public"."MailActionPriority" NOT NULL DEFAULT 'STANDARD';
