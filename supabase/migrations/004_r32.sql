-- Add 3rd and 4th place columns to bracket_standings for 2026 format (16avos de final)
ALTER TABLE bracket_standings
  ADD COLUMN IF NOT EXISTS third_place TEXT,
  ADD COLUMN IF NOT EXISTS fourth_place TEXT;
