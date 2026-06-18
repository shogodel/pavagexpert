ALTER TABLE claims
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE claims
  DROP CONSTRAINT IF EXISTS claims_status_check,
  ADD CONSTRAINT claims_status_check
    CHECK (status IN ('pending','accepted','rejected','completed'));

CREATE TABLE IF NOT EXISTS contractor_bills (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id),
  period_start  DATE NOT NULL,
  period_end    DATE NOT NULL,
  total_cents   INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','sent','paid','overdue')),
  paid_at       TIMESTAMPTZ,
  notes         TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contractor_bills_contractor
  ON contractor_bills(contractor_id, period_start DESC);

CREATE TABLE IF NOT EXISTS bill_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id          UUID NOT NULL REFERENCES contractor_bills(id) ON DELETE CASCADE,
  item_type        TEXT NOT NULL CHECK (item_type IN ('monthly_fee','job_fee')),
  job_id           UUID REFERENCES jobs(id) ON DELETE SET NULL,
  claim_id         UUID REFERENCES claims(id) ON DELETE SET NULL,
  amount_cents     INTEGER NOT NULL,
  description      TEXT NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
