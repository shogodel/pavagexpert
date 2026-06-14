import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Dockerfile", () => {
  const dockerfilePath = path.join(__dirname, "..", "Dockerfile");

  it("exists", () => {
    expect(fs.existsSync(dockerfilePath)).toBe(true);
  });

  const content = fs.readFileSync(dockerfilePath, "utf-8");

  it("copies migrate.mjs into the image", () => {
    expect(content).toContain("COPY src/db/migrate.mjs ./db/migrate.mjs");
  });

  it("copies migrations directory into the image", () => {
    expect(content).toContain("COPY src/db/migrations/ ./db/migrations/");
  });

  it("copies entrypoint.sh", () => {
    expect(content).toContain("COPY --chmod=755 entrypoint.sh ./");
  });

  it("uses entrypoint.sh as CMD", () => {
    expect(content).toContain('CMD ["./entrypoint.sh"]');
  });
});

describe("docker-compose.yml", () => {
  const composePath = path.join(__dirname, "..", "docker-compose.yml");

  it("exists", () => {
    expect(fs.existsSync(composePath)).toBe(true);
  });

  const content = fs.readFileSync(composePath, "utf-8");

  it("has pavagexpert service with depends_on", () => {
    expect(content).toContain("pavagexpert:");
    expect(content).toContain("depends_on:");
    expect(content).toContain("pavagexpert-db:");
  });

  it("has pavagexpert-db service", () => {
    expect(content).toContain("pavagexpert-db:");
    expect(content).toContain("image: postgres:16-alpine");
  });

  it("has DATABASE_URL referencing pavagexpert-db", () => {
    expect(content).toContain("@pavagexpert-db:5432/pavagexpert");
  });

  it("has pg_data volume", () => {
    expect(content).toContain("pg_data:");
  });

  it("has healthcheck on db service", () => {
    expect(content).toContain("pg_isready -U pavagexpert");
  });
});

describe("deploy.yml", () => {
  const deployPath = path.join(
    __dirname,
    "..",
    ".github",
    "workflows",
    "deploy.yml"
  );

  it("exists", () => {
    expect(fs.existsSync(deployPath)).toBe(true);
  });

  const content = fs.readFileSync(deployPath, "utf-8");

  it("preserves DB_PASSWORD across deploys", () => {
    expect(content).toContain("OLD_DB_PASS");
    expect(content).toContain("grep DB_PASSWORD .env");
  });

  it("writes DB_PASSWORD to .env", () => {
    expect(content).toContain("DB_PASSWORD=");
  });

  it("creates pg_data volume via docker compose", () => {
    expect(content).toContain("pg_data");
  });

  it("starts both pavagexpert and db services", () => {
    expect(content).toContain(
      "docker compose up -d pavagexpert pavagexpert-db --force-recreate"
    );
  });
});
