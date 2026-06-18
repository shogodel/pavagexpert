ALTER TABLE contractors
  ADD COLUMN IF NOT EXISTS bio TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS photo_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS insurance_info TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS warranty_info TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS availability_status TEXT NOT NULL DEFAULT 'available'
    CHECK (availability_status IN ('available','busy','unavailable')),
  ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS response_time_hours NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS profile_completion_pct INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS contractor_portfolio (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  job_id        UUID REFERENCES jobs(id) ON DELETE SET NULL,
  caption       TEXT NOT NULL DEFAULT '',
  category      TEXT NOT NULL DEFAULT 'other'
    CHECK (category IN ('driveway','patio','walkway','commercial','excavation','drainage','turf','landscaping','retaining_wall','other')),
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_contractor ON contractor_portfolio(contractor_id, sort_order);

CREATE TABLE IF NOT EXISTS contractor_reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  job_id        UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  client_name   TEXT NOT NULL,
  rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title         TEXT NOT NULL DEFAULT '',
  body          TEXT NOT NULL DEFAULT '',
  response      TEXT NOT NULL DEFAULT '',
  responded_at  TIMESTAMPTZ,
  visible       BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_contractor ON contractor_reviews(contractor_id, created_at DESC);

CREATE TABLE IF NOT EXISTS contractor_social_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  platform      TEXT NOT NULL
    CHECK (platform IN ('google_business','facebook','instagram','linkedin','youtube','tiktok','twitter','houzz','homestars','pinterest')),
  url           TEXT NOT NULL,
  label         TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contractor_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_social_profiles_contractor ON contractor_social_profiles(contractor_id);

CREATE TABLE IF NOT EXISTS contractor_certifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  issuer        TEXT NOT NULL DEFAULT '',
  url           TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contractor_id, name)
);
