import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function waitForDb(pool, retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (e) {
      if (i < retries - 1) {
        console.log(`[migrate] waiting for db (${i + 1}/${retries})...`);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }
  throw new Error("Database not reachable after 30 seconds");
}

async function migrate() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    connectionTimeoutMillis: 5000,
  });

  await waitForDb(pool);

  // Create migrations tracking table
  await pool.query(
    "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, run_at TIMESTAMPTZ DEFAULT now())"
  );

  // Read migration files
  const migrationsDir = path.join(__dirname, "migrations");
  if (!fs.existsSync(migrationsDir)) {
    console.log("[migrate] no migrations directory found, skipping");
    await pool.end();
    return;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const { rows: ran } = await pool.query("SELECT name FROM _migrations");
  const ranSet = new Set(ran.map((r) => r.name));

  for (const file of files) {
    if (ranSet.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    await pool.query(sql);
    await pool.query("INSERT INTO _migrations (name) VALUES ($1)", [file]);
    console.log(`[migrate] ran ${file}`);
  }

  // Seed admin from env if admin table is empty
  const { rows: admins } = await pool.query("SELECT id FROM admin LIMIT 1");
  if (admins.length === 0) {
    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD || "admin";
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    await pool.query(
      "INSERT INTO admin (username, password_hash) VALUES ($1, $2)",
      [username, salt + ":" + hash]
    );
    console.log(`[migrate] seeded admin user "${username}"`);
  }

  await pool.end();
  console.log("[migrate] done");
}

migrate().catch((e) => {
  console.error("[migrate] failed:", e);
  process.exit(1);
});
