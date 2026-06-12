import fs from "fs";
import path from "path";

export type JobStatus = "new" | "in_progress" | "completed";

export interface Job {
  id: string;
  name: string;
  postalCode: string;
  phone: string;
  description: string;
  status: JobStatus;
  createdAt: string;
}

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "jobs.json");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function readJobs(): Job[] {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeJobs(jobs: Job[]) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(jobs, null, 2), "utf-8");
}

export function getJobs(): Job[] {
  return readJobs().reverse();
}

export function addJob(job: Omit<Job, "id" | "createdAt" | "status">): Job {
  const jobs = readJobs();
  const newJob: Job = {
    ...job,
    id: crypto.randomUUID(),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  jobs.push(newJob);
  writeJobs(jobs);
  return newJob;
}
