-- CreateEnum
CREATE TYPE "ForwardRequestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('WAITING', 'APPROVED', 'CANCELLED', 'DELETED', 'REJECTED', 'OTHER');

-- CreateEnum
CREATE TYPE "DeliveryAddressType" AS ENUM ('DELIVERY', 'BILLING', 'PICKUP');

-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('PENDING', 'IN_PROCESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED', 'ON_HOLD', 'WAITING_FOR_CUSTOMER', 'WAITING_FOR_STAFF', 'WAITING_FOR_THIRD_PARTY', 'ESCALATED', 'CANCELLED', 'CLOSED_BY_CUSTOMER');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PAYMENT_PENDING', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED', 'REFUNDED', 'ERROR', 'PROGRESS_ERROR', 'FAILED');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('SUPERADMIN', 'ADMIN', 'STAFF', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('LOW_BALANCE', 'FAILED_PAYMENT', 'FINAL_WARNING');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'RESOLVED', 'CLOSED', 'REOPENED', 'ON_HOLD', 'WAITING_FOR_CUSTOMER', 'WAITING_FOR_STAFF', 'WAITING_FOR_THIRD_PARTY', 'ESCALATED', 'CANCELLED', 'CLOSED_BY_CUSTOMER');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('GENERAL', 'LEGAL', 'ACCOUNTING', 'TAX', 'HR', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SERVICE', 'PRODUCT', 'OTHER', 'ADDON');

-- CreateEnum
CREATE TYPE "PermissionAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CHARGEBACK', 'CANCELLED', 'IN_PROGRESS', 'COMPLETED', 'ERROR');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('SUCCESS', 'PENDING', 'INPROGRESS', 'FAILED');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY', 'WEEKLY', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'INVITATION', 'OTHER');

-- CreateEnum
CREATE TYPE "PackageActionType" AS ENUM ('FORWARD', 'SHRED', 'SCAN', 'HOLD', 'JUNK');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVED', 'COMPLETED', 'DELETED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
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

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
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
CREATE TABLE "WorkspaceMember" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "role" "WorkspaceRole" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBalance" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "currentDebt" INTEGER NOT NULL DEFAULT 0,
    "currentBalance" INTEGER NOT NULL DEFAULT 0,
    "isRestricted" BOOLEAN NOT NULL DEFAULT false,
    "lastChargedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceTransaction" (
    "id" UUID NOT NULL,
    "userBalanceId" UUID NOT NULL,
    "stripeInvoiceId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BalanceTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceReminder" (
    "id" UUID NOT NULL,
    "userBalanceId" UUID NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "type" "ReminderType" NOT NULL,

    CONSTRAINT "BalanceReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceAddress" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "officeLocationId" UUID NOT NULL,
    "steNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WorkspaceAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceSubscription" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "officeLocationId" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL,
    "stripeSubscriptionId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeLocation" (
    "id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
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
CREATE TABLE "Plan" (
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

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanFeature" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "featureId" UUID NOT NULL,
    "includedLimit" INTEGER,
    "unitPrice" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlanFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanTemplate" (
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
CREATE TABLE "PlanTemplateFeature" (
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
CREATE TABLE "Feature" (
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
CREATE TABLE "PlanPrice" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL,
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
CREATE TABLE "WorkspaceFeatureUsage" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "officeLocationId" UUID NOT NULL,
    "featureId" UUID NOT NULL,
    "usedCount" INTEGER NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceFeatureUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" UUID NOT NULL,
    "steNumber" TEXT NOT NULL,
    "workspaceAddressId" UUID NOT NULL,
    "officeLocationId" UUID NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "senderName" TEXT,
    "senderAddress" TEXT,
    "carrier" TEXT,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "volumeDesi" DOUBLE PRECISION,
    "photoUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "PackageStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageItem" (
    "id" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "weightKg" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "volumeDesi" DOUBLE PRECISION,
    "photoUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PackageItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageAction" (
    "id" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "type" "PackageActionType" NOT NULL,
    "status" "ActionStatus" NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "meta" JSONB,

    CONSTRAINT "PackageAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageForwardRequest" (
    "id" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "officeLocationId" UUID NOT NULL,
    "deliveryAddressId" UUID NOT NULL,
    "deliverySpeedOptionId" UUID NOT NULL,
    "packagingTypeOptionId" UUID NOT NULL,
    "carrierId" UUID,
    "trackingCode" TEXT,
    "shippingCost" INTEGER NOT NULL,
    "packagingCost" INTEGER NOT NULL,
    "totalCost" INTEGER NOT NULL,
    "status" "ForwardRequestStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "PackageForwardRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carrier" (
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
CREATE TABLE "CarrierAvailability" (
    "id" UUID NOT NULL,
    "carrierId" UUID NOT NULL,
    "officeLocationId" UUID NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CarrierAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliverySpeedOption" (
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
CREATE TABLE "PackagingTypeOption" (
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
CREATE TABLE "DeliverySpeedPlanMapping" (
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
CREATE TABLE "PackagingTypePlanMapping" (
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
CREATE TABLE "WorkspaceDeliveryAddress" (
    "id" UUID NOT NULL,
    "type" "DeliveryAddressType" NOT NULL DEFAULT 'DELIVERY',
    "workspaceId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "zipCode" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceDeliveryAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stripeProductId" TEXT,
    "type" "ProductType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "stripePriceId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Addon" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stripeProductId" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Addon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddonVariant" (
    "id" UUID NOT NULL,
    "addonId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stripePriceId" TEXT,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AddonVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Forms" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "formName" TEXT NOT NULL,
    "formData" JSONB NOT NULL,
    "status" "FormStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
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
CREATE TABLE "Invitation" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "InvitationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" UUID NOT NULL,
    "ticketNo" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TicketPriority" NOT NULL,
    "isActivate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" UUID,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketMessage" (
    "id" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "fromStaff" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
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
CREATE TABLE "UserRole" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "RoleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "companyUserId" UUID NOT NULL,
    "action" "PermissionAction" NOT NULL,
    "subject" TEXT NOT NULL,
    "conditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AttachmentToTicket" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_AttachmentToTicket_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AttachmentToTicketMessage" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_AttachmentToTicketMessage_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_userId_isDefault_key" ON "WorkspaceMember"("userId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "UserBalance_userId_key" ON "UserBalance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBalance_stripeCustomerId_key" ON "UserBalance"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceAddress_steNumber_key" ON "WorkspaceAddress"("steNumber");

-- CreateIndex
CREATE INDEX "WorkspaceAddress_steNumber_idx" ON "WorkspaceAddress"("steNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceAddress_workspaceId_officeLocationId_key" ON "WorkspaceAddress"("workspaceId", "officeLocationId");

-- CreateIndex
CREATE INDEX "WorkspaceSubscription_workspaceId_isActive_idx" ON "WorkspaceSubscription"("workspaceId", "isActive");

-- CreateIndex
CREATE INDEX "WorkspaceSubscription_officeLocationId_isActive_idx" ON "WorkspaceSubscription"("officeLocationId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceSubscription_workspaceId_officeLocationId_isActive_key" ON "WorkspaceSubscription"("workspaceId", "officeLocationId", "isActive");

-- CreateIndex
CREATE INDEX "Plan_officeLocationId_idx" ON "Plan"("officeLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_slug_officeLocationId_key" ON "Plan"("slug", "officeLocationId");

-- CreateIndex
CREATE INDEX "PlanFeature_planId_idx" ON "PlanFeature"("planId");

-- CreateIndex
CREATE INDEX "PlanFeature_featureId_idx" ON "PlanFeature"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanFeature_planId_featureId_key" ON "PlanFeature"("planId", "featureId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanTemplate_name_key" ON "PlanTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PlanTemplate_slug_key" ON "PlanTemplate"("slug");

-- CreateIndex
CREATE INDEX "PlanTemplateFeature_planTemplateId_idx" ON "PlanTemplateFeature"("planTemplateId");

-- CreateIndex
CREATE INDEX "PlanTemplateFeature_featureId_idx" ON "PlanTemplateFeature"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanTemplateFeature_planTemplateId_featureId_key" ON "PlanTemplateFeature"("planTemplateId", "featureId");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_name_key" ON "Feature"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PlanPrice_planId_billingCycle_key" ON "PlanPrice"("planId", "billingCycle");

-- CreateIndex
CREATE INDEX "WorkspaceFeatureUsage_workspaceId_featureId_idx" ON "WorkspaceFeatureUsage"("workspaceId", "featureId");

-- CreateIndex
CREATE INDEX "WorkspaceFeatureUsage_officeLocationId_featureId_idx" ON "WorkspaceFeatureUsage"("officeLocationId", "featureId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceFeatureUsage_workspaceId_officeLocationId_featureI_key" ON "WorkspaceFeatureUsage"("workspaceId", "officeLocationId", "featureId", "usedAt");

-- CreateIndex
CREATE INDEX "Package_officeLocationId_idx" ON "Package"("officeLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "Package_steNumber_officeLocationId_key" ON "Package"("steNumber", "officeLocationId");

-- CreateIndex
CREATE INDEX "CarrierAvailability_officeLocationId_idx" ON "CarrierAvailability"("officeLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "CarrierAvailability_carrierId_officeLocationId_key" ON "CarrierAvailability"("carrierId", "officeLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliverySpeedOption_label_key" ON "DeliverySpeedOption"("label");

-- CreateIndex
CREATE UNIQUE INDEX "PackagingTypeOption_label_key" ON "PackagingTypeOption"("label");

-- CreateIndex
CREATE UNIQUE INDEX "DeliverySpeedPlanMapping_deliverySpeedId_officeLocationId_key" ON "DeliverySpeedPlanMapping"("deliverySpeedId", "officeLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "PackagingTypePlanMapping_packagingTypeId_officeLocationId_key" ON "PackagingTypePlanMapping"("packagingTypeId", "officeLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceDeliveryAddress_workspaceId_isDefault_key" ON "WorkspaceDeliveryAddress"("workspaceId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_userId_key" ON "Invitation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_companyUserId_action_subject_key" ON "permissions"("companyUserId", "action", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "Token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Token_email_type_key" ON "Token"("email", "type");

-- CreateIndex
CREATE INDEX "_AttachmentToTicket_B_index" ON "_AttachmentToTicket"("B");

-- CreateIndex
CREATE INDEX "_AttachmentToTicketMessage_B_index" ON "_AttachmentToTicketMessage"("B");

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBalance" ADD CONSTRAINT "UserBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceTransaction" ADD CONSTRAINT "BalanceTransaction_userBalanceId_fkey" FOREIGN KEY ("userBalanceId") REFERENCES "UserBalance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceReminder" ADD CONSTRAINT "BalanceReminder_userBalanceId_fkey" FOREIGN KEY ("userBalanceId") REFERENCES "UserBalance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceAddress" ADD CONSTRAINT "WorkspaceAddress_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceAddress" ADD CONSTRAINT "WorkspaceAddress_officeLocationId_fkey" FOREIGN KEY ("officeLocationId") REFERENCES "OfficeLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceSubscription" ADD CONSTRAINT "WorkspaceSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceSubscription" ADD CONSTRAINT "WorkspaceSubscription_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceSubscription" ADD CONSTRAINT "WorkspaceSubscription_officeLocationId_fkey" FOREIGN KEY ("officeLocationId") REFERENCES "OfficeLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_officeLocationId_fkey" FOREIGN KEY ("officeLocationId") REFERENCES "OfficeLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanTemplateFeature" ADD CONSTRAINT "PlanTemplateFeature_planTemplateId_fkey" FOREIGN KEY ("planTemplateId") REFERENCES "PlanTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanTemplateFeature" ADD CONSTRAINT "PlanTemplateFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanPrice" ADD CONSTRAINT "PlanPrice_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceFeatureUsage" ADD CONSTRAINT "WorkspaceFeatureUsage_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceFeatureUsage" ADD CONSTRAINT "WorkspaceFeatureUsage_officeLocationId_fkey" FOREIGN KEY ("officeLocationId") REFERENCES "OfficeLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceFeatureUsage" ADD CONSTRAINT "WorkspaceFeatureUsage_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_workspaceAddressId_fkey" FOREIGN KEY ("workspaceAddressId") REFERENCES "WorkspaceAddress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_officeLocationId_fkey" FOREIGN KEY ("officeLocationId") REFERENCES "OfficeLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageItem" ADD CONSTRAINT "PackageItem_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageAction" ADD CONSTRAINT "PackageAction_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageForwardRequest" ADD CONSTRAINT "PackageForwardRequest_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageForwardRequest" ADD CONSTRAINT "PackageForwardRequest_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageForwardRequest" ADD CONSTRAINT "PackageForwardRequest_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageForwardRequest" ADD CONSTRAINT "PackageForwardRequest_officeLocationId_fkey" FOREIGN KEY ("officeLocationId") REFERENCES "OfficeLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageForwardRequest" ADD CONSTRAINT "PackageForwardRequest_deliveryAddressId_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "WorkspaceDeliveryAddress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageForwardRequest" ADD CONSTRAINT "PackageForwardRequest_deliverySpeedOptionId_fkey" FOREIGN KEY ("deliverySpeedOptionId") REFERENCES "DeliverySpeedOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageForwardRequest" ADD CONSTRAINT "PackageForwardRequest_packagingTypeOptionId_fkey" FOREIGN KEY ("packagingTypeOptionId") REFERENCES "PackagingTypeOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierAvailability" ADD CONSTRAINT "CarrierAvailability_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierAvailability" ADD CONSTRAINT "CarrierAvailability_officeLocationId_fkey" FOREIGN KEY ("officeLocationId") REFERENCES "OfficeLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverySpeedPlanMapping" ADD CONSTRAINT "DeliverySpeedPlanMapping_deliverySpeedId_fkey" FOREIGN KEY ("deliverySpeedId") REFERENCES "DeliverySpeedOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverySpeedPlanMapping" ADD CONSTRAINT "DeliverySpeedPlanMapping_officeLocationId_fkey" FOREIGN KEY ("officeLocationId") REFERENCES "OfficeLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagingTypePlanMapping" ADD CONSTRAINT "PackagingTypePlanMapping_packagingTypeId_fkey" FOREIGN KEY ("packagingTypeId") REFERENCES "PackagingTypeOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagingTypePlanMapping" ADD CONSTRAINT "PackagingTypePlanMapping_officeLocationId_fkey" FOREIGN KEY ("officeLocationId") REFERENCES "OfficeLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceDeliveryAddress" ADD CONSTRAINT "WorkspaceDeliveryAddress_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddonVariant" ADD CONSTRAINT "AddonVariant_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "Addon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Forms" ADD CONSTRAINT "Forms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttachmentToTicket" ADD CONSTRAINT "_AttachmentToTicket_A_fkey" FOREIGN KEY ("A") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttachmentToTicket" ADD CONSTRAINT "_AttachmentToTicket_B_fkey" FOREIGN KEY ("B") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttachmentToTicketMessage" ADD CONSTRAINT "_AttachmentToTicketMessage_A_fkey" FOREIGN KEY ("A") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttachmentToTicketMessage" ADD CONSTRAINT "_AttachmentToTicketMessage_B_fkey" FOREIGN KEY ("B") REFERENCES "TicketMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
