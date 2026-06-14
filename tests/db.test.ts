import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockClient, mockPoolInstance } = vi.hoisted(() => {
  const client = { query: vi.fn(), release: vi.fn() };
  const pool = {
    connect: vi.fn().mockResolvedValue(client),
    on: vi.fn(),
  };
  return { mockClient: client, mockPoolInstance: pool };
});

vi.mock("pg", () => ({
  Pool: vi.fn(
    class {
      constructor() {
        return mockPoolInstance;
      }
    }
  ),
}));

const { query, transaction } = await import("../src/lib/db");

beforeEach(() => {
  vi.clearAllMocks();
  mockClient.query.mockReset();
  mockClient.release.mockReset();
  mockPoolInstance.connect.mockReset().mockResolvedValue(mockClient);
});

describe("db.query", () => {
  it("acquires a client, runs SQL, returns rows, releases client", async () => {
    mockClient.query.mockResolvedValue({ rows: [{ id: 1, name: "test" }] });

    const result = await query("SELECT * FROM clients");

    expect(mockPoolInstance.connect).toHaveBeenCalledOnce();
    expect(mockClient.query).toHaveBeenCalledWith("SELECT * FROM clients", undefined);
    expect(result).toEqual([{ id: 1, name: "test" }]);
    expect(mockClient.release).toHaveBeenCalledOnce();
  });

  it("passes params to the query", async () => {
    mockClient.query.mockResolvedValue({ rows: [] });

    await query("SELECT $1", ["hello"]);

    expect(mockClient.query).toHaveBeenCalledWith("SELECT $1", ["hello"]);
  });

  it("releases client even when query throws", async () => {
    mockClient.query.mockRejectedValue(new Error("db error"));

    await expect(query("SELECT 1")).rejects.toThrow("db error");
    expect(mockClient.release).toHaveBeenCalledOnce();
  });

  it("returns empty array when no rows", async () => {
    mockClient.query.mockResolvedValue({ rows: [] });

    const result = await query("SELECT * FROM empty");

    expect(result).toEqual([]);
  });
});

describe("db.transaction", () => {
  beforeEach(() => {
    mockClient.query.mockReset();
    mockClient.release.mockReset();
    mockPoolInstance.connect.mockReset().mockResolvedValue(mockClient);
  });

  it("commits on success and returns the result", async () => {
    mockClient.query.mockResolvedValue({ rows: [] });

    const result = await transaction(async (q) => {
      await q("INSERT INTO jobs (title) VALUES ($1)", ["test"]);
      return "done";
    });

    expect(mockClient.query).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(mockClient.query).toHaveBeenNthCalledWith(
      2,
      "INSERT INTO jobs (title) VALUES ($1)",
      ["test"]
    );
    expect(mockClient.query).toHaveBeenNthCalledWith(3, "COMMIT");
    expect(result).toBe("done");
    expect(mockClient.release).toHaveBeenCalledOnce();
  });

  it("rolls back on error and does not commit", async () => {
    mockClient.query.mockResolvedValue({ rows: [] });

    await expect(
      transaction(async (q) => {
        await q("INSERT INTO jobs (title) VALUES ($1)", ["test"]);
        throw new Error("nope");
      })
    ).rejects.toThrow("nope");

    expect(mockClient.query).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(mockClient.query).toHaveBeenNthCalledWith(3, "ROLLBACK");
    expect(mockClient.query).not.toHaveBeenCalledWith("COMMIT");
    expect(mockClient.release).toHaveBeenCalledOnce();
  });

  it("releases client when begin fails", async () => {
    mockPoolInstance.connect.mockResolvedValue(mockClient);
    mockClient.query.mockRejectedValueOnce(new Error("begin failed"));

    await expect(transaction(async () => {})).rejects.toThrow("begin failed");
    expect(mockClient.release).toHaveBeenCalledOnce();
  });
});
