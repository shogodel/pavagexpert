CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ip_address TEXT NOT NULL DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS browser_fingerprint TEXT NOT NULL DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS flag_reason TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_jobs_ip_address ON jobs(ip_address);
CREATE INDEX IF NOT EXISTS idx_jobs_verified ON jobs(verified);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

CREATE INDEX IF NOT EXISTS idx_jobs_description_trgm ON jobs USING gin (description gin_trgm_ops);

ALTER TABLE clients ADD COLUMN IF NOT EXISTS address_prefix TEXT NOT NULL DEFAULT '';
