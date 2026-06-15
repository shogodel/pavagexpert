ALTER TABLE contractors ADD COLUMN IF NOT EXISTS service_areas TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE contractors DROP CONSTRAINT IF EXISTS contractors_status_check;
ALTER TABLE contractors ADD CONSTRAINT contractors_status_check
  CHECK (status IN ('pending', 'active', 'paused', 'deleted', 'rejected'));

UPDATE contractors SET status = 'active' WHERE status = 'approved';
UPDATE contractors SET status = 'rejected' WHERE status = 'rejected';

CREATE INDEX IF NOT EXISTS idx_contractors_status ON contractors(status);
