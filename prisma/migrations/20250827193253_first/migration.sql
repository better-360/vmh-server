/*
  Warnings:

  - You are about to drop the column `bestFo` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "bestFo",
ADD COLUMN     "bestFor" JSONB;

-- AlterTable
ALTER TABLE "public"."TaskMessage" ALTER COLUMN "userId" DROP NOT NULL;
