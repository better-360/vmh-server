-- DropIndex
DROP INDEX "public"."Order_stripePaymentIntentId_key";

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "stripeCheckoutUrl" TEXT,
ALTER COLUMN "stripePaymentIntentId" DROP NOT NULL;
