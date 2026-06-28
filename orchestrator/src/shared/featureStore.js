/**
 * Shared Feature Store
 * Persists feature state to /workspace/specs so all containers can read it.
 */
import fs from "fs/promises";
import path from "path";

const SPECS_DIR = process.env.PROJECT_CONTEXT
  ? `${process.env.PROJECT_CONTEXT}/specs`
  : "/workspace/specs";

const LOGS_DIR = process.env.PROJECT_CONTEXT
  ? `${process.env.PROJECT_CONTEXT}/agent_logs`
  : "/workspace/agent_logs";

export async function ensureDirs() {
  for (const dir of [SPECS_DIR, LOGS_DIR]) {
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function saveFeature(featureId, data) {
  await ensureDirs();
  const file = path.join(SPECS_DIR, `${featureId}.json`);
  const existing = await loadFeature(featureId).catch(() => ({}));
  const merged = { ...existing, ...data, featureId, updatedAt: new Date().toISOString() };
  await fs.writeFile(file, JSON.stringify(merged, null, 2));
  return merged;
}

export async function loadFeature(featureId) {
  const file = path.join(SPECS_DIR, `${featureId}.json`);
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw);
}

export async function listFeatures() {
  await ensureDirs();
  const files = await fs.readdir(SPECS_DIR);
  const features = [];
  for (const f of files.filter((f) => f.endsWith(".json"))) {
    const data = JSON.parse(await fs.readFile(path.join(SPECS_DIR, f), "utf8"));
    features.push(data);
  }
  return features;
}

export async function saveSpecFile(featureId, domain, content) {
  const dir = path.join(SPECS_DIR, featureId, domain);
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, "spec.md");
  await fs.writeFile(file, content);
  return file;
}

export async function loadSpecFile(featureId, domain) {
  const file = path.join(SPECS_DIR, featureId, domain, "spec.md");
  return fs.readFile(file, "utf8").catch(() => null);
}

export async function appendLog(featureId, step, message) {
  await ensureDirs();
  const file = path.join(LOGS_DIR, `${featureId}.log`);
  const line = `[${new Date().toISOString()}] [${step}] ${message}\n`;
  await fs.appendFile(file, line);
}

export const DOMAINS = ["frontend", "backend", "data", "observability", "testing", "cicd"];
