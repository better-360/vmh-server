/*
  Warnings:

  - You are about to drop the column `intervalCount` on the `Recurring` table. All the data in the column will be lost.
  - Added the required column `interval_count` to the `Recurring` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Recurring" DROP COLUMN "intervalCount",
ADD COLUMN     "interval_count" INTEGER NOT NULL;
