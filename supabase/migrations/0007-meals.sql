-- ============================================================
-- Meal logging — daily food + estimated kcal
-- ============================================================

CREATE TABLE IF NOT EXISTS "Meal" (
  "id"          TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "date"        DATE NOT NULL,
  "mealType"    TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "kcal"        INTEGER,
  "foodKey"     TEXT,
  "portion"     DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Meal_userId_date_idx"
  ON "Meal"("userId", "date");

DO $$ BEGIN
  ALTER TABLE "Meal"
    ADD CONSTRAINT "Meal_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
