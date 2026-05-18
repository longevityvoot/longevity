-- ============================================================
-- Phase 8 — Body & Vitals
-- Paste into Supabase SQL Editor → Run after the initial schema.
-- Idempotent: uses IF NOT EXISTS where Postgres supports it.
-- ============================================================

-- 1. ClientProfile cadence fields
ALTER TABLE "ClientProfile"
  ADD COLUMN IF NOT EXISTS "weightCadence"  TEXT NOT NULL DEFAULT 'weekly',
  ADD COLUMN IF NOT EXISTS "waistCadence"   TEXT NOT NULL DEFAULT 'biweekly',
  ADD COLUMN IF NOT EXISTS "bpCadence"      TEXT NOT NULL DEFAULT 'as-needed',
  ADD COLUMN IF NOT EXISTS "glucoseCadence" TEXT NOT NULL DEFAULT 'as-needed';

-- 2. BodyMeasurement (weight / waist)
CREATE TABLE IF NOT EXISTS "BodyMeasurement" (
  "id"         TEXT NOT NULL,
  "userId"     TEXT NOT NULL,
  "type"       TEXT NOT NULL,
  "value"      DOUBLE PRECISION NOT NULL,
  "unit"       TEXT NOT NULL,
  "measuredAt" TIMESTAMP(3) NOT NULL,
  "context"    TEXT,
  "notes"      TEXT,
  CONSTRAINT "BodyMeasurement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BodyMeasurement_userId_type_measuredAt_idx"
  ON "BodyMeasurement"("userId", "type", "measuredAt");

DO $$ BEGIN
  ALTER TABLE "BodyMeasurement"
    ADD CONSTRAINT "BodyMeasurement_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. VitalReading (BP / glucose)
CREATE TABLE IF NOT EXISTS "VitalReading" (
  "id"         TEXT NOT NULL,
  "userId"     TEXT NOT NULL,
  "type"       TEXT NOT NULL,
  "measuredAt" TIMESTAMP(3) NOT NULL,
  "context"    TEXT,
  "values"     JSONB NOT NULL,
  "notes"      TEXT,
  "flag"       TEXT,
  CONSTRAINT "VitalReading_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "VitalReading_userId_type_measuredAt_idx"
  ON "VitalReading"("userId", "type", "measuredAt");

DO $$ BEGIN
  ALTER TABLE "VitalReading"
    ADD CONSTRAINT "VitalReading_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
