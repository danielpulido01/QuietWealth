/**
 * QuietWealth Development Plane Control – Orchestrator
 * =====================================================
 * Entry point that exposes the four developer commands:
 *   POST /feature         → triggers Specification Agent
 *   POST /build-feature   → triggers Code Generation Agents
 *   POST /validate-feature→ triggers Validation + QA Agent
 *   POST /release-feature → triggers Release Agent
 *
 * Also exposes a web UI on GET / for interactive use.
 */

import express from "express";
import { v4 as uuidv4 } from "uuid";
import { saveFeature, loadFeature, listFeatures, appendLog } from "./shared/featureStore.js";

const app = express();
app.use(express.json());
app.use(express.text({ type: "text/plain" }));

const PORT = process.env.PORT || 4000;
const SPEC_ENGINE   = process.env.SPEC_ENGINE_URL   || "http://spec-engine:4001";
const BUILD_ENGINE  = process.env.BUILD_ENGINE_URL  || "http://build-engine:4002";
const VALIDATE_ENGINE = process.env.VALIDATE_ENGINE_URL || "http://validate-engine:4003";
const RELEASE_ENGINE = process.env.RELEASE_ENGINE_URL || "http://release-engine:4004";

// ── Helpers ──────────────────────────────────────────────────

async function callEngine(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Engine ${url} returned ${res.status}: ${text}`);
  }
  return res.json();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 60);
}

// ── Health ───────────────────────────────────────────────────

app.get("/health", (_, res) => res.json({ status: "ok", service: "orchestrator" }));

// ── Web UI ───────────────────────────────────────────────────

app.get("/", (_, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(UI_HTML);
});

// ── /feature ─────────────────────────────────────────────────
// Command: /feature "description"
// Calls the Spec Engine to generate all domain specs.

app.post("/feature", async (req, res) => {
  try {
    const description =
      req.body?.description ||
      (typeof req.body === "string" ? req.body : null);

    if (!description) {
      return res.status(400).json({ error: "Missing feature description" });
    }

    const featureId = slugify(description) + "-" + uuidv4().split("-")[0];
    await saveFeature(featureId, {
      description,
      status: "specifying",
      createdAt: new Date().toISOString(),
    });

    await appendLog(featureId, "ORCHESTRATOR", `Feature request received: "${description}"`);
    console.log(`[/feature] Delegating to spec-engine for feature ${featureId}`);

    // Delegate to spec engine
    const result = await callEngine(`${SPEC_ENGINE}/generate-spec`, {
      featureId,
      description,
    });

    await saveFeature(featureId, { status: "spec-complete", specs: result.specs });
    await appendLog(featureId, "ORCHESTRATOR", "Spec generation complete");

    res.json({
      featureId,
      message: "✅ Specifications generated successfully",
      specs: result.specs,
      nextCommand: `/build-feature ${featureId}`,
    });
  } catch (err) {
    console.error("[/feature] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── /build-feature ────────────────────────────────────────────
// Command: /build-feature <feature-id>

app.post("/build-feature", async (req, res) => {
  try {
    const { featureId } = req.body;
    if (!featureId) return res.status(400).json({ error: "Missing featureId" });

    const feature = await loadFeature(featureId);
    if (!feature) return res.status(404).json({ error: "Feature not found" });

    await saveFeature(featureId, { status: "building" });
    await appendLog(featureId, "ORCHESTRATOR", "Delegating to build-engine");

    const result = await callEngine(`${BUILD_ENGINE}/build`, {
      featureId,
      description: feature.description,
      specs: feature.specs,
    });

    await saveFeature(featureId, {
      status: "build-complete",
      implementation: result.implementation,
    });

    await appendLog(featureId, "ORCHESTRATOR", "Build complete");

    res.json({
      featureId,
      message: "✅ Feature implementation generated",
      implementation: result.implementation,
      nextCommand: `/validate-feature ${featureId}`,
    });
  } catch (err) {
    console.error("[/build-feature] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── /validate-feature ─────────────────────────────────────────
// Command: /validate-feature <feature-id>

app.post("/validate-feature", async (req, res) => {
  try {
    const { featureId } = req.body;
    if (!featureId) return res.status(400).json({ error: "Missing featureId" });

    const feature = await loadFeature(featureId);
    if (!feature) return res.status(404).json({ error: "Feature not found" });

    await saveFeature(featureId, { status: "validating" });
    await appendLog(featureId, "ORCHESTRATOR", "Delegating to validate-engine");

    const result = await callEngine(`${VALIDATE_ENGINE}/validate`, {
      featureId,
      description: feature.description,
      specs: feature.specs,
      implementation: feature.implementation,
    });

    await saveFeature(featureId, {
      status: result.passed ? "validation-passed" : "validation-failed",
      validation: result.validation,
      tests: result.tests,
    });

    await appendLog(
      featureId,
      "ORCHESTRATOR",
      result.passed ? "Validation PASSED" : "Validation FAILED – feedback sent to build agent"
    );

    if (!result.passed) {
      // Auto-retry build with feedback
      await appendLog(featureId, "ORCHESTRATOR", "Auto-retrying build with validation feedback");
      const retry = await callEngine(`${BUILD_ENGINE}/build`, {
        featureId,
        description: feature.description,
        specs: feature.specs,
        validationFeedback: result.feedback,
      });
      await saveFeature(featureId, {
        status: "validation-retried",
        implementation: retry.implementation,
      });
    }

    res.json({
      featureId,
      passed: result.passed,
      message: result.passed
        ? "✅ Validation passed – tests generated"
        : "⚠️  Validation failed – implementation updated with feedback",
      validation: result.validation,
      tests: result.tests,
      nextCommand: result.passed ? `/release-feature ${featureId}` : `/validate-feature ${featureId}`,
    });
  } catch (err) {
    console.error("[/validate-feature] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── /release-feature ──────────────────────────────────────────
// Command: /release-feature <feature-id>

app.post("/release-feature", async (req, res) => {
  try {
    const { featureId } = req.body;
    if (!featureId) return res.status(400).json({ error: "Missing featureId" });

    const feature = await loadFeature(featureId);
    if (!feature) return res.status(404).json({ error: "Feature not found" });

    if (!["validation-passed", "validation-retried"].includes(feature.status)) {
      return res.status(400).json({
        error: "Feature must pass validation before release. Run /validate-feature first.",
      });
    }

    await saveFeature(featureId, { status: "releasing" });
    await appendLog(featureId, "ORCHESTRATOR", "Delegating to release-engine");

    const result = await callEngine(`${RELEASE_ENGINE}/release`, {
      featureId,
      description: feature.description,
      specs: feature.specs,
      implementation: feature.implementation,
      tests: feature.tests,
      validation: feature.validation,
    });

    await saveFeature(featureId, {
      status: result.success ? "released" : "release-failed",
      release: result.release,
    });

    await appendLog(
      featureId,
      "ORCHESTRATOR",
      result.success ? `PR created: ${result.release?.prUrl}` : "Release failed"
    );

    res.json({
      featureId,
      success: result.success,
      message: result.success
        ? `🚀 Feature released – PR ready for review`
        : "❌ Release failed – check quality gates",
      release: result.release,
    });
  } catch (err) {
    console.error("[/release-feature] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── /features (list) ──────────────────────────────────────────

app.get("/features", async (_, res) => {
  const features = await listFeatures().catch(() => []);
  res.json({ features });
});

// ── /features/:id (detail) ────────────────────────────────────

app.get("/features/:id", async (req, res) => {
  const feature = await loadFeature(req.params.id).catch(() => null);
  if (!feature) return res.status(404).json({ error: "Feature not found" });
  res.json(feature);
});

// ── Web UI HTML ───────────────────────────────────────────────

const UI_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>QuietWealth – Development Plane Control</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
  header { background: linear-gradient(135deg,#1e3a5f,#0f172a); padding: 1.5rem 2rem; border-bottom: 1px solid #1e40af; }
  header h1 { font-size: 1.5rem; font-weight: 700; color: #60a5fa; }
  header p { font-size: .85rem; color: #94a3b8; margin-top: .25rem; }
  .layout { display: grid; grid-template-columns: 320px 1fr; gap: 1.5rem; padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
  .card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 1.25rem; }
  .card h2 { font-size: .9rem; text-transform: uppercase; letter-spacing: .08em; color: #60a5fa; margin-bottom: 1rem; }
  .btn { display: inline-block; padding: .55rem 1.1rem; border-radius: 6px; font-size: .85rem; font-weight: 600; cursor: pointer; border: none; transition: opacity .15s; }
  .btn:hover { opacity: .85; }
  .btn-blue { background: #2563eb; color: #fff; }
  .btn-green { background: #16a34a; color: #fff; }
  .btn-yellow { background: #d97706; color: #fff; }
  .btn-purple { background: #7c3aed; color: #fff; }
  .btn-sm { padding: .35rem .75rem; font-size: .78rem; }
  input, textarea { width: 100%; background: #0f172a; border: 1px solid #475569; color: #e2e8f0; border-radius: 6px; padding: .6rem .8rem; font-size: .85rem; }
  input:focus, textarea:focus { outline: none; border-color: #3b82f6; }
  label { display: block; font-size: .78rem; color: #94a3b8; margin-bottom: .35rem; }
  .step { display: flex; flex-direction: column; gap: .75rem; margin-bottom: 1rem; }
  .output { background: #0f172a; border: 1px solid #1e3a5f; border-radius: 6px; padding: 1rem; font-family: monospace; font-size: .78rem; max-height: 380px; overflow-y: auto; white-space: pre-wrap; color: #a5f3fc; }
  .status-badge { display: inline-block; padding: .2rem .6rem; border-radius: 20px; font-size: .73rem; font-weight: 700; text-transform: uppercase; }
  .status-specifying { background: #1e3a5f; color: #60a5fa; }
  .status-building { background: #1c1917; color: #f59e0b; }
  .status-validating { background: #14532d; color: #4ade80; }
  .status-released { background: #0f172a; color: #a78bfa; }
  .feature-row { display: flex; align-items: center; gap: .5rem; padding: .6rem; border-bottom: 1px solid #1e293b; font-size: .82rem; }
  .feature-row:last-child { border: none; }
  .pipeline { display: flex; gap: 0; margin: 1rem 0; }
  .pipe-step { flex: 1; text-align: center; padding: .5rem .25rem; font-size: .72rem; background: #1e293b; border-right: 1px solid #334155; }
  .pipe-step:last-child { border: none; border-radius: 0 6px 6px 0; }
  .pipe-step:first-child { border-radius: 6px 0 0 6px; }
  .pipe-step.active { background: #1e3a5f; color: #60a5fa; }
  .pipe-step.done { background: #14532d; color: #4ade80; }
  .tag { font-size: .7rem; background: #1e3a5f; color: #93c5fd; padding: .1rem .4rem; border-radius: 4px; }
</style>
</head>
<body>
<header>
  <h1>⚡ QuietWealth – Development Plane Control</h1>
  <p>AI-powered Spec Driven Development environment · Powered by Claude</p>
</header>
<div class="layout">
  <div style="display:flex;flex-direction:column;gap:1rem;">

    <!-- Step 1: Feature -->
    <div class="card">
      <h2>① /feature</h2>
      <div class="step">
        <div>
          <label>Feature Description</label>
          <textarea id="feat-desc" rows="3" placeholder='e.g. "Implement customer self-service password reset"'></textarea>
        </div>
        <button class="btn btn-blue" onclick="runFeature()">Generate Specs →</button>
        <div id="feat-id-display" style="font-size:.75rem;color:#64748b;min-height:1.2rem;"></div>
      </div>
    </div>

    <!-- Step 2: Build -->
    <div class="card">
      <h2>② /build-feature</h2>
      <div class="step">
        <div>
          <label>Feature ID</label>
          <input id="build-id" placeholder="Paste feature-id from Step 1"/>
        </div>
        <button class="btn btn-green" onclick="runBuild()">Generate Implementation →</button>
      </div>
    </div>

    <!-- Step 3: Validate -->
    <div class="card">
      <h2>③ /validate-feature</h2>
      <div class="step">
        <div>
          <label>Feature ID</label>
          <input id="validate-id" placeholder="Feature ID"/>
        </div>
        <button class="btn btn-yellow" onclick="runValidate()">Validate + Generate Tests →</button>
      </div>
    </div>

    <!-- Step 4: Release -->
    <div class="card">
      <h2>④ /release-feature</h2>
      <div class="step">
        <div>
          <label>Feature ID</label>
          <input id="release-id" placeholder="Feature ID"/>
        </div>
        <button class="btn btn-purple" onclick="runRelease()">Run Tests + Create PR →</button>
      </div>
    </div>

  </div>

  <div style="display:flex;flex-direction:column;gap:1rem;">
    <!-- Output panel -->
    <div class="card" style="flex:1;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem;">
        <h2 style="margin:0">Output</h2>
        <button class="btn btn-sm" style="background:#334155;color:#e2e8f0;" onclick="document.getElementById('output').textContent=''">Clear</button>
      </div>
      <div class="pipeline" id="pipeline">
        <div class="pipe-step" id="p1">Spec</div>
        <div class="pipe-step" id="p2">Build</div>
        <div class="pipe-step" id="p3">Validate</div>
        <div class="pipe-step" id="p4">Release</div>
      </div>
      <div class="output" id="output">Ready. Submit a feature request to start.\n</div>
    </div>

    <!-- Feature list -->
    <div class="card" style="max-height:260px;overflow-y:auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem;">
        <h2 style="margin:0">Features</h2>
        <button class="btn btn-sm" style="background:#334155;color:#e2e8f0;" onclick="loadFeatures()">Refresh</button>
      </div>
      <div id="feature-list"><span style="color:#64748b;font-size:.8rem;">Loading…</span></div>
    </div>
  </div>
</div>

<script>
const out = document.getElementById('output');
const log = (msg) => { out.textContent += msg + '\\n'; out.scrollTop = out.scrollHeight; };
const setPipe = (step, state) => {
  const el = document.getElementById('p'+step);
  el.className = 'pipe-step ' + state;
};

let currentId = null;

async function api(path, body) {
  log('\\n→ ' + path + (body ? ' ' + JSON.stringify(body) : ''));
  const r = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json();
  log(JSON.stringify(data, null, 2));
  return data;
}

async function runFeature() {
  const desc = document.getElementById('feat-desc').value.trim();
  if (!desc) return alert('Enter a feature description');
  setPipe(1,'active'); setPipe(2,''); setPipe(3,''); setPipe(4,'');
  const data = await api('/feature', { description: desc });
  if (data.featureId) {
    currentId = data.featureId;
    document.getElementById('feat-id-display').textContent = 'Feature ID: ' + currentId;
    ['build-id','validate-id','release-id'].forEach(id => document.getElementById(id).value = currentId);
    setPipe(1,'done');
    loadFeatures();
  }
}

async function runBuild() {
  const id = document.getElementById('build-id').value.trim();
  if (!id) return alert('Enter a Feature ID');
  setPipe(2,'active');
  await api('/build-feature', { featureId: id });
  setPipe(2,'done');
  loadFeatures();
}

async function runValidate() {
  const id = document.getElementById('validate-id').value.trim();
  if (!id) return alert('Enter a Feature ID');
  setPipe(3,'active');
  const data = await api('/validate-feature', { featureId: id });
  setPipe(3, data.passed ? 'done' : 'active');
  loadFeatures();
}

async function runRelease() {
  const id = document.getElementById('release-id').value.trim();
  if (!id) return alert('Enter a Feature ID');
  setPipe(4,'active');
  const data = await api('/release-feature', { featureId: id });
  setPipe(4, data.success ? 'done' : 'active');
  loadFeatures();
}

async function loadFeatures() {
  const data = await fetch('/features').then(r=>r.json()).catch(()=>({features:[]}));
  const el = document.getElementById('feature-list');
  if (!data.features.length) { el.innerHTML = '<span style="color:#64748b;font-size:.8rem;">No features yet.</span>'; return; }
  el.innerHTML = data.features.map(f =>
    \`<div class="feature-row">
      <span class="status-badge status-\${f.status||'specifying'}">\${f.status||'?'}</span>
      <span style="flex:1;font-size:.8rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">\${f.description||f.featureId}</span>
      <span class="tag">\${f.featureId?.split('-').slice(-1)[0]||''}</span>
    </div>\`
  ).join('');
}

loadFeatures();
setInterval(loadFeatures, 10000);
</script>
</body>
</html>`;

// ── Start ────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║  QuietWealth Development Plane Control            ║
║  Orchestrator running on port ${PORT}              ║
╠═══════════════════════════════════════════════════╣
║  Web UI  →  http://localhost:${PORT}              ║
║  /feature           → Generate specifications     ║
║  /build-feature     → Generate implementation     ║
║  /validate-feature  → Validate + create tests     ║
║  /release-feature   → Run CI + open PR            ║
╚═══════════════════════════════════════════════════╝
  `);
});
