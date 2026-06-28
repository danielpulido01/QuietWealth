/**
 * Generic Agent Server
 * Routes requests to the correct agent handler based on SERVICE_NAME env var.
 */

import express from "express";
import { specEngine } from "./agents/specEngine.js";
import { buildEngine } from "./agents/buildEngine.js";
import { validateEngine } from "./agents/validateEngine.js";
import { releaseEngine } from "./agents/releaseEngine.js";

const app = express();
app.use(express.json());

const PORT = process.env.SERVICE_PORT || 4001;
const SERVICE_NAME = process.env.SERVICE_NAME || "agent";

const ENGINES = {
  "spec-engine": specEngine,
  "build-engine": buildEngine,
  "validate-engine": validateEngine,
  "release-engine": releaseEngine,
};

const engine = ENGINES[SERVICE_NAME];
if (!engine) {
  console.error(`Unknown SERVICE_NAME: ${SERVICE_NAME}`);
  process.exit(1);
}

app.get("/health", (_, res) =>
  res.json({ status: "ok", service: SERVICE_NAME })
);

// Mount all routes from the engine
engine(app);

app.listen(PORT, () => {
  console.log(`[${SERVICE_NAME}] Listening on port ${PORT}`);
});
