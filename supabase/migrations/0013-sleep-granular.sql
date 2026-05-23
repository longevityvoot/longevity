-- Granular sleep tracking — replaces the 1-10 subjective slider.
ALTER TABLE "DailyCheckIn" ADD COLUMN "sleepHours" DOUBLE PRECISION;
ALTER TABLE "DailyCheckIn" ADD COLUMN "sleepWakeups" INTEGER;
ALTER TABLE "DailyCheckIn" ADD COLUMN "sleepFeeling" TEXT;
