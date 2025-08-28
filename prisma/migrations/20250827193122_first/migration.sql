-- CreateEnum
CREATE TYPE "public"."ForwardRequestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."MailType" AS ENUM ('BANK_CHECK', 'LEGAL_DOCUMENT', 'ENVELOPE', 'PACKAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."InvitationStatus" AS ENUM ('WAITING', 'APPROVED', 'CANCELLED', 'DELETED', 'REJECTED', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DeliveryAddressType" AS ENUM ('DELIVERY', 'BILLING', 'PICKUP');

-- CreateEnum
CREATE TYPE "public"."MailStatus" AS ENUM ('PENDING', 'FORWARDED', 'SHREDDED', 'COMPLETED', 'CANCELLED', 'IN_PROCESS');

-- CreateEnum
CREATE TYPE "public"."TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED', 'ON_HOLD', 'WAITING_FOR_CUSTOMER', 'WAITING_FOR_STAFF', 'WAITING_FOR_THIRD_PARTY', 'ESCALATED', 'CANCELLED', 'CLOSED_BY_CUSTOMER');

-- CreateEnum
CREATE TYPE "public"."TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAYMENT_SUCCEEDED', 'PAYMENT_FAILED', 'PAYMENT_CANCELLED', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED', 'REFUNDED', 'ERROR', 'PROGRESS_ERROR', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."RoleType" AS ENUM ('SUPERADMIN', 'ADMIN', 'STAFF', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "public"."ReminderType" AS ENUM ('LOW_BALANCE', 'FAILED_PAYMENT', 'FINAL_WARNING');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'RESOLVED', 'CLOSED', 'REOPENED', 'ON_HOLD', 'WAITING_FOR_CUSTOMER', 'WAITING_FOR_STAFF', 'WAITING_FOR_THIRD_PARTY', 'ESCALATED', 'CANCELLED', 'CLOSED_BY_CUSTOMER');

-- CreateEnum
CREATE TYPE "public"."PriceType" AS ENUM ('one_time', 'recurring');

-- CreateEnum
CREATE TYPE "public"."TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."TaskType" AS ENUM ('AUTOMATIC', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PermissionAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CHARGEBACK', 'CANCELLED', 'IN_PROGRESS', 'COMPLETED', 'ERROR');

