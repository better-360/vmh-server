-- AlterTable
ALTER TABLE "public"."DeliveryAddress" ADD COLUMN     "recipientName" TEXT,
ADD COLUMN     "recipientTelephone" TEXT,
ALTER COLUMN "state" DROP NOT NULL;
