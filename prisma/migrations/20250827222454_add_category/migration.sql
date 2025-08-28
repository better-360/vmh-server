-- AlterEnum
ALTER TYPE "public"."OrderItemType" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "category" TEXT;
