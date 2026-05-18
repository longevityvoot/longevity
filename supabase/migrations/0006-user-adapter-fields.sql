-- ============================================================
-- PrismaAdapter (NextAuth) expects emailVerified + image columns
-- on the User table. Adding them so OAuth signups don't fail.
-- ============================================================

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "image"         TEXT;
