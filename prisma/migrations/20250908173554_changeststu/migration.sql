/*
  Warnings:

  - The values [ACTIVE,INACTIVE,ARCHIVED,DELETED] on the enum `FormStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."FormStatus_new" AS ENUM ('PENDING', 'COMPLETED');
ALTER TABLE "public"."Forms" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Forms" ALTER COLUMN "status" TYPE "public"."FormStatus_new" USING ("status"::text::"public"."FormStatus_new");
ALTER TYPE "public"."FormStatus" RENAME TO "FormStatus_old";
ALTER TYPE "public"."FormStatus_new" RENAME TO "FormStatus";
DROP TYPE "public"."FormStatus_old";
ALTER TABLE "public"."Forms" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Forms" ALTER COLUMN "status" SET DEFAULT 'PENDING';
