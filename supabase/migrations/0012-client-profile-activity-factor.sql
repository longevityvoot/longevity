-- Coach-tunable activity factor for TDEE calculation. BMR × this = TDEE.
-- Null means use default 1.4 (light/sedentary).
ALTER TABLE "ClientProfile" ADD COLUMN "activityFactor" DOUBLE PRECISION;
