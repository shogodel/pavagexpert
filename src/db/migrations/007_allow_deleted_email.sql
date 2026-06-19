-- Replace full UNIQUE constraint on contractors.email with a partial unique index
-- that only enforces uniqueness on non-deleted rows. This allows a soft-deleted
-- contractor's email to be reused for a new registration.

ALTER TABLE contractors DROP CONSTRAINT IF EXISTS contractors_email_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_contractors_email_active ON contractors(email) WHERE status != 'deleted';
