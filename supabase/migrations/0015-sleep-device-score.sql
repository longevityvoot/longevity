-- Optional device sleep score (0-100) from Fitbit/Garmin/Samsung.
-- Overrides the computed hours+wakeups+feeling score when provided.
ALTER TABLE "DailyCheckIn" ADD COLUMN "sleepScore" INTEGER;
