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
  const deployComposePath = path.join(
    __dirname,
    "..",
    "docker-compose.pavagexpert.yaml"
  );

  it("exists", () => {
    expect(fs.existsSync(composePath)).toBe(true);
  });

  it("deploy copy exists and matches template", () => {
    expect(fs.existsSync(deployComposePath)).toBe(true);
    expect(fs.readFileSync(deployComposePath, "utf-8")).toBe(
      fs.readFileSync(composePath, "utf-8")
    );
  });

  const content = fs.readFileSync(composePath, "utf-8");

  it("has pavagexpert service with depends_on and fixed project name", () => {
    expect(content).toContain("pavagexpert:");
    expect(content).toContain("depends_on:");
    expect(content).toContain("- pavagexpert-db");
    expect(content).toContain("name: pavagexpert");
  });

  it("has pavagexpert-db service", () => {
    expect(content).toContain("pavagexpert-db:");
    expect(content).toContain("image: postgres:16-alpine");
  });

  it("has DATABASE_URL referencing pavagexpert-db", () => {
    expect(content).toContain("@pavagexpert-db:5432/pavagexpert");
  });

  it("has dedicated pavagexpert_pg_data volume with external: true", () => {
    expect(content).toContain("pavagexpert_pg_data:");
    expect(content).toContain("external: true");
    expect(content).not.toMatch(/^\s{2}pg_data:$/m);
  });

  it("has healthcheck with 60s start_period and 10 retries", () => {
    expect(content).toContain("pg_isready -U pavagexpert");
    expect(content).toContain("start_period: 60s");
    expect(content).toContain("retries: 10");
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

  it("cleans up pavagexpert entries from shared compose file", () => {
    expect(content).toContain("/^  pavagexpert(-db)?:/");
  });

  it("removes stale pavagexpert containers", () => {
    expect(content).toContain("docker rm -f pavagexpert");
    expect(content).toContain("docker rm -f pavagexpert-pavexpert-1");
  });

  it("copies compose file via scp-action", () => {
    expect(content).toContain("appleboy/scp-action@v1");
    expect(content).toContain("docker-compose.pavagexpert.yaml");
    expect(content).toContain("target: ~/apps/");
  });

  it("uses compose file via -f flag", () => {
    expect(content).toContain("-f docker-compose.pavagexpert.yaml");
  });

  it("creates dedicated pavagexpert_pg_data (not shared pg_data)", () => {
    expect(content).toContain("pavagexpert_pg_data");
    expect(content).not.toContain("volume inspect pg_data");
  });

  it("starts pavagexpert-db before pavagexpert", () => {
    expect(content).toContain(
      "docker compose -f docker-compose.pavagexpert.yaml up -d pavagexpert-db"
    );
    expect(content).toContain(
      "docker compose -f docker-compose.pavagexpert.yaml up -d pavagexpert --force-recreate"
    );
  });
});
