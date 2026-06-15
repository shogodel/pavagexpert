ALTER TABLE contractors ADD COLUMN IF NOT EXISTS username TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_contractors_username ON contractors(username) WHERE username != '';

ALTER TABLE contractors DROP CONSTRAINT IF EXISTS contractors_status_check;
ALTER TABLE contractors ADD CONSTRAINT contractors_status_check
  CHECK (status IN ('applied','approved','rejected','paused','active','deleted'));

ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE jobs ADD CONSTRAINT jobs_status_check
  CHECK (status IN ('draft','published','in_progress','completed','cancelled','new'));

ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
