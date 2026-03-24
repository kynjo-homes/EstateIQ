/*
  Warnings:

  - The values [FREE,BASIC,PRO,ENTERPRISE] on the enum `Plan` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING_PAYMENT');

-- AlterEnum
BEGIN;
CREATE TYPE "Plan_new" AS ENUM ('STARTER', 'PROFESSIONAL', 'CUSTOM');
ALTER TABLE "public"."Estate" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "Estate" ALTER COLUMN "plan" TYPE "Plan_new" USING ("plan"::text::"Plan_new");
ALTER TYPE "Plan" RENAME TO "Plan_old";
ALTER TYPE "Plan_new" RENAME TO "Plan";
DROP TYPE "public"."Plan_old";
ALTER TABLE "Estate" ALTER COLUMN "plan" SET DEFAULT 'STARTER';
COMMIT;

-- AlterTable
ALTER TABLE "Estate" ADD COLUMN     "paystackReference" TEXT,
ADD COLUMN     "subscriptionExpiresAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionStartedAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "plan" SET DEFAULT 'STARTER';
