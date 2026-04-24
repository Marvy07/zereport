-- Section 9 hosted delivery and access-token support
ALTER TABLE "Report"
ADD COLUMN IF NOT EXISTS "webSlug" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Report_webSlug_key" ON "Report"("webSlug");
CREATE INDEX IF NOT EXISTS "Report_webSlug_idx" ON "Report"("webSlug");

DO $$
BEGIN
  CREATE TYPE "ReportDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'OPENED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "ReportDelivery" (
  "id" TEXT NOT NULL,
  "reportId" TEXT NOT NULL,
  "recipientEmail" TEXT NOT NULL,
  "recipientName" TEXT,
  "status" "ReportDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "deliveryTokenHash" TEXT,
  "sentAt" TIMESTAMP(3),
  "openedAt" TIMESTAMP(3),
  "errorMsg" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReportDelivery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ReportDelivery_reportId_recipientEmail_key" ON "ReportDelivery"("reportId", "recipientEmail");
CREATE INDEX IF NOT EXISTS "ReportDelivery_reportId_idx" ON "ReportDelivery"("reportId");
CREATE INDEX IF NOT EXISTS "ReportDelivery_status_idx" ON "ReportDelivery"("status");
CREATE INDEX IF NOT EXISTS "ReportDelivery_deliveryTokenHash_idx" ON "ReportDelivery"("deliveryTokenHash");

DO $$
BEGIN
  ALTER TABLE "ReportDelivery"
  ADD CONSTRAINT "ReportDelivery_reportId_fkey"
  FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
