import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const appRoot = path.join(repoRoot, "app");

const stagedFiles = getStagedFiles();
const appFiles = stagedFiles.filter((file) => file.startsWith("app/"));

if (appFiles.length === 0) {
  process.exit(0);
}

const prettierFiles = appFiles
  .filter((file) => isPrettierFile(file))
  .map((file) => toAppRelative(file));
const eslintFiles = appFiles
  .filter((file) => isEslintFile(file))
  .map((file) => toAppRelative(file));

if (prettierFiles.length > 0) {
  runNodeScript(
    path.join(appRoot, "node_modules", "prettier", "bin", "prettier.cjs"),
    ["--write", ...prettierFiles],
    appRoot,
  );

  run("git", ["add", "--", ...prettierFiles.map((file) => `app/${file}`)], repoRoot);
}

if (eslintFiles.length > 0) {
  runNodeScript(
    path.join(appRoot, "node_modules", "eslint", "bin", "eslint.js"),
    eslintFiles,
    appRoot,
  );
}

function getStagedFiles() {
  const result = run("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"], repoRoot, {
    captureOutput: true,
  });

  return result.stdout
    .split("\0")
    .map((file) => file.trim())
    .filter(Boolean);
}

function isPrettierFile(file) {
  return /\.(cjs|css|cts|html|js|json|jsx|md|mts|mjs|scss|ts|tsx|yaml|yml)$/i.test(file);
}

function isEslintFile(file) {
  return /\.(js|jsx|ts|tsx)$/i.test(file);
}

function toAppRelative(file) {
  return file.slice("app/".length);
}

function runNodeScript(scriptPath, args, cwd) {
  if (!existsSync(scriptPath)) {
    console.error(`Missing script dependency: ${scriptPath}`);
    process.exit(1);
  }

  run(process.execPath, [scriptPath, ...args], cwd);
}

function run(command, args, cwd, options = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: options.captureOutput ? "pipe" : "inherit",
  });

  if (result.status !== 0) {
    if (options.captureOutput) {
      if (result.stdout) {
        process.stdout.write(result.stdout);
      }

      if (result.stderr) {
        process.stderr.write(result.stderr);
      }
    }

    process.exit(result.status ?? 1);
  }

  return result;
}
