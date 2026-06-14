import { describe, it, expect, beforeAll } from "vitest";
import fs from "fs";
import path from "path";

describe("001_create_tables.sql", () => {
  const sqlPath = path.join(
    __dirname,
    "..",
    "src",
    "db",
    "migrations",
    "001_create_tables.sql"
  );
  let sql: string;

  beforeAll(() => {
    sql = fs.readFileSync(sqlPath, "utf-8");
  });

  it("exists and is non-empty", () => {
    expect(fs.existsSync(sqlPath)).toBe(true);
    expect(sql.length).toBeGreaterThan(100);
  });

  it("enables pgcrypto extension", () => {
    expect(sql).toContain("CREATE EXTENSION IF NOT EXISTS pgcrypto");
  });

  it("defines all 12 tables with IF NOT EXISTS", () => {
    const tables = [
      "clients",
      "jobs",
      "job_photos",
      "contractors",
      "sessions",
      "claims",
      "quotes",
      "invoices",
      "push_subscriptions",
      "notifications",
      "admin",
      "email_tokens",
    ];
    for (const t of tables) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${t}`);
    }
  });

  it("has required columns on clients", () => {
    expect(sql).toContain("id UUID PRIMARY KEY");
    expect(sql).toContain("name TEXT NOT NULL");
    expect(sql).toContain("email TEXT NOT NULL");
    expect(sql).toContain("created_at TIMESTAMPTZ");
  });

  it("has required columns on jobs", () => {
    expect(sql).toContain(
      "client_id UUID NOT NULL REFERENCES clients(id)"
    );
    expect(sql).toContain("token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE");
    expect(sql).toContain("status TEXT NOT NULL DEFAULT 'draft'");
    expect(sql).toContain("updated_at TIMESTAMPTZ NOT NULL DEFAULT now()");
  });

  it("has required columns on contractors", () => {
    expect(sql).toContain("email TEXT NOT NULL UNIQUE");
    expect(sql).toContain("password_hash TEXT NOT NULL DEFAULT ''");
    expect(sql).toContain("status TEXT NOT NULL DEFAULT 'applied'");
    expect(sql).toContain("rbq_license TEXT NOT NULL DEFAULT ''");
  });

  it("has required columns on admin", () => {
    expect(sql).toContain("username TEXT NOT NULL UNIQUE DEFAULT 'admin'");
    expect(sql).toContain("password_hash TEXT NOT NULL");
  });

  it("defines all expected indexes", () => {
    const indexes = [
      "idx_clients_email",
      "idx_jobs_status",
      "idx_jobs_token",
      "idx_sessions_token",
      "idx_notifications_contractor",
      "idx_email_tokens_token",
    ];
    for (const idx of indexes) {
      expect(sql).toContain(idx);
    }
  });

  it("invoices has status CHECK constraint", () => {
    expect(sql).toContain("CHECK (status IN ('pending','paid'))");
  });

  it("push_subscriptions has UNIQUE constraint", () => {
    expect(sql).toContain("UNIQUE(contractor_id, endpoint)");
  });

  it("notifications uses ON DELETE SET NULL for job_id", () => {
    expect(sql).toContain("REFERENCES jobs(id) ON DELETE SET NULL");
  });

  it("email_tokens has expires_at with 7 day interval", () => {
    expect(sql).toContain("now() + interval '7 days'");
  });
});

describe("migrate.mjs", () => {
  const migratePath = path.join(__dirname, "..", "src", "db", "migrate.mjs");

  it("exists", () => {
    expect(fs.existsSync(migratePath)).toBe(true);
  });

  it("references _migrations tracking table", () => {
    const content = fs.readFileSync(migratePath, "utf-8");
    expect(content).toContain("_migrations");
  });

  it("seeds admin from environment variables", () => {
    const content = fs.readFileSync(migratePath, "utf-8");
    expect(content).toContain("INSERT INTO admin");
    expect(content).toContain("ADMIN_USERNAME");
    expect(content).toContain("ADMIN_PASSWORD");
  });

  it("waits for database with retry logic", () => {
    const content = fs.readFileSync(migratePath, "utf-8");
    expect(content).toContain("waitForDb");
    expect(content).toContain("retries");
  });

  it("uses scrypt for password hashing", () => {
    const content = fs.readFileSync(migratePath, "utf-8");
    expect(content).toContain("scryptSync");
  });
});

describe("entrypoint.sh", () => {
  const entrypointPath = path.join(__dirname, "..", "entrypoint.sh");

  it("exists", () => {
    expect(fs.existsSync(entrypointPath)).toBe(true);
  });

  it("runs migration before server start", () => {
    const content = fs.readFileSync(entrypointPath, "utf-8");
    expect(content).toContain("node /app/db/migrate.mjs");
  });

  it("starts server with su-exec", () => {
    const content = fs.readFileSync(entrypointPath, "utf-8");
    expect(content).toContain("su-exec nextjs:nodejs node server.js");
  });
});
