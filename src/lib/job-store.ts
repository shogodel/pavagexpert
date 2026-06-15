import fs from "fs";
import path from "path";

export type JobStatus = "new" | "in_progress" | "completed";

export interface Job {
  id: string;
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  budget: string;
  description: string;
  status: JobStatus;
  createdAt: string;
  photos: string[];
}

export function getPhotoPath(jobId: string, filename: string): string {
  return path.join(dataDir, "photos", jobId, filename);
}

export function ensureJobPhotoDir(jobId: string): string {
  const dir = path.join(dataDir, "photos", jobId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "jobs.json");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function readJobs(): Job[] {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function writeJobs(jobs: Job[]) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(jobs, null, 2), "utf-8");
}

export function getJobs(): Job[] {
  return readJobs().reverse();
}

export function addJob(job: Omit<Job, "id" | "createdAt" | "status" | "photos"> & { photos?: string[] }): Job {
  const jobs = readJobs();
  const newJob: Job = {
    ...job,
    id: crypto.randomUUID(),
    photos: job.photos || [],
    status: "new",
    createdAt: new Date().toISOString(),
  };
  jobs.push(newJob);
  writeJobs(jobs);
  return newJob;
}
