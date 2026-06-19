ALTER TABLE jobs ADD COLUMN IF NOT EXISTS score INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_jobs_score ON jobs(score DESC);

UPDATE jobs SET verified = true WHERE verified = false;
