-- AlterTable
ALTER TABLE "Estate" ADD COLUMN     "duesBankName" TEXT,
ADD COLUMN     "duesAccountNumber" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "receiptUrl" TEXT;