-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('SUCCESS', 'PENDING', 'INPROGRESS', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."BillingCycle" AS ENUM ('MONTHLY', 'YEARLY', 'WEEKLY', 'QUARTERLY', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "public"."ResetCycle" AS ENUM ('MONTHLY', 'YEARLY', 'WEEKLY', 'QUARTERLY', 'ONE_TIME', 'DAILY', 'NO_RESET');

-- CreateEnum
CREATE TYPE "public"."TokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'INVITATION', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MailActionType" AS ENUM ('FORWARD', 'SHRED', 'SCAN', 'HOLD', 'JUNK', 'CHECK_DEPOSIT');

-- CreateEnum
CREATE TYPE "public"."ActionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."WorkspaceRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."RecipientRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."FormStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVED', 'COMPLETED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."OrderType" AS ENUM ('SINGLE', 'SUBSCRIPTION', 'INITIAL_SUBSCRIPTION', 'UPGRADE', 'DOWNGRADE', 'CHANGE_PLAN', 'CHANGE_ADDON', 'CHANGE_PRODUCT', 'CHANGE_QUANTITY');

-- CreateEnum
CREATE TYPE "public"."OrderItemType" AS ENUM ('PLAN', 'ADDON', 'PRODUCT');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'CANCELLED', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."SubscriptionItemStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'CANCELLED', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."ProductType" AS ENUM ('ADDON', 'PRODUCT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."RecurringInterval" AS ENUM ('day', 'week', 'month', 'year');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "telephone" TEXT,
    "profileImage" TEXT,
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "emailConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "telephoneConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "currentWorkspaceId" TEXT,
    "currentMailboxId" TEXT,
    "assignedLocationId" UUID,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Workspace" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Mailbox" (
    "id" UUID NOT NULL,
    "steNumber" TEXT NOT NULL,
    "workspaceId" UUID NOT NULL,
    "officeLocationId" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "planPriceId" UUID NOT NULL,
    "billingCycle" "public"."BillingCycle" NOT NULL,
    "stripeSubscriptionId" TEXT,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "forwardingAddressLimit" INTEGER NOT NULL DEFAULT 1,
    "recipientLimit" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Mailbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Recipient" (
    "id" UUID NOT NULL,
    "mailboxId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Recipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Plan" (
    "id" UUID NOT NULL,
    "officeLocationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "displayFeatures" JSONB,
    "showOnMarketplace" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanPrice" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "billingCycle" "public"."BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "description" TEXT,
    "stripePriceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PlanPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanAddon" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "productPriceId" UUID NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PlanAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" JSONB,
    "bestFo" JSONB,
    "stripeProductId" TEXT,
    "type" "public"."ProductType" NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "defaultPriceId" UUID,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductFeature" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "featureId" UUID NOT NULL,
    "includedLimit" INTEGER,
    "resetCycle" "public"."BillingCycle" NOT NULL DEFAULT 'ONE_TIME',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanFeature" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "featureId" UUID NOT NULL,
    "includedLimit" INTEGER,
    "unitPrice" INTEGER,
    "resetCycle" "public"."ResetCycle" NOT NULL DEFAULT 'MONTHLY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER,
    "showOnList" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PlanFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Feature" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Price" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "additionalFees" INTEGER,
    "stripePriceId" TEXT,
    "unit_amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "productId" UUID NOT NULL,
    "priceType" "public"."PriceType" NOT NULL DEFAULT 'one_time',
    "recurringId" UUID,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Recurring" (
    "id" UUID NOT NULL,
    "interval" "public"."RecurringInterval" NOT NULL,
    "interval_count" INTEGER NOT NULL,

    CONSTRAINT "Recurring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DeliveryAddress" (
    "id" UUID NOT NULL,
    "type" "public"."DeliveryAddressType" NOT NULL DEFAULT 'DELIVERY',
    "mailBoxId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "zipCode" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DeliveryAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriptionItem" (
    "id" UUID NOT NULL,
    "mailboxId" UUID NOT NULL,
    "itemType" "public"."ProductType" NOT NULL,
    "itemId" UUID NOT NULL,
    "priceId" UUID,
    "billingCycle" "public"."BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "public"."SubscriptionItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PAYMENT_PENDING',
    "type" "public"."OrderType" NOT NULL DEFAULT 'SINGLE',
    "stripePaymentIntentId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSessionId" TEXT,
    "stripeClientSecret" TEXT,
    "mailboxId" UUID,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkspaceMember" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "role" "public"."WorkspaceRole" NOT NULL,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkspaceBalance" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "currentDebt" INTEGER NOT NULL DEFAULT 0,
    "currentBalance" INTEGER NOT NULL DEFAULT 0,
    "isRestricted" BOOLEAN NOT NULL DEFAULT false,
    "lastChargedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BalanceTransaction" (
    "id" UUID NOT NULL,
    "wsbId" UUID NOT NULL,
    "stripeInvoiceId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "public"."TransactionStatus" NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BalanceTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BalanceReminder" (
    "id" UUID NOT NULL,
    "wsbId" UUID NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "type" "public"."ReminderType" NOT NULL,

    CONSTRAINT "BalanceReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OfficeLocation" (
    "id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "workingHours" TEXT,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "zipCode" TEXT,
    "description" TEXT,

    CONSTRAINT "OfficeLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeatureUsage" (
    "id" UUID NOT NULL,
    "mailBoxId" UUID NOT NULL,
    "featureId" UUID NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanTemplate" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "priceMonthly" INTEGER NOT NULL,
    "priceYearly" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlanTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanTemplateFeature" (
    "id" UUID NOT NULL,
    "planTemplateId" UUID NOT NULL,
    "featureId" UUID NOT NULL,
    "includedLimit" INTEGER,
    "unitPrice" INTEGER,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanTemplateFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Mail" (
    "id" UUID NOT NULL,
    "mailboxId" UUID NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "trackingNumber" TEXT,
    "trackingUrl" TEXT,
    "isShereded" BOOLEAN NOT NULL DEFAULT false,
    "isForwarded" BOOLEAN NOT NULL DEFAULT false,
    "isScanned" BOOLEAN NOT NULL DEFAULT false,
    "type" "public"."MailType" NOT NULL,
    "status" "public"."MailStatus" NOT NULL DEFAULT 'PENDING',
    "senderName" TEXT,
    "senderAddress" TEXT,
    "carrier" TEXT,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "volumeDesi" DOUBLE PRECISION,
    "volumeCm3" DOUBLE PRECISION,
    "photoUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "recipientId" UUID,

    CONSTRAINT "Mail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CheckDeposit" (
    "id" UUID NOT NULL,
    "mailId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "depositedAt" TIMESTAMP(3),
    "status" "public"."ActionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CheckDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MailAction" (
    "id" UUID NOT NULL,
    "mailId" UUID NOT NULL,
    "officeLocationId" UUID,
    "type" "public"."MailActionType" NOT NULL,
    "status" "public"."ActionStatus" NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "meta" JSONB,

    CONSTRAINT "MailAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ForwardingRequest" (
    "id" UUID NOT NULL,
    "mailId" UUID NOT NULL,
    "mailboxId" UUID NOT NULL,
    "officeLocationId" UUID NOT NULL,
    "deliveryAddressId" UUID NOT NULL,
    "deliverySpeedOptionId" UUID NOT NULL,
    "packagingTypeOptionId" UUID NOT NULL,
    "carrierId" UUID,
    "trackingCode" TEXT,
    "shippingCost" INTEGER NOT NULL,
    "packagingCost" INTEGER NOT NULL,
    "totalCost" INTEGER NOT NULL,
    "status" "public"."ForwardRequestStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "ForwardingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Carrier" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Carrier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CarrierAvailability" (
    "id" UUID NOT NULL,
    "carrierId" UUID NOT NULL,
    "officeLocationId" UUID NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CarrierAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DeliverySpeedOption" (
    "id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DeliverySpeedOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PackagingTypeOption" (
    "id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackagingTypeOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DeliverySpeedPlanMapping" (
    "id" UUID NOT NULL,
    "deliverySpeedId" UUID NOT NULL,
    "officeLocationId" UUID NOT NULL,
    "price" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliverySpeedPlanMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PackagingTypePlanMapping" (
    "id" UUID NOT NULL,
    "packagingTypeId" UUID NOT NULL,
    "officeLocationId" UUID NOT NULL,
    "price" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackagingTypePlanMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MailHandlerAssignment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "officeLocationId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MailHandlerAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Forms" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "formName" TEXT NOT NULL,
    "formData" JSONB NOT NULL,
    "status" "public"."FormStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "amount" DOUBLE PRECISION,
    "currency" TEXT,
    "status" TEXT,
    "link" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invitation" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "public"."InvitationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ticket" (
    "id" UUID NOT NULL,
    "officeLocationId" UUID,
    "ticketNo" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "public"."TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "public"."TicketPriority" NOT NULL,
    "isActivate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" UUID,
    "mailboxId" UUID,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TicketMessage" (
    "id" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "fromStaff" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" UUID NOT NULL,
    "mailboxId" UUID NOT NULL,
    "creatorId" UUID,
    "officeLocationId" UUID,
    "title" TEXT,
    "description" TEXT,
    "Icon" TEXT,
    "status" "public"."TaskStatus" NOT NULL,
    "priority" "public"."TaskPriority" NOT NULL,
    "type" "public"."TaskType" NOT NULL DEFAULT 'MANUAL',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TaskMessage" (
    "id" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "fromStaff" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Attachment" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "uploadedById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserRole" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "public"."RoleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permissions" (
    "id" UUID NOT NULL,
    "companyUserId" UUID NOT NULL,
    "action" "public"."PermissionAction" NOT NULL,
    "subject" TEXT NOT NULL,
    "conditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Token" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "type" "public"."TokenType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderItem" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "itemType" "public"."OrderItemType" NOT NULL,
    "itemId" UUID NOT NULL,
    "variantId" UUID,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "itemName" TEXT NOT NULL,
    "itemDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_AttachmentToTicket" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_AttachmentToTicket_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_AttachmentToTicketMessage" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_AttachmentToTicketMessage_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_AttachmentToTask" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_AttachmentToTask_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_AttachmentToTaskMessage" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_AttachmentToTaskMessage_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Mailbox_steNumber_key" ON "public"."Mailbox"("steNumber");

-- CreateIndex
CREATE INDEX "Mailbox_workspaceId_isActive_idx" ON "public"."Mailbox"("workspaceId", "isActive");

-- CreateIndex
CREATE INDEX "Mailbox_officeLocationId_isActive_idx" ON "public"."Mailbox"("officeLocationId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Mailbox_workspaceId_officeLocationId_isActive_key" ON "public"."Mailbox"("workspaceId", "officeLocationId", "isActive");

-- CreateIndex
CREATE INDEX "Plan_officeLocationId_idx" ON "public"."Plan"("officeLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_slug_officeLocationId_key" ON "public"."Plan"("slug", "officeLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanPrice_planId_billingCycle_key" ON "public"."PlanPrice"("planId", "billingCycle");

-- CreateIndex
CREATE UNIQUE INDEX "PlanAddon_planId_productPriceId_key" ON "public"."PlanAddon"("planId", "productPriceId");

-- CreateIndex
CREATE INDEX "ProductFeature_featureId_idx" ON "public"."ProductFeature"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFeature_productId_featureId_key" ON "public"."ProductFeature"("productId", "featureId");

-- CreateIndex
CREATE INDEX "PlanFeature_planId_idx" ON "public"."PlanFeature"("planId");

-- CreateIndex
CREATE INDEX "PlanFeature_featureId_idx" ON "public"."PlanFeature"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanFeature_planId_featureId_key" ON "public"."PlanFeature"("planId", "featureId");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_name_key" ON "public"."Feature"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryAddress_mailBoxId_isDefault_key" ON "public"."DeliveryAddress"("mailBoxId", "isDefault");

-- CreateIndex
CREATE INDEX "SubscriptionItem_mailboxId_idx" ON "public"."SubscriptionItem"("mailboxId");

-- CreateIndex
CREATE INDEX "SubscriptionItem_itemId_idx" ON "public"."SubscriptionItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "public"."Order"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Order_email_idx" ON "public"."Order"("email");

-- CreateIndex
CREATE INDEX "Order_stripePaymentIntentId_idx" ON "public"."Order"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "public"."Order"("status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "public"."Order"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_userId_isDefault_key" ON "public"."WorkspaceMember"("userId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceBalance_workspaceId_key" ON "public"."WorkspaceBalance"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceBalance_stripeCustomerId_key" ON "public"."WorkspaceBalance"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "FeatureUsage_mailBoxId_featureId_idx" ON "public"."FeatureUsage"("mailBoxId", "featureId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureUsage_mailBoxId_featureId_periodStart_key" ON "public"."FeatureUsage"("mailBoxId", "featureId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "PlanTemplate_name_key" ON "public"."PlanTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PlanTemplate_slug_key" ON "public"."PlanTemplate"("slug");

-- CreateIndex
CREATE INDEX "PlanTemplateFeature_planTemplateId_idx" ON "public"."PlanTemplateFeature"("planTemplateId");

-- CreateIndex
CREATE INDEX "PlanTemplateFeature_featureId_idx" ON "public"."PlanTemplateFeature"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanTemplateFeature_planTemplateId_featureId_key" ON "public"."PlanTemplateFeature"("planTemplateId", "featureId");

-- CreateIndex
CREATE INDEX "Mail_mailboxId_idx" ON "public"."Mail"("mailboxId");

-- CreateIndex
CREATE INDEX "CheckDeposit_mailId_idx" ON "public"."CheckDeposit"("mailId");

-- CreateIndex
CREATE UNIQUE INDEX "MailAction_mailId_type_key" ON "public"."MailAction"("mailId", "type");

-- CreateIndex
CREATE INDEX "CarrierAvailability_officeLocationId_idx" ON "public"."CarrierAvailability"("officeLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "CarrierAvailability_carrierId_officeLocationId_key" ON "public"."CarrierAvailability"("carrierId", "officeLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliverySpeedOption_label_key" ON "public"."DeliverySpeedOption"("label");

-- CreateIndex
CREATE UNIQUE INDEX "PackagingTypeOption_label_key" ON "public"."PackagingTypeOption"("label");

-- CreateIndex
CREATE UNIQUE INDEX "DeliverySpeedPlanMapping_deliverySpeedId_officeLocationId_key" ON "public"."DeliverySpeedPlanMapping"("deliverySpeedId", "officeLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "PackagingTypePlanMapping_packagingTypeId_officeLocationId_key" ON "public"."PackagingTypePlanMapping"("packagingTypeId", "officeLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "MailHandlerAssignment_userId_key" ON "public"."MailHandlerAssignment"("userId");

-- CreateIndex
CREATE INDEX "MailHandlerAssignment_officeLocationId_idx" ON "public"."MailHandlerAssignment"("officeLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_userId_key" ON "public"."Invitation"("userId");

-- CreateIndex
CREATE INDEX "Task_mailboxId_idx" ON "public"."Task"("mailboxId");

-- CreateIndex
CREATE INDEX "Task_creatorId_idx" ON "public"."Task"("creatorId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "public"."Task"("status");

-- CreateIndex
CREATE INDEX "Task_priority_idx" ON "public"."Task"("priority");

-- CreateIndex
CREATE INDEX "Task_type_idx" ON "public"."Task"("type");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "public"."Task"("dueDate");

-- CreateIndex
CREATE INDEX "Task_createdAt_idx" ON "public"."Task"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_companyUserId_action_subject_key" ON "public"."permissions"("companyUserId", "action", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "public"."Token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Token_email_type_key" ON "public"."Token"("email", "type");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "public"."OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_itemType_idx" ON "public"."OrderItem"("itemType");

-- CreateIndex
CREATE INDEX "_AttachmentToTicket_B_index" ON "public"."_AttachmentToTicket"("B");

-- CreateIndex
CREATE INDEX "_AttachmentToTicketMessage_B_index" ON "public"."_AttachmentToTicketMessage"("B");

-- CreateIndex
CREATE INDEX "_AttachmentToTask_B_index" ON "public"."_AttachmentToTask"("B");

-- CreateIndex
CREATE INDEX "_AttachmentToTaskMessage_B_index" ON "public"."_AttachmentToTaskMessage"("B");

-- AddForeignKey
ALTER TABLE "public"."Mailbox" ADD CONSTRAINT "Mailbox_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mailbox" ADD CONSTRAINT "Mailbox_officeLocationId_fkey" FOREIGN KEY ("officeLocationId") REFERENCES "public"."OfficeLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mailbox" ADD CONSTRAINT "Mailbox_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mailbox" ADD CONSTRAINT "Mailbox_planPriceId_fkey" FOREIGN KEY ("planPriceId") REFERENCES "public"."PlanPrice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Recipient" ADD CONSTRAINT "Recipient_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "public"."Mailbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Plan" ADD CONSTRAINT "Plan_officeLocationId_fkey" FOREIGN KEY ("officeLocationId") REFERENCES "public"."OfficeLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanPrice" ADD CONSTRAINT "PlanPrice_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanAddon" ADD CONSTRAINT "PlanAddon_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanAddon" ADD CONSTRAINT "PlanAddon_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanAddon" ADD CONSTRAINT "PlanAddon_productPriceId_fkey" FOREIGN KEY ("productPriceId") REFERENCES "public"."Price"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductFeature" ADD CONSTRAINT "ProductFeature_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductFeature" ADD CONSTRAINT "ProductFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "public"."Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanFeature" ADD CONSTRAINT "PlanFeature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanFeature" ADD CONSTRAINT "PlanFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "public"."Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Price" ADD CONSTRAINT "Price_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Price" ADD CONSTRAINT "Price_recurringId_fkey" FOREIGN KEY ("recurringId") REFERENCES "public"."Recurring"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DeliveryAddress" ADD CONSTRAINT "DeliveryAddress_mailBoxId_fkey" FOREIGN KEY ("mailBoxId") REFERENCES "public"."Mailbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscriptionItem" ADD CONSTRAINT "SubscriptionItem_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "public"."Mailbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscriptionItem" ADD CONSTRAINT "SubscriptionItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "public"."Mailbox"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkspaceBalance" ADD CONSTRAINT "WorkspaceBalance_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BalanceTransaction" ADD CONSTRAINT "BalanceTransaction_wsbId_fkey" FOREIGN KEY ("wsbId") REFERENCES "public"."WorkspaceBalance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BalanceReminder" ADD CONSTRAINT "BalanceReminder_wsbId_fkey" FOREIGN KEY ("wsbId") REFERENCES "public"."WorkspaceBalance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeatureUsage" ADD CONSTRAINT "FeatureUsage_mailBoxId_fkey" FOREIGN KEY ("mailBoxId") REFERENCES "public"."Mailbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeatureUsage" ADD CONSTRAINT "FeatureUsage_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "public"."Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanTemplateFeature" ADD CONSTRAINT "PlanTemplateFeature_planTemplateId_fkey" FOREIGN KEY ("planTemplateId") REFERENCES "public"."PlanTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanTemplateFeature" ADD CONSTRAINT "PlanTemplateFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "public"."Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mail" ADD CONSTRAINT "Mail_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "public"."Mailbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mail" ADD CONSTRAINT "Mail_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."Recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CheckDeposit" ADD CONSTRAINT "CheckDeposit_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "public"."Mail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MailAction" ADD CONSTRAINT "MailAction_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "public"."Mail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForwardingRequest" ADD CONSTRAINT "ForwardingRequest_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "public"."Mail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForwardingRequest" ADD CONSTRAINT "ForwardingRequest_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "public"."Mailbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForwardingRequest" ADD CONSTRAINT "ForwardingRequest_officeLocationId_fkey" FOREIGN KEY ("officeLocationId") REFERENCES "public"."OfficeLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForwardingRequest" ADD CONSTRAINT "ForwardingRequest_deliveryAddressId_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "public"."DeliveryAddress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForwardingRequest" ADD CONSTRAINT "ForwardingRequest_deliverySpeedOptionId_fkey" FOREIGN KEY ("deliverySpeedOptionId") REFERENCES "public"."DeliverySpeedOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForwardingRequest" ADD CONSTRAINT "ForwardingRequest_packagingTypeOptionId_fkey" FOREIGN KEY ("packagingTypeOptionId") REFERENCES "public"."PackagingTypeOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForwardingRequest" ADD CONSTRAINT "ForwardingRequest_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "public"."Carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CarrierAvailability" ADD CONSTRAINT "CarrierAvailability_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "public"."Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CarrierAvailability" ADD CONSTRAINT "CarrierAvailability_officeLocationId_fkey" FOREIGN KEY ("officeLocationId") REFERENCES "public"."OfficeLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DeliverySpeedPlanMapping" ADD CONSTRAINT "DeliverySpeedPlanMapping_deliverySpeedId_fkey" FOREIGN KEY ("deliverySpeedId") REFERENCES "public"."DeliverySpeedOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DeliverySpeedPlanMapping" ADD CONSTRAINT "DeliverySpeedPlanMapping_officeLocationId_fkey" FOREIGN KEY ("officeLocationId") REFERENCES "public"."OfficeLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PackagingTypePlanMapping" ADD CONSTRAINT "PackagingTypePlanMapping_packagingTypeId_fkey" FOREIGN KEY ("packagingTypeId") REFERENCES "public"."PackagingTypeOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PackagingTypePlanMapping" ADD CONSTRAINT "PackagingTypePlanMapping_officeLocationId_fkey" FOREIGN KEY ("officeLocationId") REFERENCES "public"."OfficeLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MailHandlerAssignment" ADD CONSTRAINT "MailHandlerAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MailHandlerAssignment" ADD CONSTRAINT "MailHandlerAssignment_officeLocationId_fkey" FOREIGN KEY ("officeLocationId") REFERENCES "public"."OfficeLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Forms" ADD CONSTRAINT "Forms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ticket" ADD CONSTRAINT "Ticket_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "public"."Mailbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TicketMessage" ADD CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "public"."Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TicketMessage" ADD CONSTRAINT "TicketMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "public"."Mailbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskMessage" ADD CONSTRAINT "TaskMessage_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskMessage" ADD CONSTRAINT "TaskMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AttachmentToTicket" ADD CONSTRAINT "_AttachmentToTicket_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AttachmentToTicket" ADD CONSTRAINT "_AttachmentToTicket_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AttachmentToTicketMessage" ADD CONSTRAINT "_AttachmentToTicketMessage_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AttachmentToTicketMessage" ADD CONSTRAINT "_AttachmentToTicketMessage_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."TicketMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AttachmentToTask" ADD CONSTRAINT "_AttachmentToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AttachmentToTask" ADD CONSTRAINT "_AttachmentToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AttachmentToTaskMessage" ADD CONSTRAINT "_AttachmentToTaskMessage_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AttachmentToTaskMessage" ADD CONSTRAINT "_AttachmentToTaskMessage_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."TaskMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
