-- ============================================================
-- 013 — Security, Wallet, Automation, Multi-tenant, Fraud, SMS
-- ============================================================

-- 1. AUDIT LOG (admin actions)
CREATE TABLE IF NOT EXISTS audit_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id   TEXT NOT NULL,
  action     TEXT NOT NULL,
  entity     TEXT NOT NULL DEFAULT '',
  entity_id  TEXT NOT NULL DEFAULT '',
  details    JSONB,
  ip_address TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON audit_log(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action, created_at DESC);

-- 2. LOGIN ATTEMPTS (brute-force protection)
CREATE TABLE IF NOT EXISTS login_attempts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  ip_address TEXT NOT NULL DEFAULT '',
  success    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_id ON login_attempts(identifier, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address, created_at DESC);

-- 3. CSRF TOKENS
CREATE TABLE IF NOT EXISTS csrf_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token      TEXT NOT NULL UNIQUE,
  used       BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 hour'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_token ON csrf_tokens(token);

-- 4. 2FA columns
ALTER TABLE admin ADD COLUMN IF NOT EXISTS two_factor_secret TEXT NOT NULL DEFAULT '';
ALTER TABLE admin ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS two_factor_secret TEXT NOT NULL DEFAULT '';
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false;

-- 5. LEAD WALLET
CREATE TABLE IF NOT EXISTS lead_wallet (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  balance       INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contractor_id)
);

CREATE TABLE IF NOT EXISTS lead_credit_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  amount        INTEGER NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('purchase', 'spend', 'refund', 'bonus')),
  description   TEXT NOT NULL DEFAULT '',
  stripe_payment_id TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ledger_contractor ON lead_credit_transactions(contractor_id, created_at DESC);

CREATE TABLE IF NOT EXISTS lead_pricing (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category    TEXT NOT NULL UNIQUE,
  credits     INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. WEBHOOKS
CREATE TABLE IF NOT EXISTS webhooks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  secret        TEXT NOT NULL DEFAULT '',
  events        TEXT[] NOT NULL DEFAULT '{}',
  active        BOOLEAN NOT NULL DEFAULT true,
  last_sent_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_webhooks_contractor ON webhooks(contractor_id);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id    UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event         TEXT NOT NULL,
  status        TEXT NOT NULL,
  request_body  TEXT NOT NULL DEFAULT '',
  response_body TEXT NOT NULL DEFAULT '',
  response_code INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_wh ON webhook_logs(webhook_id, created_at DESC);

-- 7. DRIP CAMPAIGNS (email automation)
CREATE TABLE IF NOT EXISTS drip_campaigns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  trigger_event TEXT NOT NULL,
  delay_minutes INTEGER NOT NULL DEFAULT 0,
  subject     TEXT NOT NULL,
  template    TEXT NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drip_actions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID NOT NULL REFERENCES drip_campaigns(id) ON DELETE CASCADE,
  recipient     TEXT NOT NULL,
  job_id        UUID REFERENCES jobs(id) ON DELETE SET NULL,
  contractor_id UUID REFERENCES contractors(id) ON DELETE SET NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at       TIMESTAMPTZ,
  error         TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_drip_actions_send ON drip_actions(scheduled_for, sent_at) WHERE sent_at IS NULL;

-- 8. CONTRACTOR BRANDING (multi-tenant portal)
CREATE TABLE IF NOT EXISTS contractor_branding (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id   UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE UNIQUE,
  logo_url        TEXT NOT NULL DEFAULT '',
  primary_color   TEXT NOT NULL DEFAULT '#c87d5d',
  welcome_message TEXT NOT NULL DEFAULT '',
  domain          TEXT NOT NULL DEFAULT '',
  active          BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. SMS LOG
CREATE TABLE IF NOT EXISTS sms_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_phone      TEXT NOT NULL,
  message       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  provider_id   TEXT NOT NULL DEFAULT '',
  error         TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sms_log_phone ON sms_log(to_phone, created_at DESC);
