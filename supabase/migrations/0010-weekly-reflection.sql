-- Weekly reflection — behavior aggregates that are naturally weekly
-- (social peak, alcohol units/week, sugary drinks total, smoking days).
CREATE TABLE "WeeklyReflection" (
  "id"               TEXT NOT NULL,
  "userId"           TEXT NOT NULL,
  "weekStart"        DATE NOT NULL,
  "alcoholUnits"     DOUBLE PRECISION,
  "sugaryDrinkCount" INTEGER,
  "smokeDays"        INTEGER,
  "socialKind"       TEXT,
  "notes"            TEXT,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WeeklyReflection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WeeklyReflection_userId_weekStart_key"
  ON "WeeklyReflection"("userId", "weekStart");

CREATE INDEX "WeeklyReflection_userId_weekStart_idx"
  ON "WeeklyReflection"("userId", "weekStart");

ALTER TABLE "WeeklyReflection"
  ADD CONSTRAINT "WeeklyReflection_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
