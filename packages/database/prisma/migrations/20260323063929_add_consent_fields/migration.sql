-- AlterTable
ALTER TABLE "AuthUser" ADD COLUMN     "consentGiven" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consentGivenAt" TIMESTAMP(3);
