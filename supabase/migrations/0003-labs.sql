-- ============================================================
-- Phase 9 — Lab Results
-- Paste into Supabase SQL Editor → Run after the Phase 8 migration.
-- Idempotent: uses IF NOT EXISTS where Postgres supports it.
-- ============================================================

-- LabPanel
CREATE TABLE IF NOT EXISTS "LabPanel" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "date"      TIMESTAMP(3) NOT NULL,
  "labName"   TEXT,
  "note"      TEXT,
  "summary"   TEXT,
  "photoUrl"  TEXT,
  "status"    TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LabPanel_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "LabPanel_userId_date_idx"
  ON "LabPanel"("userId", "date");

DO $$ BEGIN
  ALTER TABLE "LabPanel"
    ADD CONSTRAINT "LabPanel_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- LabResult
CREATE TABLE IF NOT EXISTS "LabResult" (
  "id"       TEXT NOT NULL,
  "panelId"  TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "name"     TEXT NOT NULL,
  "value"    DOUBLE PRECISION NOT NULL,
  "unit"     TEXT NOT NULL,
  "refLow"   DOUBLE PRECISION,
  "refHigh"  DOUBLE PRECISION,
  "flag"     TEXT NOT NULL,
  "watch"    BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "LabResult_panelId_category_idx"
  ON "LabResult"("panelId", "category");

DO $$ BEGIN
  ALTER TABLE "LabResult"
    ADD CONSTRAINT "LabResult_panelId_fkey"
    FOREIGN KEY ("panelId") REFERENCES "LabPanel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
