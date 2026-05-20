-- Scale brand preference on ClientProfile. Used to pick the right
-- reference band for muscle mass — different consumer BIA scales
-- (Omron, InBody, Tanita, Xiaomi) report and classify SMM differently.
ALTER TABLE "ClientProfile" ADD COLUMN "scaleBrand" TEXT;
