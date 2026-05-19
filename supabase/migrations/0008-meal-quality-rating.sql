-- Bell-curve quality self-rating per macro category on each meal.
-- Range -2..+2: ขาดมาก / ขาดนิด / พอดี / เกินนิด / เกินมาก. Null = not rated.
ALTER TABLE "Meal"
  ADD COLUMN "proteinRating" INTEGER,
  ADD COLUMN "vegRating"     INTEGER,
  ADD COLUMN "carbRating"    INTEGER,
  ADD COLUMN "fatRating"     INTEGER;
