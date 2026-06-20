import { Pool, QueryResultRow } from "pg";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("[db] Unexpected pool error:", err);
});

let initPromise: Promise<void> | null = null;

async function ensureInit(): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  if (!initPromise) {
    initPromise = runMigrations();
  }
  return initPromise;
}

async function queryWithTimeout(promise: Promise<unknown>, ms: number): Promise<void> {
  const timer = new Promise<void>((_, reject) =>
    setTimeout(() => reject(new Error("Query timed out")), ms)
  );
  promise.then(() => {}, () => {});
  await Promise.race([promise, timer]);
}

async function runMigrations(): Promise<void> {
  for (let i = 0; i < 30; i++) {
    try {
      await queryWithTimeout(pool.query("SELECT 1"), 5000);
      break;
    } catch {
      if (i === 29) throw new Error("Database not reachable after 30 seconds");
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  const possibleDirs = [
    path.join(process.cwd(), "src", "db", "migrations"),
    path.join(process.cwd(), "db", "migrations"),
  ];
  const migrationsDir = possibleDirs.find((d) => fs.existsSync(d));

  if (migrationsDir) {
    await pool.query(
      "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, run_at TIMESTAMPTZ DEFAULT now())"
    );

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    const { rows: ran } = await pool.query("SELECT name FROM _migrations");
    const ranSet = new Set(ran.map((r: { name: string }) => r.name));

    for (const file of files) {
      if (ranSet.has(file)) continue;
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      await pool.query(sql);
      await pool.query("INSERT INTO _migrations (name) VALUES ($1)", [file]);
    }
  }

  const hasDrip = await pool.query("SELECT id FROM drip_campaigns LIMIT 1");
  if (hasDrip.rows.length === 0 && process.env.NODE_ENV !== "test") {
    try {
      const { seedDripCampaigns } = await import("./seed-campaigns");
      await seedDripCampaigns();
    } catch (e) {
      console.error("[db] Failed to seed drip campaigns:", e);
    }
  }

  const { rows: admins } = await pool.query("SELECT id FROM admin LIMIT 1");
  if (admins.length === 0) {
    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD || "P@55word";
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    await pool.query(
      "INSERT INTO admin (username, password_hash) VALUES ($1, $2)",
      [username, salt + ":" + hash]
    );
  }
}

export async function healthCheck(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    const client = await pool.connect();
    try {
      await client.query("SELECT 1");
      return true;
    } finally {
      client.release();
    }
  } catch {
    return false;
  }
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  await ensureInit();
  const client = await pool.connect();
  try {
    const res = await client.query<T>(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}

export async function transaction<T>(
  fn: (q: typeof query) => Promise<T>
): Promise<T> {
  await ensureInit();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const txQuery = async <U extends QueryResultRow = QueryResultRow>(
      text: string,
      params?: unknown[]
    ): Promise<U[]> => {
      const res = await client.query<U>(text, params);
      return res.rows;
    };
    const result = await fn(txQuery as typeof query);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
