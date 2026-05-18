-- ============================================================
-- Longevity Designer — Initial schema + seed
-- Paste this whole block into Supabase SQL Editor → Run.
-- Idempotent-ish: uses IF NOT EXISTS on the migrations table and
-- ON CONFLICT on seed rows.
-- ============================================================

-- ----- 1. SCHEMA --------------------------------------------

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('COACH', 'CLIENT', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

CREATE TABLE "AuthSession" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("sessionToken")
);

CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

CREATE TABLE "ClientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "medicalHistory" TEXT,
    "allergies" TEXT,
    "longevityGoal" TEXT,
    "interestTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "wearableType" TEXT,
    "googleHealthConnected" BOOLEAN NOT NULL DEFAULT false,
    "googleHealthTokens" JSONB,
    "assignedCoachId" TEXT,
    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CoachProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentials" TEXT,
    "bio" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "CoachProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DailyCheckIn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "energyLevel" INTEGER,
    "moodLevel" INTEGER,
    "sleepQuality" INTEGER,
    "stressLevel" INTEGER,
    "nutritionNotes" TEXT,
    "supplementsTaken" JSONB,
    "socialActivities" TEXT,
    "alcoholUnits" DOUBLE PRECISION,
    "caffeineCount" INTEGER,
    "smokedToday" BOOLEAN,
    "notes" TEXT,
    CONSTRAINT "DailyCheckIn_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HealthMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "rawData" JSONB,
    CONSTRAINT "HealthMetric_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "durationMin" INTEGER,
    "summary" TEXT,
    "actionItems" JSONB,
    "attachedSnapshot" JSONB,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "description" TEXT NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");
CREATE UNIQUE INDEX "CoachProfile_userId_key" ON "CoachProfile"("userId");
CREATE UNIQUE INDEX "DailyCheckIn_userId_date_key" ON "DailyCheckIn"("userId", "date");
CREATE INDEX "HealthMetric_userId_metricType_date_idx" ON "HealthMetric"("userId", "metricType", "date");
CREATE INDEX "Message_threadId_createdAt_idx" ON "Message"("threadId", "createdAt");

-- Foreign keys
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_assignedCoachId_fkey" FOREIGN KEY ("assignedCoachId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CoachProfile" ADD CONSTRAINT "CoachProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyCheckIn" ADD CONSTRAINT "DailyCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HealthMetric" ADD CONSTRAINT "HealthMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----- 2. SEED ----------------------------------------------
-- 2 users: coach@example.com + client@example.com
-- Both passwords = "changeme-dev" (bcrypt hash below)
-- Coach is wired as assignedCoach for the client.

INSERT INTO "User" ("id", "email", "name", "role", "passwordHash")
VALUES
  ('seed_coach_01', 'coach@example.com',  'เภสัชกร (designer)', 'COACH',  '$2a$10$ncu8hSnj1oRiY3sSayet5.ne9yzJ5f7.LAM6FuAh/bAyXMn7KxCX.'),
  ('seed_client_01', 'client@example.com', 'ลูกค้าทดสอบ',        'CLIENT', '$2a$10$ncu8hSnj1oRiY3sSayet5.ne9yzJ5f7.LAM6FuAh/bAyXMn7KxCX.')
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "CoachProfile" ("id", "userId", "credentials", "bio", "isPrimary")
VALUES
  ('seed_coachprof_01', 'seed_coach_01', 'เภสัชกร', 'Primary designer', true)
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "ClientProfile" (
  "id", "userId", "dateOfBirth", "gender", "heightCm", "weightKg",
  "longevityGoal", "interestTags", "wearableType", "assignedCoachId"
)
VALUES
  ('seed_clientprof_01', 'seed_client_01', '1976-01-01', 'male', 172, 65,
   'ชะลอความเสื่อม ดูแลพลังงานระยะยาว', ARRAY['sleep','energy','fitness'], 'garmin', 'seed_coach_01')
ON CONFLICT ("userId") DO NOTHING;
