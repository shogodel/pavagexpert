CREATE TABLE IF NOT EXISTS consent_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id    TEXT NOT NULL DEFAULT '',
  consent_type  TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL,
  categories    TEXT[] NOT NULL DEFAULT '{}',
  ip_address    TEXT NOT NULL DEFAULT '',
  user_agent    TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_logs_visitor ON consent_logs(visitor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consent_logs_type ON consent_logs(consent_type, created_at DESC);

CREATE TABLE IF NOT EXISTS data_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  request_type  TEXT NOT NULL CHECK (request_type IN ('deletion', 'export')),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'completed', 'rejected')),
  token         TEXT NOT NULL DEFAULT '',
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_requests_email ON data_requests(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_requests_token ON data_requests(token) WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS terms_acceptance (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type     TEXT NOT NULL CHECK (user_type IN ('client', 'contractor', 'admin')),
  user_id       UUID NOT NULL,
  terms_version TEXT NOT NULL,
  ip_address    TEXT NOT NULL DEFAULT '',
  accepted_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_terms_acceptance_user ON terms_acceptance(user_type, user_id, accepted_at DESC);

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS scheduled_deletion_at TIMESTAMPTZ;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS terms_version TEXT NOT NULL DEFAULT '';
