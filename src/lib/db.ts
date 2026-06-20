import { Pool, QueryResultRow } from "pg";

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
    initPromise = ensureDbReady();
  }
  try {
    await initPromise;
  } catch (e) {
    initPromise = null;
    throw e;
  }
}

async function queryWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timer = new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error("Query timed out")), ms)
  );
  promise.then(() => {}, () => {});
  return Promise.race([promise, timer]);
}

async function ensureDbReady(): Promise<void> {
  const probePool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    connectionTimeoutMillis: 5000,
  });
  try {
    for (let i = 0; i < 30; i++) {
      try {
        await queryWithTimeout(probePool.query("SELECT 1"), 5000);
        break;
      } catch {
        if (i === 29) throw new Error("Database not reachable after 30 seconds");
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  } finally {
    probePool.end().catch(() => {});
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
  const client = await queryWithTimeout(pool.connect(), 10000);
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
  const client = await queryWithTimeout(pool.connect(), 10000);
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
