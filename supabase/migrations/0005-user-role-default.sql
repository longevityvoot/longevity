-- ============================================================
-- LINE Login support — let OAuth signups insert without role
-- ============================================================

-- New OAuth users get CLIENT by default. Existing rows untouched.
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CLIENT';
