/*
  Warnings:

  - The values [OPEN,RESOLVED,CLOSED,REOPENED,ON_HOLD,WAITING_FOR_STAFF,WAITING_FOR_THIRD_PARTY,ESCALATED,CANCELLED,CLOSED_BY_CUSTOMER] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."TaskStatus_new" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'WAITING_FOR_CUSTOMER');
ALTER TABLE "public"."Task" ALTER COLUMN "status" TYPE "public"."TaskStatus_new" USING ("status"::text::"public"."TaskStatus_new");
ALTER TYPE "public"."TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "public"."TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "public"."TaskStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Task" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
