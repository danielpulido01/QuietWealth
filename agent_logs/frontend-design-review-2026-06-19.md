# Frontend Design Review - 2026-06-19

## Scope

Review of the current MVP frontend implementation in `app/src/main.tsx`, `app/src/InvestmentForm.tsx`, and `app/src/mvp.css`, with alignment against the repo strategy documented in `README.md`:

- Atomic design component hierarchy
- Design tokens centralized in `app/src/components/styles`
- All user-facing copy extracted to the i18n layer

## Hallazgos y Correcciones sugeridas

1. The current frontend bypasses the declared component architecture.
   - `main.tsx` contains multiple screens, navigation, API orchestration, and presentation in one file.
   - Suggested correction: split the experience into `pages`, `templates`, `molecules`, and `atoms`.

2. The current frontend bypasses shared styling strategy.
   - `mvp.css` is a monolithic stylesheet with hard-coded values and repeated overrides.
   - Suggested correction: move the active experience styling into `app/src/components/styles` and consume theme CSS variables derived from `tokens.ts`.

3. The current frontend bypasses the i18n strategy.
   - User-facing strings are hard-coded in `main.tsx` and `InvestmentForm.tsx`.
   - Suggested correction: extract all UI copy into `app/src/components/i18n/en.json` and `es.json`.

4. Navigation semantics are weak.
   - Navigation is driven by `location.hash` mutations and buttons that behave like links.
   - Suggested correction: use router-backed links and route-aware navigation states.

5. Accessibility issues exist in the main task flows.
   - Filter controls are unlabeled.
   - The review modal lacks dialog semantics and focus management.
   - Terms and privacy are rendered as non-functional anchors.
   - Focus treatment is inconsistent because native outlines are removed without a complete replacement.
   - Suggested correction: introduce labeled form controls, route-aware links, dialog semantics, and visible focus styles.

6. Visual direction is inconsistent.
   - The app combines multiple visual systems and override layers.
   - Suggested correction: converge on one token-driven enterprise fintech language centered on certification trust and operational clarity.

## Planned implementation

1. Create a repo-local review log before refactoring.
2. Replace the monolithic entrypoint with page components under atomic design folders.
3. Add a small reusable atom/molecule base for buttons, inputs, selects, cards, badges, and modal behavior.
4. Move active experience styles under `app/src/components/styles`.
5. Extract all UI copy into the i18n JSON files.
6. Preserve local MVP behavior while improving semantics and structure.

## Correcciones aplicadas

1. Replaced the monolithic `main.tsx` screen implementation with:
   - `app/src/components/pages/*`
   - `app/src/components/molecules/*`
   - `app/src/components/atoms/*`
   - `app/src/components/templates/AppShell.tsx`
   - `app/src/routes/AppRouter.tsx`

2. Replaced the active MVP styling approach:
   - Removed `app/src/mvp.css`
   - Added `app/src/components/styles/experience.css`
   - Updated `app/src/components/styles/tokens.ts` so the live experience consumes the repo token system

3. Extracted active UI copy into the i18n layer:
   - Expanded `app/src/components/i18n/en.json`
   - Expanded `app/src/components/i18n/es.json`
   - Reworked `config.ts` and `I18nProvider.tsx` so the app uses the shared translation setup consistently

4. Introduced a shared local MVP service boundary:
   - Added `app/src/models/local-mvp.ts`
   - Added `app/src/services/localMvpService.ts`
   - Added hooks for marketplace, detail, validation queue, and demo session orchestration

5. Improved semantics and accessibility in the active flows:
   - Router-backed navigation replaces button-only hash mutations
   - Filter controls and form controls now have labels
   - Terms and privacy now route to dedicated pages
   - Validation review modal now exposes dialog semantics and escape-to-close behavior
   - Focus-visible treatment is explicit and shared
   - Reduced-motion handling is defined in the active stylesheet

6. Removed unused legacy implementation files that conflicted with the target architecture:
   - `app/src/InvestmentForm.tsx`
   - `app/src/mvp.css`

## State shape decisions

- No Redux slice was added because the MVP role/session state and screen data remain local UI concerns in the current implementation.
- Demo session state lives in `useDemoSession` with:
  - `role`
  - `isAuthenticating`
  - `isLoggingOut`
  - `error`
- Marketplace, SME detail, and validation queue data each use focused hooks with local `isLoading` and `error` states.

## Validation points

- API read models are validated with Zod in `app/src/models/local-mvp.ts`.
- API responses enter the UI through `sourceJsonWithSchema(...)` in `localMvpService.ts`.
- Document upload payloads are validated with `uploadDocumentPayloadSchema` before POST submission.
- Investment request state remains local-only because the flow is simulated and does not persist to the backend.

## Auth/token handling

- The refactor does not introduce token storage.
- The local MVP client uses the shared HTTP facade with `credentials: "include"`.
- Login/logout remain explicit service calls through `localMvpService`.
- No access token, refresh token, or SDK client instance is stored in component state or browser storage.

## Async lifecycle behavior

- `useDemoSession`, `useMarketplace`, `useSmeDetail`, and `useValidationRequests` expose explicit loading and error states.
- The upload flow disables submission while requests are in flight and reports completion through an `aria-live` message.
- Validation actions refresh queue state after approve/reject completion.

## Verification

- `npm run build` executed successfully in `app/` on 2026-06-19.
