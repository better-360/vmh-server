-- AlterTable
ALTER TABLE "public"."Mail" ADD COLUMN     "trackingNumber" TEXT,
ADD COLUMN     "trackingUrl" TEXT,
ADD COLUMN     "volumeCm3" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "defaultPriceId" UUID;
