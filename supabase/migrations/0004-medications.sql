-- ============================================================
-- Phase 10 — Medications & supplements
-- Paste into Supabase SQL Editor → Run after Phase 9.
-- ============================================================

CREATE TABLE IF NOT EXISTS "Medication" (
  "id"          TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "type"        TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "dose"        TEXT NOT NULL,
  "schedule"    TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "reason"      TEXT,
  "source"      TEXT NOT NULL,
  "sourceName"  TEXT,
  "startedDate" TIMESTAMP(3) NOT NULL,
  "stoppedDate" TIMESTAMP(3),
  "status"      TEXT NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Medication_userId_status_idx"
  ON "Medication"("userId", "status");

DO $$ BEGIN
  ALTER TABLE "Medication"
    ADD CONSTRAINT "Medication_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "MedicationLog" (
  "id"           TEXT NOT NULL,
  "medicationId" TEXT NOT NULL,
  "date"         DATE NOT NULL,
  "slot"         TEXT NOT NULL,
  "taken"        BOOLEAN NOT NULL,
  "takenAt"      TIMESTAMP(3),
  CONSTRAINT "MedicationLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MedicationLog_medicationId_date_slot_key"
  ON "MedicationLog"("medicationId", "date", "slot");
CREATE INDEX IF NOT EXISTS "MedicationLog_medicationId_date_idx"
  ON "MedicationLog"("medicationId", "date");

DO $$ BEGIN
  ALTER TABLE "MedicationLog"
    ADD CONSTRAINT "MedicationLog_medicationId_fkey"
    FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
