export async function register() {
  if (!process.env.DATABASE_URL || process.env.NODE_ENV === "test") return;

  try {
    const { runMigrations } = await import("./lib/db");
    await runMigrations();
    console.log("[instrumentation] DB migrations complete");
  } catch (e) {
    console.error("[instrumentation] DB migration failed, will retry on first query:", e);
  }
}
