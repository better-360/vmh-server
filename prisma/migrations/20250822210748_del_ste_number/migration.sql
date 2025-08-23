/*
  Warnings:

  - You are about to drop the column `steNumber` on the `Mail` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Mail_steNumber_idx";

-- AlterTable
ALTER TABLE "public"."Mail" DROP COLUMN "steNumber";
