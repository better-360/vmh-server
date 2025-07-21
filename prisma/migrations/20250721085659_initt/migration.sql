/*
  Warnings:

  - You are about to drop the `PackageItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PackageItem" DROP CONSTRAINT "PackageItem_packageId_fkey";

-- DropTable
DROP TABLE "PackageItem";
