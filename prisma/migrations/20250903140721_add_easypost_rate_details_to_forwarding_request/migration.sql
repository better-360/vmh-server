/*
  Warnings:

  - Added the required column `baseShippingCost` to the `ForwardingRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `easypostRateId` to the `ForwardingRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectedCarrier` to the `ForwardingRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectedService` to the `ForwardingRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ForwardingRequest" ADD COLUMN     "baseShippingCost" INTEGER NOT NULL,
ADD COLUMN     "deliverySpeedFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "easypostRateId" TEXT NOT NULL,
ADD COLUMN     "easypostShipmentId" TEXT,
ADD COLUMN     "packagingFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rateDetails" JSONB,
ADD COLUMN     "selectedCarrier" TEXT NOT NULL,
ADD COLUMN     "selectedService" TEXT NOT NULL,
ADD COLUMN     "serviceFee" INTEGER NOT NULL DEFAULT 0;
