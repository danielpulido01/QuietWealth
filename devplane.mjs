#!/usr/bin/env node
/**
 * QuietWealth Development Plane CLI
 * Usage:
 *   node devplane.mjs /feature "Implement customer self-service password reset"
 *   node devplane.mjs /build-feature <feature-id>
 *   node devplane.mjs /validate-feature <feature-id>
 *   node devplane.mjs /release-feature <feature-id>
 *   node devplane.mjs /features
 */

const BASE_URL = process.env.DEVPLANE_URL || "http://localhost:4000";

const COMMANDS = {
  "/feature": featureCommand,
  "/build-feature": buildCommand,
  "/validate-feature": validateCommand,
  "/release-feature": releaseCommand,
  "/features": listCommand,
  "--help": helpCommand,
};

async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  return res.json();
}

function box(title, content) {
  const width = 60;
  const line = "─".repeat(width);
  console.log(`\n┌${line}┐`);
  console.log(`│  ${title.padEnd(width - 2)} │`);
  console.log(`├${line}┤`);
  const lines = content.split("\n");
  for (const l of lines) {
    const chunks = l.match(/.{1,56}/g) || [""];
    for (const c of chunks) {
      console.log(`│  ${c.padEnd(width - 2)} │`);
    }
  }
  console.log(`└${line}┘\n`);
}

async function featureCommand(args) {
  const description = args.join(" ").replace(/^["']|["']$/g, "");
  if (!description) {
    console.error('Usage: /feature "Feature description"');
    process.exit(1);
  }

  console.log(`\n Generating specifications for: "${description}"`);
  console.log("   This may take 30-60 seconds...\n");

  const result = await post("/feature", { description });

  if (result.error) {
    console.error(" Error:", result.error);
    process.exit(1);
  }

  console.log(` Feature created: ${result.featureId}`);
  console.log("\n Spec files generated:");
  for (const [domain, info] of Object.entries(result.specs || {})) {
    console.log(`   ${domain.padEnd(15)} → ${info.filePath}`);
  }

  box(
    "Next Step",
    `Run:\n  /build-feature ${result.featureId}\n\nOr use the web UI at http://localhost:4000`
  );

  return result;
}

async function buildCommand(args) {
  const featureId = args[0];
  if (!featureId) {
    console.error("Usage: /build-feature <feature-id>");
    process.exit(1);
  }

  console.log(`\n🔨 Building implementation for: ${featureId}`);
  console.log("   Delegating to Frontend, Backend, Data agents...\n");

  const result = await post("/build-feature", { featureId });

  if (result.error) {
    console.error("Error:", result.error);
    process.exit(1);
  }

  console.log("Implementation generated:");
  for (const [domain, files] of Object.entries(result.implementation || {})) {
    const count = Object.keys(files).length;
    console.log(`   ${domain.padEnd(15)} → ${count} file(s)`);
  }

  box("Next Step", `Run:\n  /validate-feature ${featureId}`);
  return result;
}

async function validateCommand(args) {
  const featureId = args[0];
  if (!featureId) {
    console.error("Usage: /validate-feature <feature-id>");
    process.exit(1);
  }

  console.log(`\nValidating feature: ${featureId}`);
  console.log("   Running validation and generating tests...\n");

  const result = await post("/validate-feature", { featureId });

  if (result.error) {
    console.error("Error:", result.error);
    process.exit(1);
  }

  const v = result.validation;
  console.log(`${result.passed ? "ok" : "not ok"} Validation ${result.passed ? "PASSED" : "FAILED"}`);
  console.log(`   Score: ${v?.score || "N/A"}/100`);
  console.log(`   Summary: ${v?.summary || ""}`);

  if (v?.checks) {
    console.log("\n   Checks:");
    for (const [check, detail] of Object.entries(v.checks)) {
      console.log(`   ${detail.passed ? "✓" : "✗"} ${check}: ${detail.notes || ""}`);
    }
  }

  const testCount = Object.keys(result.tests?.files || {}).length;
  console.log(`\n   Tests generated: ${testCount} file(s)`);

  if (result.passed) {
    box("Next Step", `Run:\n  /release-feature ${featureId}`);
  } else {
    box("Action Required", `Validation failed.\nFeedback: ${v?.feedback || ""}\n\nRe-run after fixes:\n  /validate-feature ${featureId}`);
  }

  return result;
}

async function releaseCommand(args) {
  const featureId = args[0];
  if (!featureId) {
    console.error("Usage: /release-feature <feature-id>");
    process.exit(1);
  }

  console.log(`\n Releasing feature: ${featureId}`);
  console.log("   Running quality gates, CI, creating branch and PR...\n");

  const result = await post("/release-feature", { featureId });

  if (result.error) {
    console.error("Error:", result.error);
    process.exit(1);
  }

  if (result.success) {
    const r = result.release;
    console.log("Feature released successfully!\n");
    console.log(`   Branch:       ${r.branchName}`);
    console.log(`   PR URL:       ${r.prUrl}`);
    console.log(`   Impl files:   ${r.implementationFiles}`);
    console.log(`   Test files:   ${r.testFiles}`);

    console.log("\n   Quality Gates:");
    for (const gate of result.gates || []) {
      console.log(`   ${gate.passed ? "✓" : "✗"} ${gate.name} – ${gate.detail}`);
    }

    box("Done!", `PR is ready for review:\n${r.prUrl}\n\nMerge when approved!`);
  } else {
    console.log("Release failed – quality gates blocked:");
    for (const gate of result.gates?.filter((g) => !g.passed) || []) {
      console.log(`   ✗ ${gate.name}: ${gate.detail}`);
    }
  }

  return result;
}

async function listCommand() {
  const result = await get("/features");
  const features = result.features || [];

  if (!features.length) {
    console.log("\nNo features yet. Run /feature to create one.\n");
    return;
  }

  console.log(`\n${"ID".padEnd(50)} ${"STATUS".padEnd(20)} DESCRIPTION`);
  console.log("─".repeat(100));
  for (const f of features) {
    console.log(
      `${f.featureId.padEnd(50)} ${(f.status || "").padEnd(20)} ${(f.description || "").substring(0, 40)}`
    );
  }
  console.log();
}

function helpCommand() {
  console.log(`
QuietWealth Development Plane Control – CLI

USAGE:
  node devplane.mjs <command> [args]

COMMANDS:
  /feature "description"         Generate specifications for a new feature
  /build-feature <id>            Generate code implementation from specs  
  /validate-feature <id>         Validate implementation + generate tests
  /release-feature <id>          Run CI gates + create Git branch + PR
  /features                      List all features and their status
  --help                         Show this help

ENVIRONMENT:
  DEVPLANE_URL    Orchestrator URL (default: http://localhost:4000)
  ANTHROPIC_API_KEY  Required for AI operations (set in .env)
  GITHUB_TOKEN    Required for PR creation

WEB UI:
  Open http://localhost:4000 in your browser for an interactive interface.

EXAMPLE:
  node devplane.mjs /feature "Implement customer self-service password reset"
  node devplane.mjs /build-feature implement-customer-self-service-pass-a1b2c3d4
  node devplane.mjs /validate-feature implement-customer-self-service-pass-a1b2c3d4
  node devplane.mjs /release-feature implement-customer-self-service-pass-a1b2c3d4
`);
}

// ── Main 

const [, , command, ...args] = process.argv;

if (!command || !COMMANDS[command]) {
  console.error(`Unknown command: ${command || "(none)"}\nRun --help for usage.`);
  process.exit(1);
}

COMMANDS[command](args).catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
