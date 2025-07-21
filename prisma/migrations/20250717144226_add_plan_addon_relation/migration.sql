-- AlterTable
ALTER TABLE "User" ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;

-- CreateTable
CREATE TABLE "PlanAddon" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "addonId" UUID NOT NULL,
    "isIncludedInPlan" BOOLEAN NOT NULL DEFAULT false,
    "discountPercent" INTEGER,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlanAddon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanAddon_planId_idx" ON "PlanAddon"("planId");

-- CreateIndex
CREATE INDEX "PlanAddon_addonId_idx" ON "PlanAddon"("addonId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanAddon_planId_addonId_key" ON "PlanAddon"("planId", "addonId");

-- AddForeignKey
ALTER TABLE "PlanAddon" ADD CONSTRAINT "PlanAddon_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanAddon" ADD CONSTRAINT "PlanAddon_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "Addon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
