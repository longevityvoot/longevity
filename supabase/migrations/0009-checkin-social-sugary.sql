-- Structured social engagement kind (replaces free-text-only scoring).
--   "none" | "text" | "call" | "in-person" | "group"
ALTER TABLE "DailyCheckIn" ADD COLUMN "socialKind" TEXT;

-- Sugary drinks: น้ำอัดลม, น้ำหวาน, น้ำผลไม้, ชานมไข่มุก, กาแฟใส่น้ำตาล/นม
ALTER TABLE "DailyCheckIn" ADD COLUMN "sugaryDrinkCount" INTEGER;
