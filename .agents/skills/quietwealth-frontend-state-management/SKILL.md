---
name: quietwealth-frontend-state-management
description: Guide QuietWealth frontend state management with Redux Toolkit, Axios, Zod, and Auth0-aware flows. Use when building screens, slices, async thunks, form validation, upload progress, or document-processing status tracking in `app/src`.
---

# QuietWealth Frontend State Management

## Overview

Implement shared frontend state with predictable async behavior, schema validation, and auth-safe transport boundaries. Keep components thin and push workflow orchestration into slices, thunks, selectors, and shared HTTP utilities.

Open these areas first before introducing a new pattern:

- `app/src/state/`
- `app/src/services/`
- `app/src/auth/`
- `app/src/data-validation/`

## Workflow

1. Decide whether the state is:
   - local UI state
   - shared workflow state
   - auth/session state
   - long-running document-processing state
2. Use Redux Toolkit for cross-screen or workflow state. Avoid adding new ad hoc global context for features that need retries, polling, progress, or error recovery.
3. Define Zod schemas for:
   - form input before submit
   - request payload normalization
   - API response parsing before data enters Redux state
4. Create a slice with explicit serializable state for data, status, error, and last-known workflow metadata.
5. Use `createAsyncThunk` for server calls, polling, and status refresh. Keep component code limited to dispatching actions and rendering selectors.
6. Route HTTP calls through a shared Axios client and interceptors so bearer tokens, correlation headers, and 401 handling stay centralized.
7. For document-processing flows, model the state transitions explicitly and support re-fetch, retry, and resume behavior after page reload when the backend is the source of truth.

## Rules

- Prefer `createSlice`, `createAsyncThunk`, and selectors over handwritten reducer boilerplate.
- Model async lifecycle uniformly with `idle`, `loading`, `success`, and `error`. Add extra substates only when the workflow truly needs them.
- Keep Redux state serializable. Do not store raw `File`, `Error`, `AbortController`, token, or SDK client instances in the store.
- Validate both user input and backend responses with Zod before committing data to shared state.
- Never store access tokens or refresh tokens in `localStorage`, `sessionStorage`, or Redux state.
- Obtain auth context from Auth0-managed session boundaries and inject bearer tokens through Axios interceptors instead of per-component request code.
- Handle 401 responses centrally. Components should react to normalized auth state, not duplicate token-expiry logic.
- Keep one transport strategy per feature. If the target area still uses older shared HTTP helpers, consolidate behind a common seam instead of mixing raw fetch and Axios calls across the same workflow.
- Expose selectors for view consumption so components do not depend on raw slice structure.
- For document status polling, make re-dispatch safe and idempotent. Avoid duplicate progress records or runaway polling loops.

## Required Output

When this skill is used, document:

- `Hallazgos y Correcciones sugeridas`
- `Correcciones aplicadas`

Call out:

- state shape decisions
- validation points
- auth/token handling
- async lifecycle behavior

## Close-Out Checklist

- Confirm whether the feature truly needs global state before adding a new slice.
- Confirm every request/response boundary has a Zod schema or an explicit reason not to.
- Confirm 401 and error handling pass through shared interceptors or shared auth services.
- Confirm loading/error/success rendering matches the slice status contract.
- Confirm document-processing thunks can recover from refresh, retry, or duplicate delivery.
