CREATE TABLE IF NOT EXISTS analytics_events (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event    TEXT NOT NULL,
  page     TEXT NOT NULL DEFAULT '',
  job_id   UUID REFERENCES jobs(id) ON DELETE SET NULL,
  metadata JSONB,
  ip       TEXT NOT NULL DEFAULT '',
  ua       TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page ON analytics_events(page, created_at DESC);
