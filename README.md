# QuietWealth

## Problem Statement
SMEs face slow, bureaucratic processes to certify their financial health, delaying capital access and investment. QuietWealth provides an expedited financial trust record by integrating document validation, risk analysis, and standardized financial conditions into a single certified report oriented to investors, establishing a low-risk certified investment ecosystem based on real revenue streams.

# 1. Frontend Design

## 1.1 Technology Stack
| Technology | Version | Justification |
|---|---|---|
| **Application Type** | SSR Web App | Server-side rendering enables auth-gated pages to be rendered on the server, reducing layout shift and preventing flash of unauthorized content for sensitive financial data |
| **React.js** | `19.2` | Industry-standard UI library with mature ecosystem; concurrent rendering features (`Suspense`, `React.lazy`) are essential for the document upload and long-running compilation flows |
| **Next.js** | `15` | Provides SSR, file-system routing, and built-in image optimization out of the box; integrates natively with Azure App Service Node.js runtime |
| **Node.js** | `22` | LTS release; required by Next.js 15 SSR runtime on Azure App Service |
| **TypeScript** | `5.9.3` | Static typing catches contract mismatches between API responses and UI state at compile time; essential for a data-intensive financial domain |
| **TailwindCSS** | `4.1` | Utility-first approach maps directly to the design token model; JIT compiler eliminates dead CSS in production with zero configuration |
| **Redux Toolkit** | `2.8` | Manages async thunks for document processing status tracking across page navigations; DevTools enable observability of state transitions during development |
| **Jest** | `30.2.0` | De-facto standard for React unit testing; compatible with TypeScript via `ts-jest`; supports coverage thresholds enforced in CI |
| **Zod** | `4.3.6` | Runtime schema validation for all API responses and form inputs; catches backend contract drift before data reaches Redux state |
| **Prettier** | `3.8.1` | Enforces uniform formatting across the team; integrated with Husky pre-commit hooks to block non-conforming commits |
| **ESLint** | `10.0.2` | Static analysis with custom rules that ban `dangerouslySetInnerHTML`, token storage in `localStorage`, and direct `console.log` calls |
| **Playwright** | `1.52` | Cross-browser E2E and integration testing; supports Chromium and Firefox; first-class `msw` integration for mocking backend responses |
| **Axios** | `1.9` | Provides interceptor support used by `AuthMiddleware` to attach Bearer tokens and handle 401 refresh centrally; cleaner API than native `fetch` for multipart document uploads |
| **Auth0 React SDK** | `2.2` | Manages OAuth 2.0 Authorization Code + PKCE flow and silent token refresh without custom implementation; Microsoft Entra ID is federated through Auth0 |
| **Husky** | `9.1.7` | Runs `lint-staged` on pre-commit; blocks commits that fail ESLint, Prettier, or TypeScript checks |
| **Cloud Service** | Azure | Consistent with the backend infrastructure; reduces operational complexity and cross-cloud latency |
| **Azure App Service** | — | Supports Node.js SSR runtimes natively; provides deployment slots (`staging → production`) enabling zero-downtime releases with instant rollback |
| **Code Repository** | GitHub | Enables GitHub Actions CI/CD with OIDC-based Azure deployment, avoiding long-lived credentials |
| **CI/CD** | GitHub Actions | OIDC token exchange with Azure App Service; branch-based environment promotion with manual approval for production |
| **Azure Application Insights SDK** | — | Unified telemetry for frontend and backend; correlates traces across browser, SSR layer, and backend API using a single `correlationId` |

---

## 1.2 UX/UI Analysis

## 1.2.1 Core Business Process

### Login
1. The user accesses the QuietWealth platform and is presented with the authentication screen.
2. The system redirects the user to the Microsoft authentication provider via Auth0.
3. The user enters their corporate Microsoft credentials.
4. If authentication fails, the system displays an error message and prompts the user to retry.
5. If authentication succeeds, a user session is created and the user is redirected to the Marketplace.


---

### Browse the Investment Marketplace
1. The user lands on the Marketplace screen, which displays a list of certified SMEs available for investment.
2. The user can search for a specific company using the search bar.
3. The user can filter results by sector (e.g., Technology, Energy, Commerce) or by trust level.
4. Each SME card displays key information: certification status, growth percentage, total raised capital, and number of active investors.
5. The user selects a company by clicking "Ver Detalles" to view the full investment profile.


---

### Upload Financial Documents
1. The user navigates to the "Cargar Documentos" section from the sidebar.
2. The system displays the document upload portal with a progress tracker showing the current stage: Información Cargada → En Revisión por Expertos → Certificación Emitida.
3. The user drags and drops files into the upload area or clicks "Seleccionar Archivos" to browse.
4. The system accepts PDF, DOC, XLS, and image formats up to 10 MB per file.
5. Once uploaded, the documents enter the expert review queue automatically.


---

### Expert Validation Panel
1. A financial expert accesses the "Panel de Validación" section from the sidebar.
2. The system displays a list of pending SME certification requests with ID, company name, sector, submission date, and status.
3. The expert selects a pending request by clicking "Revisar".
4. The expert reviews the uploaded documents and financial information.
5. The expert issues a certification decision, which updates the SME's trust status on the platform.


---

### View Investment Detail
1. From the Marketplace, the user clicks "Ver Detalles" on a specific SME card.
2. The system navigates to the Investment Detail screen, showing key financial metrics: Total Raised, Active Investors, Growth Rate, and Average ROI.
3. The user can scroll down to view detailed charts: Income Growth, Investor Growth, and Accumulated Capital Over Time.
4. The screen also displays a company description and key business metrics such as retention rate, MRR, and profit margin.
5. The user can click "Invertir Ahora" to initiate the investment flow.


---

### Logout
1. The user ends their session through the logout option.
2. The system invalidates the active JWT token.
3. The session is terminated and the user is redirected to the Login screen.


---

## 1.2.2 Wireframes

### Login Screen
Microsoft-authenticated entry point to the platform.

![Login](Media/login.png)

### Marketplace Screen
Lists certified SMEs with key financial metrics and trust indicators for investors to browse and compare.

![Markectplace](Media/marketPlace.png)

### Document Upload Screen
Allows SMEs to submit financial documents for expert review and certification.

![UploadaDocument](Media/loadDocuments.png)

### Expert Validation Panel Screen
Enables financial experts to review and certify pending SME applications.

![validation](Media/validacion.png)

### Investment Detail Screen
Shows verified SME financial metrics, growth charts, and expert certifications to support investor decision-making.

![DetalleInversion01](Media/DetalleInv01.png)
![DetalleInversion02](Media/DetalleInv02.png)
![DetalleInversion03](Media/DetalleInv03.png)

### 1.2.3 Testing results
A usability test was conducted using Maze. Tests were shared remotely via URL.

**Test Objective:** Evaluate user ability to understand the information provided in the Investment Detail Screen. Also, check the overall user navigation along the platform.

#### Participant Results

| Participant | Duration | OS | Browser | Opinion Scale (1–5) | Open Feedback |
|---|---|---|---|---|---|
| 542521286 | 49 s | Windows | Chrome | 4 | "Considero que la información mostrada es clara." |
| 510669335 | 42 s | Windows | Chrome | 5 | "Esta bien" |
| 543901432 | 17.8 s | Windows | Brave | 4 | "all good" |
| 508804036 | 70.1 s | Windows | Edge | 5 | "." |
| 542802936 | 99.5 s | Windows | Edge | 5 | "Anuncios de invierta ahora no deberían de aparecer en la aplicación como tal, solo en una web." |
| 537502878 | 50.1 s | Linux | Firefox | 5 | "Muy detallada y presentable, no mejoraría nada." |
| **Average** | **54.8 s** | — | — | **4.7 / 5** | — |

---

### Heatmaps

**Investment Detail Screen**
![Dinv-HeatMap01](Media/heatmap1.png)
![Dinv-HeatMap02](Media/heatmap2.png)
![Dinv-HeatMap03](Media/heatmap3.png)

### Usability Issues Detected
 
| # | Screen | Issue | Severity |
|---|--------|-------|----------|
| 1 | Investment Detail | The "Invertir Ahora" CTA feels too prominent within the platform; one participant noted it is more appropriate for an external web page. | Medium |
 
---
### Corrections Applied
 
| # | Issue | Correction | Decision Criteria |
|---|-------|------------|-------------------|
| 1 | "Invertir Ahora" CTA felt intrusive inside the platform | Reduced visual weight of the CTA within the Investment Detail screen | Keeps the platform focused on trust and information rather than aggressive selling |

![newBanner](Media/DetalleInv_bannerCambiado.png)

---

## 1.3 Component Design Strategy
### 1.3.1 Strategy
The frontend follows **Atomic Design** for component architecture.
### 1.3.2 Component Hierarchy
```
app/
 ├ components/
 │   ├ atoms/
 │   ├ molecules/
 │   ├ organisms/
 │   ├ templates/
 │   ├ pages/
 │   ├ hooks/
 │   ├ i18n/
 │   └ styles/
```

### 1.3.3 Component Categories

#### [Atoms](app/components/atoms)
Reusable low-level UI components with no business logic.

- Must be pure UI — only accept props.
- No API calls, no business logic.
- Must support design tokens.

```
Button · Input · Badge · Spinner · ProgressBar
TrustIndicator · Label · Card · Toast · Modal · StatCard
```

Example:
```tsx
<Button variant="primary" size="md" loading>
  Submit Documents
</Button>
```

#### [Molecules](app/components/molecules)
Built from atoms. Handle UI logic; no direct API calls.

```
DocumentUploader · FormField · StatusBadge · InfoBanner · SMECard · FilterBar
```

Example:
```
SMECard
 ├ TrustIndicator (certification status)
 ├ StatCard (growth %, capital raised)
 └ Button ("Ver Detalles")
```

#### [Organisms](app/components/organisms)
Larger layout sections. No business logic — responsible only for composition.

```
MarketplaceGrid · InvestmentDetailPanel · ValidationQueue
DocumentUploadZone · Navbar · Sidebar · PageContainer
```

#### [Pages](app/components/pages)
Feature-specific components tied to a business process. Coordinate business logic through hooks. Mounted by Next.js App Router.

```
LoginPage.tsx
MarketplacePage.tsx
DocumentUploadPage.tsx
ExpertValidationPage.tsx
InvestmentDetailPage.tsx
```

### 1.3.4 Component Reuse Strategy
Before creating a new component, developers must:
1. Search in [Atoms](app/components/atoms).
2. Search in [Molecules](app/components/molecules).

If a similar component exists, extend it via props, variants, or composition — never duplicate.

```tsx
<TrustIndicator level="certified" />
<TrustIndicator level="pending" />
<TrustIndicator level="rejected" />
```

### 1.3.5 [Hooks]
Components use hooks for all business logic. Hooks interact with services and state managers.

```
useAuth()
useMarketplace()
useDocumentUpload()
useExpertValidation()
useInvestmentDetail()
usePermissions()
usePolicies()
useSession()
useApplicationServices()
```

### 1.3.6 Naming conventions

| Element | Convention | Example |
|---|---|---|
| Component files | `PascalCase` | `SMECard.tsx` |
| Component folders | `PascalCase` | `SMECard/` |
| Page files | `PascalCase` + `Page` suffix | `MarketplacePage.tsx` |
| Hook files | `camelCase` prefixed with `use` | `useMarketplace.ts` |
| Service files | `PascalCase` + `Service` suffix | `TrustRecordService.ts` |
| Redux slices | `camelCase` + `Slice` suffix | `marketplaceSlice.ts` |
| Zod schemas | `camelCase` + `Schema` suffix | `documentUploadSchema.ts` |
| Type/interface files | `PascalCase` or `camelCase.types.ts` | `session.types.ts` |
| CSS module files | `camelCase.module.css` matching component | `smeCard.module.css` |
| Tailwind utilities | Token-based CSS vars only | `text-[var(--qw-navy)]` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_UPLOAD_FILE_SIZE_MB` |
| DTOs | `PascalCase` + `DTO` suffix | `TrustRecordApplicationDTO` |
| Enums | `PascalCase` values | `CertificationStatus.PENDING` |
| Test files | Mirror source path + `.test.ts(x)` or `.spec.ts` | `AuthFacade.test.ts` |
| i18n keys | `dot.separated.camelCase` | `marketplace.filter.sector` |
| Folder names (non-component) | `kebab-case` | `app/auth/` · `investment-detail/` |

### 1.3.7 Styles and Design Tokens
All visual styles are centralized in [tokens.ts](app/components/styles/tokens.ts):

```ts
export const colors = {
  primary:    "#0D1F3C",   // QW Navy — headings, navbar background
  accent:     "#1AACA8",   // QW Teal — CTA buttons, active states
  gold:       "#C8972B",   // QW Gold — trust score highlights, certified badges
  background: "#F5F7FA",   // Off-white page background
  surface:    "#FFFFFF",   // Card and modal surfaces
  slate:      "#4A5568",   // Body text, secondary labels
  success:    "#22C55E",   // Certified, low-risk
  warning:    "#F59E0B",   // Pending review, medium-risk
  error:      "#EF4444",   // Rejected, high-risk, validation errors
};

export const spacing = { sm: "8px", md: "16px", lg: "24px", xl: "48px" };
export const radius  = { sm: "4px", md: "8px",  lg: "12px" };
```

Theme in [theme.ts](app/components/styles/theme.ts):

```ts
export const theme = {
  colors,
  spacing,
  radius,
  typography: {
    fontFamily:  "Inter, sans-serif",
    monoFamily:  "JetBrains Mono, monospace",  // financial metrics and numeric values
    headingWeight: 600,
  },
};
```

**Typography:**

| Token | Value | Usage |
|---|---|---|
| `--font-display` | `Inter, sans-serif` | Headings H1–H3 |
| `--font-body` | `Inter, sans-serif` | Body text, labels, tables |
| `--font-mono` | `JetBrains Mono, monospace` | Financial metrics, percentages, amounts |
| Base size | `16px` | Root `rem` reference |

**Logos:** SVG-only. Two variants in [app/assets/logo/](app/assets/logo/): `logo-dark.svg` (white text, for dark navbar) and `logo-light.svg` (navy text, for light surfaces). Minimum rendering width: `120px`. No rasterized PNG logos.

**Iconography:** Lucide React (`lucide-react@0.383.0`) — named imports only for tree-shaking. No icon fonts.

**Spacing:** 4-point Tailwind scale (`4px` base). Standard padding: `p-4` (16px) for cards, `p-2` (8px) for inputs, `gap-6` (24px) for grid layouts. Horizontal page padding: `px-6 md:px-12 lg:px-24`.

**Branding and visual labeling:**
- Trust certification status is always communicated through both color and a text label — never color alone (accessibility).
- Certified badges use `--qw-gold` with a checkmark icon.
- Pending uses `--qw-warning` with a clock icon.
- Rejected uses `--qw-error` with an X icon.

**Styling rules:**

Correct:
```tsx
<Button className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)]" />
```
Incorrect:
```tsx
<Button style={{ background: "#0D1F3C" }} />
```

### 1.3.8 Responsive Design
Breakpoints in [breakpoints.ts](app/components/styles/breakpoints.ts):

```ts
export const breakpoints = { mobile: 480, tablet: 768, desktop: 1200 };
```

| Device | Marketplace Layout | Investment Detail | Navigation |
|---|---|---|---|
| Mobile | Single column, stacked SME cards | Single column | Hamburger menu |
| Tablet | 2-column card grid | Side-by-side metrics + charts | Collapsed sidebar |
| Desktop | 3-column card grid | Full dual-panel | Full sidebar |

Developers must use `flex`/`grid` layouts, avoid fixed widths, and use TailwindCSS responsive utilities (`sm:`, `md:`, `lg:`).


### 1.3.9 Internationalization
All text is externalized. Components must never contain literal strings.

Incorrect:
```tsx
<h1>Marketplace</h1>
```
Correct:
```tsx
const { t } = useTranslation();
<h1>{t("marketplace.title")}</h1>
```

Translation files: [en.json](app/components/i18n/en.json) · [es.json](app/components/i18n/es.json)

### 1.3.10 Performance Guidelines
Developers must:
- Use `React.memo` for heavy display components.
- Use `lazy()` for feature page modules.
- Avoid unnecessary re-renders with `useMemo` and `useCallback`.

```tsx
// Lazy loading feature pages
const MarketplacePage     = lazy(() => import("@/components/pages/MarketplacePage"));
const InvestmentDetailPage = lazy(() => import("@/components/pages/InvestmentDetailPage"));

export function AppRoutes() {
  return (
    <Suspense fallback={<Spinner />}>
      <MarketplacePage />
    </Suspense>
  );
}
```

```tsx
// Memoization of heavy display components
export const SMECard = memo(function SMECard({ sme }: SMECardProps) {
  const formattedGrowth = useMemo(() => formatPercent(sme.growthRate), [sme.growthRate]);
  return <article>...</article>;
});
```

---

## 1.4 Security

### 1.4.1 Technologies
- Auth0 React SDK `2.2` (OAuth 2.0 Authorization Code + PKCE with Microsoft Entra ID federation)
- JWT bearer tokens for protected API requests
- Zod for client-side form and API response validation
- Axios interceptors for centralized token attachment and 401 handling

### 1.4.2 Authentication

QuietWealth delegates authentication to **Auth0** as a federated Identity Broker supporting **Microsoft Entra ID** exclusively. This keeps the identity surface minimal for a financial platform where all users are expected to have corporate Microsoft accounts.

**Auth Flow:**
1. User selects **Continue with Microsoft**.
2. Frontend redirects to Auth0 Universal Login.
3. Auth0 federates with Microsoft Entra ID.
4. Microsoft authenticates the user and returns an authorization code to Auth0.
5. Auth0 forwards the code to `AUTH0_CALLBACK_URL`.
6. Backend validates JWT and ID Token; internal session is created; user gains access.

**Identity provider:**

| Provider | Supported | Reason |
|---|---|---|
| Microsoft Entra ID | Yes | OAuth 2.0 Authorization Code + PKCE via Auth0 federation |
| Google | No | Out of scope — QuietWealth targets corporate SME users and investors with Microsoft organizational accounts |

**Auth0 Configuration Parameters:**

| Parameter | Storage |
|---|---|
| `AUTH0_DOMAIN` | Azure Key Vault (prod/qa) · `.env` (local) |
| `AUTH0_CLIENT_ID` | Azure Key Vault (prod/qa) · `.env` (local) |
| `AUTH0_CLIENT_SECRET` | Azure Key Vault (prod/qa) · `.env` (local) — backend only |
| `AUTH0_CALLBACK_URL` | Azure Key Vault (prod/qa) · `.env` (local) |
| `AUTH0_AUDIENCE` | Azure Key Vault (prod/qa) · `.env` (local) |

**MFA:** Managed by Auth0 Adaptive MFA. Supported second factors: Authenticator app (TOTP), SMS OTP, Email OTP. Enforced for all roles.

**Auth facade ([app/auth/AuthFacade.ts](app/auth/AuthFacade.ts)):**

```ts
export class AuthFacade {
  private static instance: AuthFacade | null = null;
  static getInstance(): AuthFacade { ... }
  private constructor() {}

  async login(): Promise<void> { /* redirects to Auth0 Universal Login → Microsoft */ }
  async logout(): Promise<void> { /* invalidates session locally and on Auth0 */ }
  async getAccessToken(): Promise<string> { /* getAccessTokenSilently() with auto-refresh */ }
  getSession(): UserSessionDTO | null { /* returns current in-memory session */ }
}
export const authFacade = AuthFacade.getInstance();
```

**Profile adapter** normalizes Microsoft Entra ID claims (forwarded by Auth0) into `UserSessionDTO`:

```ts
// app/auth/adapters/MicrosoftProfileAdapter.ts
export class MicrosoftProfileAdapter {
  adapt(rawClaims: MicrosoftClaims): UserSessionDTO {
    return {
      userId:      rawClaims.oid,
      email:       rawClaims.preferred_username,
      displayName: rawClaims.name,
      role:        this.resolveRole(rawClaims),
      accessToken: rawClaims.access_token,
      expiresAt:   rawClaims.exp,
    };
  }
}
```

**JWT contents:**

| Claim | Description |
|---|---|
| `sub` | User identifier (Auth0 user ID) |
| `email` | Corporate email from Microsoft Entra ID |
| `name` | Display name |
| `roles` | Array of platform roles (e.g., `["investor"]`) |
| `permissions` | Array of granted permission codes |
| `aud` | `AUTH0_AUDIENCE` (API identifier) |
| `iss` | Auth0 domain |
| `exp` | Expiry timestamp |
| `iat` | Issued-at timestamp |

Estimated JWT payload size: **< 2 KB**. Well below the 10 KB threshold given the minimal claim set.

**Token management:**

| Aspect | Configuration |
|---|---|
| Access token expiry | 60 minutes |
| Refresh token rotation | Enabled — each use issues a new refresh token |
| Silent refresh | `getAccessTokenSilently()` called by Auth0 SDK before expiry |
| Token storage | Access tokens in memory only (Redux); refresh token in `HttpOnly`, `Secure`, `SameSite=Strict` cookie — inaccessible to JavaScript |
| Logout | `logout({ returnTo: window.location.origin })` — clears session locally and on Auth0 |

**Session expiration:** When backend returns `401`, the Axios interceptor in [app/services/httpInterceptors.ts](app/services/httpInterceptors.ts) clears the in-memory session via `sessionManager.handleUnauthorized()` and redirects to login with a session-expired message.

**Auth latency:** Auth0 authentication with Microsoft Entra ID takes 1–5 seconds. A loading spinner is displayed immediately when the user clicks **Continue with Microsoft** and persists until the callback resolves, preventing repeated clicks and providing clear feedback.

**Auth audit queue ([app/auth/AuthAuditQueue.ts](app/auth/AuthAuditQueue.ts)):** Batches auth events (login, logout, token refresh, permission denial) and dispatches asynchronously to Application Insights to prevent auth flow delays caused by logging I/O.

### 1.4.3 Authorization

#### Roles
[app/auth/policies/roles.ts](app/auth/policies/roles.ts)

| Code | Description |
|---|---|
| `investor` | Browses the Marketplace, views investment details, initiates investment flow |
| `sme_owner` | Uploads financial documents, tracks certification status |
| `financial_analyst` | Reviews pending certification requests, issues certification decisions |
| `sys_admin` | Full system access including user management, audit logs, system configuration |

#### Permissions
[app/auth/policies/permissions.ts](app/auth/policies/permissions.ts)

| Code | Description |
|---|---|
| `auth.login` / `auth.logout` | Session start/end |
| `session.read` | Access authenticated screens |
| `marketplace.browse` | View the investment marketplace and SME listings |
| `investment.detail.view` | View full investment detail screen |
| `investment.initiate` | Click "Invertir Ahora" and enter the investment flow |
| `documents.upload` | Upload financial documents for certification |
| `documents.status.read` | Track document review and certification status |
| `validation.queue.read` | View the pending certification queue (expert panel) |
| `validation.certify` | Issue certification decisions on SME applications |
| `audit_log.read` | View audit trail |
| `users.admin` / `roles.admin` / `system.config` | `sys_admin` only |

#### Role-Permission Mapping
[app/auth/policies/rolePermissions.ts](app/auth/policies/rolePermissions.ts)

| Role | Permissions |
|---|---|
| `investor` | `auth.login`, `auth.logout`, `session.read`, `marketplace.browse`, `investment.detail.view`, `investment.initiate` |
| `sme_owner` | `auth.login`, `auth.logout`, `session.read`, `documents.upload`, `documents.status.read` |
| `financial_analyst` | `auth.login`, `auth.logout`, `session.read`, `validation.queue.read`, `validation.certify`, `audit_log.read` |
| `sys_admin` | All permissions |

#### Access Policies
[app/auth/policies/accessPolicy.ts](app/auth/policies/accessPolicy.ts)

| Policy | Required Permissions |
|---|---|
| `canBrowseMarketplace` | `marketplace.browse` |
| `canViewInvestmentDetail` | `investment.detail.view` |
| `canInitiateInvestment` | `investment.initiate` |
| `canUploadDocuments` | `documents.upload` |
| `canTrackCertification` | `documents.status.read` |
| `canAccessValidationQueue` | `validation.queue.read` |
| `canCertifySME` | `validation.certify` |
| `canReadAuditLog` | `audit_log.read` |
| `canManageSystem` | `users.admin`, `roles.admin`, `system.config` |

#### Routing Protection
[app/auth/guards/](app/auth/guards/)

**AuthGuard** — prevents unauthenticated access:
```tsx
<AuthGuard>
  <DashboardLayout><MarketplacePage /></DashboardLayout>
</AuthGuard>
```

**GuestGuard** — prevents authenticated users from accessing public routes:
```tsx
<GuestGuard><LoginPage /></GuestGuard>
```

**PolicyGuard** — blocks a route when the user lacks required permissions:
```tsx
<AuthGuard>
  <PolicyGuard required={accessPolicy.canCertifySME}>
    <ExpertValidationPage />
  </PolicyGuard>
</AuthGuard>
```

#### Usage Rules
Developers must never write:
```ts
if (user.role === "financial_analyst")  //Wrong
```
Instead:
```ts
const { hasAccess } = usePolicies();
{hasAccess("canCertifySME") && <CertifyButton />} //Correct
```

**`hasAccess`** — use when all required permissions must be held (default for all actions).

**`hasSomeAccess`** — use when a section can still render with partial access (dashboards, grouped menus).

**`getMissingPermissions`** — use in admin/debug screens or access-denied messages.

### 1.4.4 Encryption and Data Privacy

**In transit:**
- All browser-to-Azure App Service communication is enforced over **HTTPS / TLS 1.3**. HTTP requests are rejected with a `301` redirect.
- `Strict-Transport-Security` header: `max-age=31536000; includeSubDomains`.
- Auth0 token exchange exclusively over HTTPS.

**Tokens:**
- Access tokens stored **in memory only** (Redux). Never written to `localStorage`, `sessionStorage`, or any browser-persistent storage.
- Refresh tokens in an **`HttpOnly`, `Secure`, `SameSite=Strict` cookie** managed by Auth0 SDK — inaccessible to JavaScript.

**Sensitive data in the DOM:**
- Financial figures (capital amounts, ROI values) for SMEs without `CERTIFIED` status are masked until the certification is validated server-side.
- A dedicated [`MaskedValue`](app/components/atoms/MaskedValue/MaskedValue.tsx) atom handles rendering:

```tsx
export function MaskedValue({ value, visible }: { value: string; visible: boolean }) {
  return <span aria-hidden={!visible}>{visible ? value : "••••••••"}</span>;
}

// Usage in InvestmentDetailPanel
const { hasAccess } = usePolicies();
<MaskedValue value={sme.revenueAmount} visible={hasAccess("canViewInvestmentDetail")} />
```

**Secrets management:**
- Auth0 credentials sourced from **Azure Key Vault** at runtime via [app/settings/Settings.ts](app/settings/Settings.ts).
- `.env.example` documents required variable names with placeholder values; no credentials in source control.
- The `Logger` singleton strips any object key matching `/token|secret|password|key/i` before emitting to Application Insights.

**Privacy:**
- No document content is cached on the client. Uploaded file bytes are streamed directly to the backend.
- CSRF protection via the Auth0 `state` parameter, which is validated on the callback before the authorization code is exchanged.
- 
### 1.4.5 API Communication

All HTTP calls go through the centralized HTTP facade. Interceptors in [app/services/httpInterceptors.ts](app/services/httpInterceptors.ts) handle:
- Attaching `Authorization: Bearer <token>` on every protected request.
- Detecting `401` and triggering `sessionManager.handleUnauthorized()`.
- Zod schema validation on every API response before data reaches Redux state.

### 1.4.6 Storage Rules

| Storage | Allowed Use |
|---|---|
| Memory (Redux) | Active session token, marketplace data, current certification status |
| Auth0 `HttpOnly` cookie | Refresh token — managed by Auth0 SDK, inaccessible to JavaScript |
| `localStorage` | UI preferences only (theme, language) |
| `sessionStorage` | Not used |

```ts
localStorage.setItem("theme", "dark");       // Allowed
// localStorage.setItem("accessToken", t);  // Forbidden
```

### 1.4.7 Data Masking

Financial values that are sensitive or certification-gated are masked at the component level using `MaskedValue`. Full values are rendered only when:
1. The user's JWT carries the required permission scope.
2. The backend has verified the scope server-side before returning the data.

Client-side masking is a UX layer only — the real enforcement is the API returning masked or null values for unauthorized callers.

## 1.4.8 OWASP Mitigations

This section defines the concrete security responsibilities that frontend developers must follow when implementing QuietWealth features. Each mitigation includes the expected developer action, the affected frontend area, and the acceptance criteria used during review.

| OWASP Risk                      | Developer Responsibility                                                                                                                                           | Implementation Area                                                                         | Review / Acceptance Criteria                                                                                                                             |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| XSS                             | Never render untrusted HTML directly. Do not use `dangerouslySetInnerHTML`. All dynamic text must be rendered through React JSX escaping.                          | `app/components/`, `app/components/pages/`, ESLint configuration                            | Pull request is rejected if `dangerouslySetInnerHTML` appears. ESLint rule must fail the build.                                                          |
| Broken Authentication           | All login, logout, token retrieval, and token refresh logic must go through `AuthFacade`. Developers must not manually call Auth0 from pages or components.        | `app/auth/AuthFacade.ts`, `app/auth/AuthMiddleware.ts`, `app/services/httpInterceptors.ts`  | Components never access Auth0 SDK directly. API calls receive tokens only through the HTTP interceptor.                                                  |
| Token Exposure                  | Access tokens must remain in memory only. Tokens must never be stored in `localStorage`, `sessionStorage`, IndexedDB, or URL parameters.                           | `app/state/authSlice.ts`, `app/state/sessionManager.ts`, `app/services/httpInterceptors.ts` | Static analysis blocks token-related keys in browser storage. Manual review verifies no token persistence exists.                                        |
| Broken Access Control           | Protected routes must be wrapped with `AuthGuard` and `PolicyGuard`. UI actions must check permissions through `usePolicies()` instead of checking roles directly. | `app/auth/guards/`, `app/auth/policies/`, `app/components/hooks/usePolicies.ts`             | Code must not use direct checks such as `user.role === "financial_analyst"`. Permission checks must use access policies.                                 |
| Sensitive Data Exposure         | Financial values must be masked unless the authenticated user has permission to view them and the backend has already authorized the response.                     | `app/components/atoms/MaskedValue/`, `app/components/organisms/InvestmentDetailPanel/`      | Unauthorized users see masked or null values. Client-side masking is not treated as the only security control.                                           |
| Injection                       | All form inputs and API responses must be validated with Zod schemas before being used by Redux state or UI components.                                            | `app/validation/`, `app/services/`, feature hooks                                           | Invalid payloads must throw a validation error and must not update the UI state.                                                                         |
| CSRF                            | Authentication must use Auth0 Authorization Code + PKCE and the Auth0 `state` parameter. Developers must not implement custom OAuth callbacks manually.            | `app/auth/AuthFacade.ts`, Auth0 configuration                                               | Login flow must preserve PKCE and state validation. No custom unsafe callback handling is allowed.                                                       |
| Security Misconfiguration       | Environment variables and secrets must be read through the settings layer. Secrets must never be committed to the repository.                                      | `app/settings/Settings.ts`, Azure Key Vault, `.env.example`                                 | `.env.example` contains placeholders only. Real secrets are provided through Azure Key Vault or local developer configuration.                           |
| Clickjacking                    | The deployed application must reject iframe embedding.                                                                                                             | Azure App Service headers / Next.js security headers                                        | `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'` must be configured.                                                         |
| Security Logging and Monitoring | Security-relevant events must be logged through the `Logger` and `AuthAuditQueue`. Raw tokens, passwords, secrets, or financial values must never be logged.       | `app/utils/logger.ts`, `app/auth/AuthAuditQueue.ts`, Azure Application Insights             | Logs include `correlationId`, event type, hashed user identifier, and timestamp. Logs must redact keys matching `token`, `secret`, `password`, or `key`. |
| File Upload Abuse               | Uploaded documents must be validated by MIME type and size before submission. The frontend validates early, but the backend remains the final authority.           | `app/validation/documentUploadSchema.ts`, `app/components/molecules/DocumentUploader/`      | Files above the allowed size or unsupported MIME types are rejected before upload and display a clear validation message.                                |

### Developer Rules

Developers must follow these rules in every feature:

* Do not call APIs directly from components.
* Do not store tokens in browser-persistent storage.
* Do not check user roles directly in components.
* Do not log raw financial values or authentication secrets.
* Do not create new security logic inside pages; reuse `AuthFacade`, `AuthMiddleware`, `PolicyGuard`, `usePolicies()`, and Zod schemas.
* Every protected screen must have both authentication and authorization checks.

---

## 1.5 Frontend Layered Design

The layered design is not a replacement for the C4 architecture diagrams. The C4 diagrams explain the system structure, while this section defines the dependency rules that frontend developers must follow when writing code.

The frontend uses five logical layers with downward-only dependencies.

| Layer          | Responsibility                                                   | Examples                                                                                                                     | Developer Rule                                                        |
| -------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Presentation   | Render UI and receive user interaction                           | Atoms, molecules, organisms, pages, layouts                                                                                  | May call hooks, but must not call services or API clients directly.   |
| Application    | Orchestrate use cases and UI workflows                           | `useAuth`, `useMarketplace`, `useDocumentUpload`, `useExpertValidation`, `useInvestmentDetail`                               | Validates user actions, calls services, dispatches Redux actions.     |
| Domain         | Define business rules, permissions, DTOs, and validation schemas | Zod schemas, role definitions, permission policies, models                                                                   | Must not import React components or infrastructure clients.           |
| Services       | Communicate with backend and external SDKs                       | `AuthFacade`, `HttpClientFacade`, `MarketplaceService`, `TrustRecordService`, `ExpertValidationService`, `InvestmentService` | Must expose clean methods to hooks and must not render UI.            |
| Infrastructure | Shared technical concerns                                        | Redux store, `SessionProvider`, `Logger`, `ExceptionHandler`, i18n, settings, design tokens                                  | Supports other layers but must not contain feature-specific UI logic. |

### Allowed Dependency Flow

```mermaid
C4Component
title Frontend Layered Design - QuietWealth

Container_Boundary(frontend, "Frontend Container - Next.js SSR") {
  Component(presentation, "Presentation Layer", "React Components", "Pages, layouts, atoms, molecules, organisms")
  Component(application, "Application Layer", "React Hooks", "Feature hooks orchestrate validation, services, and state updates")
  Component(domain, "Domain Layer", "TypeScript + Zod", "DTOs, schemas, permissions, access policies")
  Component(services, "Services Layer", "TypeScript Services", "HTTP facade, AuthFacade, domain services")
  Component(infrastructure, "Infrastructure Layer", "Redux, i18n, Logger, Settings", "Shared technical utilities and providers")
}

Rel(presentation, application, "Uses hooks")
Rel(application, domain, "Validates with schemas and policies")
Rel(application, services, "Calls service facades")
Rel(application, infrastructure, "Dispatches state updates")
Rel(services, infrastructure, "Uses logger, settings, HTTP client")
Rel(domain, infrastructure, "Uses shared types only")
```

### Layer Dependency Rules

```text
UI Components
      ↓
Feature Hooks
      ↓
Application Services
      ↓
Infrastructure
```

Rules:

- Components never call services directly.
- Components never access Redux slices directly.
- Hooks orchestrate business workflows.
- Services own API communication.
- Infrastructure owns external integrations.
```

### Example: Login Flow

`LoginPage` receives the user action and calls `useAuth().login()`.
`useAuth()` delegates authentication to `AuthFacade`.
`AuthFacade` starts the Auth0 Authorization Code + PKCE flow.
After callback validation, the session is normalized through `MicrosoftProfileAdapter`.
`SessionManager` updates the active session and Redux reflects the authenticated state.

### Example: Document Upload Flow

`DocumentUploadPage` calls `useDocumentUpload().submit(files)`.
`useDocumentUpload()` validates files with `documentUploadSchema`.
`TrustRecordService` sends the request to the backend.
The backend responds with `202 Accepted`.
`PollingOrchestrator` starts status polling.
`certificationSlice` updates the progress tracker until the application reaches a terminal state.

---

## 1.10 Architecture Diagrams (C4)

### C4 Level 1 - System Context

```mermaid
C4Context
title QuietWealth - System Context

Person(smeOwner, "SME Owner", "Uploads financial documents and tracks certification status")
Person(financialAnalyst, "Financial Analyst", "Reviews SME applications and issues certification decisions")
Person(investor, "Investor", "Browses certified SMEs and views investment detail")
Person(sysAdmin, "System Administrator", "Manages users, roles, configuration, and audit visibility")

System(qw, "QuietWealth", "Financial trust record and certified SME investment marketplace")

System_Ext(auth0, "Auth0", "Identity broker using OAuth 2.0 Authorization Code + PKCE")
System_Ext(entra, "Microsoft Entra ID", "Corporate identity provider")
System_Ext(appInsights, "Azure Application Insights", "Observability, logs, metrics, and traces")

Rel(smeOwner, qw, "Uses", "HTTPS")
Rel(financialAnalyst, qw, "Uses", "HTTPS")
Rel(investor, qw, "Uses", "HTTPS")
Rel(sysAdmin, qw, "Uses", "HTTPS")

Rel(qw, auth0, "Authenticates users through", "OIDC / OAuth 2.0 PKCE")
Rel(auth0, entra, "Federates authentication to")
Rel(qw, appInsights, "Sends telemetry to")
```

### C4 Level 2 - Container Diagram

```mermaid
C4Container
    title QuietWealth Frontend Ecosystem

    Person(user, "Investor / SME / Expert")

    Container(frontend, "QuietWealth Frontend", "Next.js 15 + React 19", "SSR web application")

    Container(api, "QuietWealth API", ".NET", "Business services and data access")

    System_Ext(auth0, "Auth0", "OIDC authentication")

    System_Ext(keyvault, "Azure Key Vault", "Secrets management")

    System_Ext(appinsights, "Application Insights", "Telemetry and monitoring")

    Rel(user, frontend, "Uses")

    Rel(frontend, auth0, "Authenticate via OIDC")

    Rel(frontend, api, "HTTPS REST API")

    Rel(api, keyvault, "Reads secrets")

    Rel(frontend, appinsights, "Sends telemetry")
    Rel(api, appinsights, "Sends telemetry")
```

### C4 Level 3 - Frontend Component Diagram

```mermaid
C4Component
    title QuietWealth Frontend Components

    Container_Boundary(frontend, "Next.js Frontend") {

        Component(ui, "Pages & Components", "React", "Presentation layer")

        Component(hooks, "Feature Hooks", "TypeScript", "Use cases and orchestration")

        Component(state, "Redux Store", "Redux Toolkit", "Application state")

        Component(services, "Application Services", "Axios", "API communication")

        Component(auth, "AuthFacade", "OIDC", "Authentication and authorization")

        Component(polling, "PollingOrchestrator", "TypeScript", "Long running workflows")

        Component(validation, "Zod Schemas", "Zod", "Runtime contract validation")

        Component(errors, "ExceptionHandler", "TypeScript", "Error handling")
    }

    Rel(ui, hooks, "Calls")
    Rel(hooks, state, "Reads/Writes")
    Rel(hooks, services, "Uses")
    Rel(services, validation, "Validates responses")
    Rel(services, errors, "Reports failures")
    Rel(hooks, auth, "Checks permissions")
    Rel(hooks, polling, "Starts/Stops polling")
```

### C4 Level 4 - Auth and Security Code Diagram

```mermaid
classDiagram
direction TB

class AuthFacade {
  <<Facade + Singleton>>
  -auth0Client
  -sessionManager
  -profileAdapter
  -auditQueue
  +getInstance() AuthFacade
  +login() Promise~void~
  +logout() Promise~void~
  +getAccessToken() Promise~string~
  +getSession() UserSessionDTO
}

class AuthMiddleware {
  <<Proxy>>
  -authFacade AuthFacade
  -exceptionHandler ExceptionHandler
  +intercept(request) Promise~Request~
  -refreshTokenIfExpired() Promise~void~
  -handleUnauthorized() void
}

class MicrosoftProfileAdapter {
  <<Adapter>>
  +adapt(rawClaims MicrosoftClaims) UserSessionDTO
  -resolveRole(rawClaims MicrosoftClaims) RoleType
}

class AuthAuditQueue {
  <<Queue-Based Logging>>
  -queue AuthEvent[]
  +enqueue(event AuthEvent) void
  -flush() Promise~void~
}

class SessionManager {
  <<Singleton>>
  -session UserSessionDTO
  +setSession(session) void
  +clearSession() void
  +handleUnauthorized() void
  +getSession() UserSessionDTO
}

class AuthGuard {
  <<Route Guard>>
  +render(children) ReactNode
}

class GuestGuard {
  <<Route Guard>>
  +render(children) ReactNode
}

class PolicyGuard {
  <<Route Guard>>
  +required PermissionCode[]
  +render(children) ReactNode
}

class AccessPolicy {
  <<Policy Map>>
  +canBrowseMarketplace PermissionCode[]
  +canViewInvestmentDetail PermissionCode[]
  +canUploadDocuments PermissionCode[]
  +canAccessValidationQueue PermissionCode[]
  +canCertifySME PermissionCode[]
  +canManageSystem PermissionCode[]
}

class RolePermissions {
  <<Permission Mapping>>
  +investor PermissionCode[]
  +sme_owner PermissionCode[]
  +financial_analyst PermissionCode[]
  +sys_admin PermissionCode[]
}

class UsePolicies {
  <<Hook>>
  +hasAccess(policyName) boolean
  +hasSomeAccess(policyName) boolean
  +getMissingPermissions(policyName) PermissionCode[]
}

class HttpClientFacade {
  <<Facade>>
  +get(url, schema) Promise
  +post(url, body, schema) Promise
  +put(url, body, schema) Promise
  +delete(url, schema) Promise
}

class Logger {
  <<Singleton>>
  +info(event, metadata) void
  +warn(event, metadata) void
  +error(event, metadata) void
  -redactSensitiveKeys(metadata) object
}

class ExceptionHandler {
  <<Singleton>>
  +handle(error) UserFacingError
  +mapStatusCode(status) string
}

AuthFacade --> MicrosoftProfileAdapter
AuthFacade --> AuthAuditQueue
AuthFacade --> SessionManager
AuthMiddleware --> AuthFacade
AuthMiddleware --> ExceptionHandler
AuthGuard --> SessionManager
GuestGuard --> SessionManager
PolicyGuard --> UsePolicies
UsePolicies --> AccessPolicy
UsePolicies --> RolePermissions
HttpClientFacade --> AuthMiddleware
HttpClientFacade --> ExceptionHandler
AuthAuditQueue --> Logger
ExceptionHandler --> Logger
```

---

## 1.6 Design Patterns

### Singleton
Applied to classes that must have exactly one shared instance app-wide.

| Class | File |
|---|---|
| `Logger` | [app/utils/logger.ts](app/utils/logger.ts) |
| `ExceptionHandler` | [app/utils/error-handler.ts](app/utils/error-handler.ts) |
| `AuthFacade` | [app/auth/AuthFacade.ts](app/auth/AuthFacade.ts) |
| `SessionManager` | [app/state/sessionManager.ts](app/state/sessionManager.ts) |
| `CertificationPollingStore` | [app/state/certificationPollingStore.ts](app/state/certificationPollingStore.ts) |
| `DefaultHttpClientFacade` | [app/services/client.ts](app/services/client.ts) |
| `DefaultApplicationServiceFacade` | [app/services/applicationFacade.ts](app/services/applicationFacade.ts) |

**Implementation recipe:**
```ts
export class MyService {
  private static instance: MyService | null = null;
  static getInstance(): MyService {
    if (!MyService.instance) MyService.instance = new MyService();
    return MyService.instance;
  }
  private constructor() {}
}
export const myService = MyService.getInstance();
```

---

### Observer (Certification Status Tracking)
Used for the document upload certification progress, which is a long-running async process.

Reference files:
- [app/state/certification.types.ts](app/state/certification.types.ts)
- [app/state/certificationPollingStore.ts](app/state/certificationPollingStore.ts)
- [app/state/certificationPollingManager.ts](app/state/certificationPollingManager.ts)
- [app/components/hooks/useCertificationProgress.ts](app/components/hooks/useCertificationProgress.ts)
- [app/components/hooks/useDocumentUpload.ts](app/components/hooks/useDocumentUpload.ts)

**Observable Store contract:**
```ts
class CertificationPollingStore {
  private listeners = new Set<Listener<CertificationState>>();
  private state: CertificationState = createInitialState();
  getState()  { return this.state; }
  subscribe(listener: Listener<CertificationState>) {
    this.listeners.add(listener);
    listener(this.state);           // emit immediately on subscribe
    return () => this.listeners.delete(listener);
  }
  patchState(partial: Partial<CertificationState>) {
    this.state = { ...this.state, ...partial };
    for (const l of this.listeners) l(this.state);
  }
}
```

**Subscriber hook:**
```ts
function useCertificationProgress() {
  const [state, setState] = useState(() => certificationPollingManager.getSnapshot());
  useEffect(() => certificationPollingManager.subscribe(setState), []);
  return state;  // no business logic here
}
```

**Manager (non-blocking kickoff):**
```ts
async function startPolling(applicationId: string) {
  store.patchState({ runState: "polling", applicationId });
  void runPollingLoop(applicationId);  // non-blocking
}
```

---

### Facade (Auth + Application Services)
[app/auth/AuthFacade.ts](app/auth/AuthFacade.ts) · [app/services/applicationFacade.ts](app/services/applicationFacade.ts)

```ts
export interface AuthServiceFacade {
  login(): Promise<void>;
  logout(): Promise<void>;
  getAccessToken(): Promise<string>;
  getCurrentSession(): Promise<UserSessionDTO | null>;
}

export interface ApplicationServiceFacade {
  readonly auth: AuthServiceFacade;
  readonly http: HttpClientFacade;
}
```

Hooks import only `useApplicationServices()` for service access. New domains are added by extending facades, never by importing low-level clients in hooks.

---

### Adapter
[app/auth/adapters/MicrosoftProfileAdapter.ts](app/auth/adapters/MicrosoftProfileAdapter.ts)

Normalizes Microsoft Entra ID claims forwarded by Auth0 into the internal `UserSessionDTO`. The rest of the application never sees provider-specific claim shapes.

---

### Proxy (Auth Middleware)
[app/auth/AuthMiddleware.ts](app/auth/AuthMiddleware.ts)

Intercepts every protected API call to validate JWT expiry and trigger silent refresh or logout before the request is dispatched.

---

### Strategy (Polling Interval)
[app/polling/strategies/](app/polling/strategies/)

```ts
export interface IPollingStrategy {
  getInterval(attempt: number): number;  // milliseconds
}

export class FixedIntervalStrategy implements IPollingStrategy {
  getInterval(_: number) { return 10_000; }  // 10 s fixed
}

export class ExponentialBackoffStrategy implements IPollingStrategy {
  getInterval(attempt: number) { return Math.min(2 ** attempt * 1000, 60_000); }
}
```

`PollingOrchestrator` switches to `ExponentialBackoffStrategy` automatically on network errors. After 5 failed attempts it stops and dispatches a connectivity error to the UI.

---

### Queue-Based Logging
[app/auth/AuthAuditQueue.ts](app/auth/AuthAuditQueue.ts)

Auth events (login, logout, token refresh, permission denial) are enqueued and dispatched asynchronously to Application Insights, preventing auth flow delays caused by synchronous logging I/O.

---

## 1.7 Project Scaffold
```
app/
├── layout.tsx
├── page.tsx
├── globals.css
├── login/
│   └── page.tsx
├── marketplace/
│   └── page.tsx                   → MarketplacePage
├── marketplace/[id]/
│   └── page.tsx                   → InvestmentDetailPage
├── documents/
│   └── page.tsx                   → DocumentUploadPage
├── validation/
│   └── page.tsx                   → ExpertValidationPage
└── admin/
    └── page.tsx
│
app/components/
├── atoms/
│   ├── Button/
│   ├── Badge/
│   ├── Input/
│   ├── Label/
│   ├── Spinner/
│   ├── ProgressBar/
│   ├── TrustIndicator/
│   ├── StatCard/
│   ├── MaskedValue/
│   └── atoms.css
├── molecules/
│   ├── SMECard/
│   ├── FilterBar/
│   ├── DocumentUploader/
│   ├── FormField/
│   ├── StatusBadge/
│   ├── InfoBanner/
│   └── molecules.css
├── organisms/
│   ├── MarketplaceGrid/
│   ├── InvestmentDetailPanel/
│   ├── ValidationQueue/
│   ├── DocumentUploadZone/
│   ├── Navbar/
│   ├── Sidebar/
│   └── organisms.css
├── templates/
│   ├── AuthenticatedLayout/
│   └── PublicLayout/
├── pages/
│   ├── LoginPage.tsx
│   ├── MarketplacePage.tsx
│   ├── InvestmentDetailPage.tsx
│   ├── DocumentUploadPage.tsx
│   └── ExpertValidationPage.tsx
├── hooks/
│   ├── useApplicationServices.ts
│   ├── useAuth.ts
│   ├── useMarketplace.ts
│   ├── useDocumentUpload.ts
│   ├── useCertificationProgress.ts
│   ├── useExpertValidation.ts
│   ├── useInvestmentDetail.ts
│   ├── usePermissions.ts
│   ├── usePolicies.ts
│   └── useSession.ts
├── i18n/
│   ├── config.ts
│   ├── I18nProvider.tsx
│   ├── en.json
│   └── es.json
└── styles/
    ├── tokens.ts
    ├── theme.ts
    ├── breakpoints.ts
    ├── globals.css
    └── ThemeProvider.tsx
│
app/auth/
├── AuthFacade.ts
├── AuthMiddleware.ts
├── AuthAuditQueue.ts
├── authConfig.ts
├── adapters/
│   └── MicrosoftProfileAdapter.ts
├── guards/
│   ├── AuthGuard.tsx
│   ├── GuestGuard.tsx
│   └── PolicyGuard.tsx
└── policies/
    ├── roles.ts
    ├── permissions.ts
    ├── rolePermissions.ts
    └── accessPolicy.ts
│
app/polling/
├── PollingOrchestrator.ts
└── strategies/
    ├── IPollingStrategy.ts
    ├── FixedIntervalStrategy.ts
    └── ExponentialBackoffStrategy.ts
│
app/services/
├── applicationFacade.ts
├── client.ts
├── httpInterceptors.ts
├── MarketplaceService.ts
├── TrustRecordService.ts
├── ExpertValidationService.ts
└── InvestmentService.ts
│
app/state/
├── certification.types.ts
├── certificationPollingStore.ts
├── certificationPollingManager.ts
├── session.types.ts
├── sessionManager.ts
├── SessionProvider.tsx
├── StoreProvider.tsx
├── store.ts
├── hooks.ts
└── slices/
    ├── authSlice.ts
    ├── marketplaceSlice.ts
    ├── certificationSlice.ts
    └── validationSlice.ts
│
app/models/
├── ApiResponse.ts
├── SME.ts
├── TrustRecord.ts
├── DocumentUpload.ts
├── Permission.ts
├── Role.ts
└── User.ts
│
app/validation/
├── documentUploadSchema.ts
├── smeSchema.ts
├── userSchema.ts
└── index.ts
│
app/settings/
└── Settings.ts
│
app/utils/
├── logger.ts
├── error-handler.ts
├── eventBus.ts
├── schemaValidator.ts
├── constants.ts
└── formatters.ts
│
app/assets/
└── logo/
    ├── logo-dark.svg
    └── logo-light.svg
│
app/__tests__/
├── setup.ts
├── unit/
│   ├── auth/
│   ├── polling/
│   ├── services/
│   └── validation/
└── e2e/
    ├── login.spec.ts
    ├── marketplace.spec.ts
    ├── document-upload.spec.ts
    └── expert-validation.spec.ts
│
app/__mocks__/
└── styleMock.ts
│
next.config.ts
tailwind.config.ts
tsconfig.json
jest.config.ts
playwright.config.ts
package.json
.env.example
.eslintrc.json
.prettierrc
.lintstagedrc.json
.husky/
└── pre-commit
```

---

### [State Management](app/state/)

State is split into two categories: **global shared state** managed by Redux Toolkit, and **local UI state** managed by `useState`/`useReducer` inside components. The rule is simple — if more than one component needs the value, it goes into Redux; otherwise it stays local.

#### What goes into Redux

| Slice | File | What it holds |
|---|---|---|
| `auth` | [app/state/slices/authSlice.ts](app/state/slices/authSlice.ts) | `isAuthenticated`, `user`, `role`, `accessToken` |
| `marketplace` | [app/state/slices/marketplaceSlice.ts](app/state/slices/marketplaceSlice.ts) | SME listings, active filters, search query |
| `certification` | [app/state/slices/certificationSlice.ts](app/state/slices/certificationSlice.ts) | Upload job state: `applicationId`, `status`, `stage` |
| `validation` | [app/state/slices/validationSlice.ts](app/state/slices/validationSlice.ts) | Expert queue: pending requests, selected request |

#### What stays local

- Form input values (controlled inputs inside a single component)
- UI toggles: modal open/close, dropdown expanded, loading spinner for a single button
- Transient error messages that don't need to persist across navigation

#### How to read state

Always use the typed hooks from [app/state/hooks.ts](app/state/hooks.ts) — never import `useSelector` or `useDispatch` directly.

```ts
import { useAppSelector, useAppDispatch } from "@/state/hooks";

const smes = useAppSelector(
  state => state.marketplace.smes
);

const dispatch = useAppDispatch();
```

#### How to write state

All state writes go through slice actions or async thunks — never mutate state directly outside a slice reducer.

```ts
dispatch(
  certificationSlice.actions.certificationStarted(applicationId)
);
```

#### How to handle async operations

Use `createAsyncThunk` for any operation that involves an API call. The thunk handles `pending`, `fulfilled`, and `rejected` states automatically.

```ts
export const fetchSMEs = createAsyncThunk(
  "marketplace/fetchSMEs",
  async (filters: SMEFilters) => {
    return await marketplaceService.getSMEs(filters);
  }
);
```
Components do not interact with services directly. API operations are orchestrated through feature hooks, which dispatch the corresponding thunks.

State transitions follow the thunk lifecycle:

- `pending` → `loading`
- `fulfilled` → `succeeded`
- `rejected` → `failed`

#### Infrastructure files

| File | Purpose |
|---|---|
| [app/state/store.ts](app/state/store.ts) | Configures the Redux store; registers all slices |
| [app/state/StoreProvider.tsx](app/state/StoreProvider.tsx) | Wraps the app with `<Provider store={store}>` |
| [app/state/hooks.ts](app/state/hooks.ts) | Exports typed `useAppSelector` and `useAppDispatch` |

---
### Async Communication and Polling

Document certification is a long-running async process. The frontend polls `GET /api/trust-record-applications/{id}/status` every 10 seconds until the status reaches `CERTIFIED`, `REJECTED`, or `REQUIRES_HUMAN_REVIEW`.

| File | Description |
|---|---|
| [app/polling/PollingOrchestrator.ts](app/polling/PollingOrchestrator.ts) | Starts, suspends, and stops the polling loop; dispatches status to `certificationSlice` |
| [app/polling/strategies/FixedIntervalStrategy.ts](app/polling/strategies/FixedIntervalStrategy.ts) | 10-second fixed interval (normal operation) |
| [app/polling/strategies/ExponentialBackoffStrategy.ts](app/polling/strategies/ExponentialBackoffStrategy.ts) | Doubles interval on each failure, capped at 60 s; activated on `503` or network error |

---

### Storage Considerations

| Storage | Usage | Notes |
|---|---|---|
| Memory (Redux) | Active session token, marketplace data, certification status | Cleared on tab close |
| Auth0 `HttpOnly` cookie | Refresh token | Managed by Auth0 SDK; inaccessible to JavaScript |
| `localStorage` | Theme, language preferences | No tokens, no financial data |
| `sessionStorage` | Not used | Inconsistent across tabs |
| WebSockets | Not used in v1 | Polling sufficient for certification lifecycle; WebSocket upgrade documented for v2 if sub-10s notification latency is required |

---

### Events

The frontend uses two event propagation mechanisms:

**1. Redux dispatch (intra-app state events)**

All meaningful state transitions are Redux actions dispatched through the store.

```ts
// Dispatched when certification polling detects CERTIFIED
dispatch(certificationSlice.actions.certificationCompleted({ applicationId, trustScore }));

// Dispatched when expert issues a decision
dispatch(validationSlice.actions.decisionIssued({ requestId, decision: "approved" }));
```

**2. Custom DOM events (cross-component out-of-band signaling)**

Used only for UI side-effects (Toast notifications, global loaders) where a service call needs to signal a layout-level component outside React's tree.

```ts
// app/utils/eventBus.ts
export const eventBus = {
  emit<T>(name: string, detail: T) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  },
  on<T>(name: string, handler: (detail: T) => void) {
    const listener = (e: Event) => handler((e as CustomEvent<T>).detail);
    window.addEventListener(name, listener);
    return () => window.removeEventListener(name, listener);
  },
};

// Emit from service layer
eventBus.emit("toast:show", { message: "Documents submitted successfully", type: "success" });

// Subscribe in Toast organism (mounted once at layout level)
useEffect(() => eventBus.on("toast:show", setToast), []);
```

**Rules:**
- Custom DOM events are only for UI side-effects. Business state always goes through Redux.
- Event names use `namespace:verb` format (`toast:show`, `session:expired`).
- Every `on()` subscription must return its cleanup function and be called inside `useEffect`.

---

### Observability and Monitoring

| File | Description |
|---|---|
| [app/utils/logger.ts](app/utils/logger.ts) | Singleton logger — emits `info`, `warn`, `error` to Azure Application Insights |
| [app/utils/error-handler.ts](app/utils/error-handler.ts) | Singleton — maps HTTP codes to user-facing messages; routes 5xx to App Insights with context |

**Logged frontend events:**

| Event | Trigger |
|---|---|
| `AuthLoginStarted` | User selects "Continue with Microsoft" |
| `AuthLoginCompleted` | Session established after token exchange |
| `AuthLoginFailed` | Auth0 returns error on callback |
| `AuthLogoutCompleted` | Logout flow finishes |
| `DocumentsSubmitted` | `POST /api/trust-record-applications` sent |
| `CertificationPollingStarted` | `PollingOrchestrator.start()` called |
| `CertificationStatusChanged` | Any state transition detected by polling |
| `CertificationCompleted` | Status reaches `CERTIFIED` |
| `CertificationRejected` | Status reaches `REJECTED` |
| `ValidationDecisionIssued` | Expert certifies or rejects a request |
| `InvestmentDetailViewed` | User opens Investment Detail screen |
| `ApiRequestFailed` | Any HTTP error from `ExceptionHandler` |
| `ContractViolationError` | Zod schema mismatch on API response |
| `UnhandledExceptionCaptured` | React error boundary catches render crash |

**Monitoring rules:**
- Every event includes: `correlationId`, `userId` (hashed), `role`, `timestamp`, `appVersion`.
- Do not log raw financial values — log only identifiers (`applicationId`, `smeId`).
- Do not log every polling tick — log only meaningful status transitions and exceptional failures.
- Application Insights dashboards track: P95/P99 page load times, certification polling success rate, auth error rate, marketplace search latency.

**Error handling:**

| HTTP Status | User-facing behavior |
|---|---|
| `400` | Inline form validation error next to the offending field |
| `401` | Silent token refresh attempted; if it fails, redirect to login with session-expired message |
| `403` | Toast: "You don't have permission to perform this action" |
| `404` | Redirect to not-found page |
| `429` | Toast with retry countdown; `ExponentialBackoffStrategy` activated |
| `5xx` | Toast with support reference number; polling retries up to 5 times |

---

### Data Validation

| File | Description |
|---|---|
| [app/validation/documentUploadSchema.ts](app/validation/documentUploadSchema.ts) | Validates MIME types (`application/pdf`, `application/vnd.ms-excel`, `image/*`), max 10 MB/file |
| [app/validation/smeSchema.ts](app/validation/smeSchema.ts) | Validates SME listing and investment detail API response shapes |
| [app/validation/userSchema.ts](app/validation/userSchema.ts) | Validates user profile shape from Auth0 token claims |

A schema mismatch throws a `ContractViolationError` logged to Application Insights with the full response payload, making backend contract changes immediately visible.

---

### Caching

| Layer | Strategy |
|---|---|
| Marketplace listings | Stored in Redux; cached for 5 minutes before a fresh fetch is triggered |
| Investment detail | Stored in Redux per `smeId`; invalidated on certification status change |
| Certification status polling endpoints | `Cache-Control: no-store` — always fresh |
| Static assets (JS, CSS, SVG) | Content-hash filenames; `max-age=31536000, immutable` via Azure CDN |

---

### [API Consumption and Data Contracts](app/services/)

The frontend treats the backend OpenAPI specification as the single source of truth for all data contracts. The workflow is: **spec first → generate types → validate at runtime**.

#### OpenAPI Specification

The backend exposes its OpenAPI spec at `GET /swagger/v1/swagger.json` (available in QA; disabled in production). The frontend references this spec to keep DTOs and service contracts in sync.

Spec location (local copy for codegen): [`app/contracts/openapi.json`](app/contracts/openapi.json)

To refresh the local copy from a running QA backend:

```bash
curl https://qaquietwealth-api.azurewebsites.net/swagger/v1/swagger.json \
  -o app/contracts/openapi.json
```

#### Type Generation

Types in [`app/models/`](app/models/) are generated from the OpenAPI spec using `openapi-typescript`. Run this whenever the backend updates its spec:

```bash
npx openapi-typescript app/contracts/openapi.json --output app/models/api.types.ts
```

Developers must **never hand-write DTO types** that correspond to a backend endpoint — always regenerate from the spec.

#### Endpoints by Service

| Service | File | Endpoints |
|---|---|---|
| Marketplace | [app/services/MarketplaceService.ts](app/services/MarketplaceService.ts) | `GET /api/smes` · `GET /api/smes/{id}` |
| Trust Record | [app/services/TrustRecordService.ts](app/services/TrustRecordService.ts) | `POST /api/trust-record-applications` · `GET /api/trust-record-applications/{id}/status` |
| Expert Validation | [app/services/ExpertValidationService.ts](app/services/ExpertValidationService.ts) | `GET /api/validation-queue` · `POST /api/validation-queue/{id}/decision` |
| Investment | [app/services/InvestmentService.ts](app/services/InvestmentService.ts) | `POST /api/investments` |

#### Runtime Validation with Zod

Even though types are generated at build time, every API response is validated at runtime using the corresponding Zod schema before it reaches Redux state. This catches backend contract drift that TypeScript alone cannot catch at runtime.

```ts
// TrustRecordService.ts
import { trustRecordStatusSchema } from "@/validation/smeSchema";

async getStatus(applicationId: string): Promise<TrustRecordStatus> {
  const response = await httpClient.get(`/api/trust-record-applications/${applicationId}/status`);
  return trustRecordStatusSchema.parse(response.data);  // throws ContractViolationError on mismatch
}
```

A `ContractViolationError` is automatically caught by `ExceptionHandler` and logged to Application Insights with the full raw response for debugging.

#### HTTP Client

All requests go through [app/services/client.ts](app/services/client.ts), which handles:
- Attaching `Authorization: Bearer <token>` on every protected request
- Detecting `401` and triggering `sessionManager.handleUnauthorized()`
- Delegating unhandled errors to `ExceptionHandler`

Developers must never call `fetch` or `axios` directly — always use the injected HTTP facade via `useApplicationServices().http`.

---

### Performance Optimization
**Code splitting:** Next.js App Router splits at route segment level automatically.

**Lazy loading:**
```tsx
const InvestmentDetailPage = lazy(() => import("@/components/pages/InvestmentDetailPage"));
const ExpertValidationPage  = lazy(() => import("@/components/pages/ExpertValidationPage"));

<Suspense fallback={<Spinner />}>
  <InvestmentDetailPage />
</Suspense>
```

**Memoization:**
```tsx
export const SMECard = memo(function SMECard({ sme }: SMECardProps) {
  const formattedGrowth = useMemo(() => formatPercent(sme.growthRate), [sme.growthRate]);
  const onViewDetails   = useCallback(() => router.push(`/marketplace/${sme.id}`), [sme.id]);
  return <article onClick={onViewDetails}>...</article>;
});
```

**Bundle reduction:**
- `next-bundle-analyzer` in CI; any chunk exceeding 250 KB fails the pipeline.
- Lucide React imported as named exports only: `import { TrendingUp, Shield } from "lucide-react"`.
- TailwindCSS JIT eliminates unused utility classes at build time.

**Image optimization:**
- Next.js `<Image>` with explicit `width`/`height` for all rasterized assets.
- Logos served as SVG inline — no raster formats.

**Virtualization:**
- `react-window` (`FixedSizeList`) applied to the marketplace SME grid and expert validation queue when row count exceeds 100.

```tsx
import { FixedSizeList } from "react-window";

<FixedSizeList height={600} itemCount={smes.length} itemSize={120} width="100%">
  {({ index, style }) => <SMECard style={style} sme={smes[index]} />}
</FixedSizeList>
```

---

## 1.8 Testing
### Unit Testing (Jest)

| Folder | What is tested |
|---|---|
| [app/__tests__/unit/auth/](app/__tests__/unit/auth/) | `AuthFacade`, `hasPermission`, `getMissingPermissions`, `MicrosoftProfileAdapter` |
| [app/__tests__/unit/polling/](app/__tests__/unit/polling/) | `PollingOrchestrator` state transitions, `FixedIntervalStrategy`, `ExponentialBackoffStrategy` |
| [app/__tests__/unit/services/](app/__tests__/unit/services/) | `MarketplaceService`, `TrustRecordService`, `ExpertValidationService` — with `HttpClientFacade` mocked |
| [app/__tests__/unit/validation/](app/__tests__/unit/validation/) | Zod schemas: valid payloads pass, invalid payloads produce expected error shapes |

Testing rules per unit:
- Verify expected behavior and outputs.
- Cover edge cases (empty, loading, error states).
- Mock external dependencies.
- Do not call real APIs, Auth0, or Azure services.

```ts
// MicrosoftProfileAdapter.test.ts
it("maps Entra ID oid to userId", () => {
  const adapter = new MicrosoftProfileAdapter();
  const dto = adapter.adapt({ oid: "abc123", preferred_username: "user@corp.com", name: "Jane" });
  expect(dto.userId).toBe("abc123");
});
```
### Coverage

**Minimum:** 80% statement coverage on `app/auth/`, `app/polling/`, `app/services/`, `app/validation/`.

```ts
// jest.config.ts
coverageThreshold: {
  "app/auth/**":       { statements: 80 },
  "app/polling/**":    { statements: 80 },
  "app/services/**":   { statements: 80 },
  "app/validation/**": { statements: 80 },
},
```

Coverage report published as a GitHub Actions artifact on every CI run. PRs that drop below threshold are blocked by the quality gate.

---
### Integration Testing (Playwright + msw)
Playwright tests run against a local Next.js dev server. The backend is mocked with `msw` handlers; Auth0 is bypassed via a test token fixture injected into the Redux store.

#### Where to put test files

```
app/__tests__/e2e/
├── login.spec.ts
├── marketplace.spec.ts
├── document-upload.spec.ts
└── expert-validation.spec.ts
```

All E2E tests live under `app/__tests__/e2e/`. One file per business flow. Do not place test files next to the components they test — that folder is for unit tests only.

#### File naming standard

| Pattern | Example |
|---|---|
| One file per business flow | `marketplace.spec.ts` |
| Kebab-case for multi-word flows | `document-upload.spec.ts` |
| Fixtures and helpers | `app/__tests__/fixtures/auth.ts` |
| Page Object Models | `app/__tests__/e2e/pages/MarketplacePage.ts` |

#### How to write a test case

Each test file follows this structure:

```ts
// app/__tests__/e2e/marketplace.spec.ts
import { test, expect } from "@playwright/test";
import { injectAuthSession } from "../fixtures/auth";
import { MarketplacePOM } from "./pages/MarketplacePage";

test.describe("Marketplace", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthSession(page, { role: "investor" });
    await page.goto("/marketplace");
  });

  test("displays SME cards after loading", async ({ page }) => {
    const marketplace = new MarketplacePOM(page);
    await marketplace.waitForCards();
    expect(await marketplace.cardCount()).toBeGreaterThan(0);
  });

  test("filters by sector", async ({ page }) => {
    const marketplace = new MarketplacePOM(page);
    await marketplace.selectSector("Technology");
    const cards = await marketplace.getVisibleCards();
    expect(cards.every(c => c.sector === "Technology")).toBe(true);
  });
});
```

Rules:
- Use `test.describe` to group related cases under the same flow.
- Use `test.beforeEach` to set up auth and navigation — never repeat these inside individual tests.
- Each `test()` block tests **one observable behavior**, not an entire journey.
- Name tests as plain sentences describing what the user sees or can do: `"displays SME cards after loading"`, not `"test marketplace loads"`.

#### Page Object Model (POM)

Every screen gets a Page Object Model in `app/__tests__/e2e/pages/`. POMs encapsulate selectors and interactions so test cases stay readable and locators are maintained in one place.

```ts
// app/__tests__/e2e/pages/MarketplacePage.ts
import { Page } from "@playwright/test";

export class MarketplacePOM {
  constructor(private page: Page) {}

  async waitForCards() {
    await this.page.waitForSelector("[data-testid='sme-card']");
  }

  async cardCount() {
    return this.page.locator("[data-testid='sme-card']").count();
  }
}
```
Rule: **all `data-testid` attributes are defined in the component**, not hardcoded strings in test files. Add `data-testid` to any element that a test needs to target.

#### Auth fixture

Auth0 is never called in tests. Use the shared fixture to inject a session directly:

```ts
// marketplace.spec.ts
await injectAuthSession(page, {
  role: "investor"
});
```
The `SessionProvider` reads `window.__TEST_AUTH__` when present and skips the Auth0 flow. Never mock Auth0 responses directly in test files.

#### Backend mock with msw

API calls are intercepted by `msw`. Handlers live in `app/__tests__/mocks/handlers.ts`:

```ts
// app/__tests__/mocks/handlers.ts
import { http, HttpResponse } from "msw";
import { smeListFixture } from "../fixtures/sme";

export const handlers = [
  http.get("/api/smes", () =>
    HttpResponse.json(smeListFixture)
  ),
];
```

To override a handler for a specific test (e.g. to simulate an error):

```ts
test("shows error banner when API fails", async ({ page }) => {
  await page.route("**/api/smes", route => route.fulfill({ status: 500 }));
  await page.goto("/marketplace");
  await expect(page.getByTestId("error-banner")).toBeVisible();
});
```
#### Configuration

`playwright.config.ts` — Chromium and Firefox projects, `baseURL` from `PLAYWRIGHT_BASE_URL` env var, screenshot on failure, 2 retries on CI.

```ts
export default defineConfig({
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox",  use: { ...devices["Desktop Firefox"] } },
  ],
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" },
  retries: process.env.CI ? 2 : 0,
  reporter: [["html"], ["github"]],
});
```

Run locally: `npx playwright test` · Run single file: `npx playwright test marketplace.spec.ts` · Open UI mode: `npx playwright test --ui`

---

## [1.9 CI/CD](.github/workflows/)

**Technology:** GitHub Actions. All pipeline definitions live in [`.github/workflows/`](.github/workflows/). The repository has two protected branches: `staging` (QA) and `main` (Production). Merging into either branch is the only deployment trigger — there are no manual `workflow_dispatch` runs for normal deployments.

**Environments:** GitHub Environments (`QA`, `Production`) are configured under **Repository → Settings → Environments**. Each environment holds its own secrets and, for Production, requires a manual approval before the deploy job runs.

### Deployment flow

```
developer pushes code
        │
        ▼
 ┌─────────────────────┐
 │  ci-frontend        │  runs on every push to any branch
 │  ci-backend         │  lint · typecheck · test · build
 │  security-scan      │  on every PR only
 └────────┬────────────┘
          │ all checks pass
          ▼
   branch = staging?
      │         │
     yes        no → stops here (feature branches don't deploy)
      │
      ▼
 deploy-qa  ──────────────────►  qaquietwealth-frontend (Azure App Service)
                                  qaquietwealth-api     (Azure App Service)
          │
          │ merge staging → main
          ▼
 deploy-prod  (manual approval required in GitHub Environment)
          │
          ▼
 prodquietwealth-frontend (Azure App Service)
 prodquietwealth-api      (Azure App Service)
```

Authentication to Azure uses **OIDC** — no stored credentials. GitHub exchanges a short-lived token with Azure Entra ID at deploy time. See [OIDC setup](#oidc-and-azure-app-registrations) below.

### Pipeline files

| File | Trigger | Scope |
|---|---|---|
| [`.github/workflows/ci-frontend.yml`](.github/workflows/ci-frontend.yml) | Push to any branch, path `app/**` | `npm ci` → ESLint → Prettier → `tsc --noEmit` → Jest + coverage → `npm run build` → bundle analysis |
| [`.github/workflows/ci-backend.yml`](.github/workflows/ci-backend.yml) | Push to any branch, path `server/**` | `dotnet restore` → `dotnet build` → `dotnet test` → `dotnet format --verify-no-changes` |
| [`.github/workflows/security-scan.yml`](.github/workflows/security-scan.yml) | Pull requests only | `npm audit` · OSSF Scorecard · `gitleaks` for secret scanning |
| [`.github/workflows/deploy-qa-frontend.yml`](.github/workflows/deploy-qa-frontend.yml) | Push to `staging`, path `app/**` | Build → upload artifact → Azure login (OIDC) → `azure/webapps-deploy` |
| [`.github/workflows/deploy-qa-api.yml`](.github/workflows/deploy-qa-api.yml) | Push to `staging`, path `server/**` | Build → publish → Azure login (OIDC) → `azure/webapps-deploy` |
| [`.github/workflows/deploy-prod-frontend.yml`](.github/workflows/deploy-prod-frontend.yml) | Push to `main`, path `app/**` + manual approval | Same as QA workflow; targets `prodquietwealth-frontend` |
| [`.github/workflows/deploy-prod-api.yml`](.github/workflows/deploy-prod-api.yml) | Push to `main`, path `server/**` + manual approval | Same as QA workflow; targets `prodquietwealth-api` |

### Workflow structure (frontend deploy)

Every deploy workflow follows the same two-job pattern. The build job has no Azure permissions; only the deploy job requests `id-token: write` for OIDC.

```yaml
# .github/workflows/deploy-qa-frontend.yml
on:
  push:
    branches: [staging]
    paths: [app/**]

jobs:
  build:
    runs-on: ubuntu-latest
    environment: QA
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm', cache-dependency-path: app/package-lock.json }
      - run: npm ci
        working-directory: app
      - run: npm run lint
        working-directory: app
      - run: npm run format:check
        working-directory: app
      - run: npx tsc --noEmit
        working-directory: app
      - run: npm run test:coverage
        working-directory: app
      - run: npm run build
        working-directory: app
        env:
          NEXT_PUBLIC_AUTH0_DOMAIN:    ${{ secrets.AUTH0_DOMAIN }}
          NEXT_PUBLIC_AUTH0_CLIENT_ID: ${{ secrets.AUTH0_CLIENT_ID }}
          NEXT_PUBLIC_API_BASE_URL:    ${{ secrets.API_BASE_URL }}
      - uses: actions/upload-artifact@v4
        with: { name: node-app, path: app/.next/ }

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment: QA
    permissions:
      id-token: write   # required for OIDC — must NOT be on the build job
      contents: read
    steps:
      - uses: actions/download-artifact@v4
        with: { name: node-app }
      - uses: azure/login@v2
        with:
          client-id:       ${{ secrets.AZUREAPPSERVICE_CLIENTID_QA_FRONTEND }}
          tenant-id:       ${{ secrets.AZUREAPPSERVICE_TENANTID_QA }}
          subscription-id: ${{ secrets.AZUREAPPSERVICE_SUBSCRIPTIONID_QA }}
      - uses: azure/webapps-deploy@v3
        with:
          app-name: qaquietwealth-frontend
          package: .
```

`NEXT_PUBLIC_*` variables are baked into the Next.js bundle at build time. They are **not** runtime Azure App Service settings — do not add them under **Configuration → Application settings** in the portal.

### Pre-commit hooks

Husky runs `lint-staged` before every local commit. Failing checks block the commit.

```json
// app/.lintstagedrc.json
{
  "app/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "app/**/*.{css,json}": ["prettier --write"]
}
```

Custom ESLint rules enforced on every file:
- `no-restricted-syntax` → no `dangerouslySetInnerHTML`
- `no-restricted-globals` → no `localStorage.setItem` / `sessionStorage.setItem` with token-related keys
- `no-console` → use `Logger` from `app/utils/logger.ts`
- `i18n/no-literal-string` → no hardcoded display strings outside i18n keys

### Secrets — where they live and how to get them

#### Local development

Create `app/.env.local` (gitignored). Copy from `app/.env.example` and fill in the values:

```bash
# app/.env.local
NEXT_PUBLIC_AUTH0_DOMAIN=dev-xxxx.us.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=<from Auth0 dashboard → Applications → QuietWealth Dev>
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
AUTH0_SECRET=<random 32-char string, generate with: openssl rand -hex 32>
```

Auth0 values come from the **Auth0 dashboard → Applications → QuietWealth Dev application → Settings**. Never commit this file.

#### QA and Production (GitHub Actions)

Secrets are stored in **GitHub → Repository → Settings → Environments → QA / Production → Environment secrets**. They are injected at pipeline runtime and never written to disk or logs.

| Secret | Environment | Where to get the value |
|---|---|---|
| `AZUREAPPSERVICE_CLIENTID_QA_FRONTEND` | QA | Output of [`infra/setup-github-oidc.ps1`](infra/setup-github-oidc.ps1) |
| `AZUREAPPSERVICE_CLIENTID_QA_API` | QA | Output of [`infra/setup-github-oidc.ps1`](infra/setup-github-oidc.ps1) |
| `AZUREAPPSERVICE_TENANTID_QA` | QA | Azure Portal → Entra ID → Overview → Tenant ID |
| `AZUREAPPSERVICE_SUBSCRIPTIONID_QA` | QA | Azure Portal → Subscriptions |
| `AUTH0_DOMAIN` | QA + Production | Auth0 dashboard → Tenant Settings |
| `AUTH0_CLIENT_ID` | QA + Production | Auth0 dashboard → Applications → QuietWealth QA/Prod |
| `API_BASE_URL` | QA | `https://qaquietwealth-api.azurewebsites.net` |
| `AZUREAPPSERVICE_CLIENTID_PROD_FRONTEND` | Production | Output of [`infra/setup-github-oidc.ps1`](infra/setup-github-oidc.ps1) |
| `AZUREAPPSERVICE_CLIENTID_PROD_API` | Production | Output of [`infra/setup-github-oidc.ps1`](infra/setup-github-oidc.ps1) |
| `AZUREAPPSERVICE_TENANTID_PROD` | Production | Azure Portal → Entra ID → Overview → Tenant ID |
| `AZUREAPPSERVICE_SUBSCRIPTIONID_PROD` | Production | Azure Portal → Subscriptions |
| `API_BASE_URL` | Production | `https://prodquietwealth-api.azurewebsites.net` |

Backend secrets (`ConnectionStrings__QuietWealthSql`, `BlobStorage__ConnectionString`, `NotificationHub__ConnectionString`, `AUTH0_CLIENT_SECRET`) are provisioned directly as Azure App Service **Application settings** via Bicep — they never pass through GitHub Actions.

### OIDC and Azure App Registrations

OIDC lets GitHub Actions deploy to Azure without storing long-lived credentials. The script [`infra/setup-github-oidc.ps1`](infra/setup-github-oidc.ps1) automates the one-time setup. Run it locally with `az login` and `gh auth login` active before the first deployment to each environment.

**What the script does for each app × environment combination** (`frontend-qa`, `api-qa`, `frontend-prod`, `api-prod`):

1. Creates an **Entra ID App Registration** named `qw-{env}-{role}-deploy` (e.g. `qw-qa-frontend-deploy`).
2. Creates a **Service Principal** for it.
3. Adds a **Federated Credential** with:
   - Issuer: `https://token.actions.githubusercontent.com`
   - Subject: `repo:danielpulido01/QuietWealth:environment:QA` (or `Production`)
   - Audience: `api://AzureADTokenExchange`
4. Assigns the **Contributor** role scoped to the specific Azure Web App resource only — not subscription-wide.
5. Writes the three OIDC secrets (`CLIENTID`, `TENANTID`, `SUBSCRIPTIONID`) into the correct GitHub Environment via `gh secret set`.

After running the script, the secrets listed in the table above will be populated automatically. No manual copy-paste from the Azure portal.

**Critical constraints:**
- Each Web App has its own App Registration and `clientId`. `tenantId` and `subscriptionId` are shared within an environment.
- Do not reuse the same App Registration across frontend and API — each needs its own federated credential with the correct subject.
- Bicep infra secrets (`ConnectionStrings__*`, `BlobStorage__*`) are passed via `.bicepparam` using `readEnvironmentVariable()`. Set them in your local shell before running `deploy.ps1`:

```powershell
# Set before running infra deployment — never commit these
$env:QW_SQL_CONNECTION      = '...'
$env:BLOB_CONNECTION        = '...'
$env:NOTIFICATION_CONNECTION = '...'
.\infra\deploy.ps1 -Environment qa
```

Infra deployment is **manual only** and runs from a developer machine, not from GitHub Actions. The Bicep files provision the Azure resources; the GitHub Actions workflows only deploy the application code.

### Infrastructure resources (Bicep)

[`infra/`](infra/) — subscription scope. Deploys the resource group and all Azure resources.

| Resource | QA | Production |
|---|---|---|
| App Service Plan | `asp-qw-qa` (B1) | `asp-qw-prod` (B1) |
| Frontend Web App | `qaquietwealth-frontend` (Node 24 LTS) | `prodquietwealth-frontend` |
| API Web App | `qaquietwealth-api` (DOTNETCORE 10.0) | `prodquietwealth-api` |

Frontend App Service settings provisioned by Bicep:
- `WEBSITE_NODE_DEFAULT_VERSION = ~22`
- `SCM_DO_BUILD_DURING_DEPLOYMENT = false` — Oryx disabled; we deploy pre-built `.next/`

API App Service settings provisioned by Bicep:
- `ASPNETCORE_ENVIRONMENT = Production` (prod) / `Development` (qa — enables Swagger UI)
- `ConnectionStrings__QuietWealthSql`, `BlobStorage__ConnectionString`, `NotificationHub__ConnectionString` — injected from `.bicepparam`
- `AllowedOrigins__0 = https://{frontendAppName}.azurewebsites.net`

---
## 1.10 Architecture Diagrams (C4)

### Context Diagram

QuietWealth serves three primary actors: SME owners submit financial documents for certification, financial analysts review and certify submissions, and investors browse certified SMEs in the marketplace. Identity is delegated to **Auth0** federating exclusively with **Microsoft Entra ID**.

```mermaid
graph TB
    SME(["👤 SME Owner\nUploads documents, tracks certification"])
    FA(["👤 Financial Analyst\nReviews and certifies SME applications"])
    INV(["👤 Investor\nBrowses marketplace, views investment details"])
    SA(["👤 SYS ADMIN\nSystem configuration"])

    subgraph QW["🖥️ QuietWealth System"]
        FE["Frontend\nReact SSR / Node.js\nAzure App Service"]
        BE["Backend API\n(separate service)"]
    end

    AUTH0(["🔐 Auth0\nIdentity Broker\nMicrosoft Entra ID"])
    MSFT(["🟦 Microsoft Entra ID"])

    SME -->|"HTTPS — uploads docs, tracks status"| FE
    FA  -->|"HTTPS — reviews certification queue"| FE
    INV -->|"HTTPS — browses marketplace"| FE
    SA  -->|"HTTPS — configuration"| FE
    FE  <-->|"HTTPS / REST + Bearer JWT"| BE
    FE  -->|"OAuth 2.0 PKCE / OIDC"| AUTH0
    AUTH0 -->|"Federation"| MSFT
```

---

### Container Diagram

```mermaid
graph TB
    Browser(["Web Browser\nReact SSR — Node.js 22 / Next.js 15\nAzure App Service"])

    subgraph Azure["Azure Cloud"]
        CDN["Azure CDN\n— Static asset distribution\n— Cache-Control headers"]

        subgraph FrontendApp["Frontend — Next.js 15 / Node.js 22 · Azure App Service"]
            AuthLayer["Auth Layer\nAuthFacade · AuthMiddleware\nMicrosoftProfileAdapter · AuditQueue"]
            UILayer["Components Layer\nAtomic Design — Atoms → Pages\nMarketplace · Upload · Validation · Detail"]
            ServicesLayer["Services Layer\nMarketplaceService · TrustRecordService\nExpertValidationService · InvestmentService"]
            PollingLayer["Polling Layer\nPollingOrchestrator · Strategies"]
            StateLayer["State Layer\nRedux — auth · marketplace · certification · validation"]
        end

        KeyVault["Azure Key Vault\nAuth0 secrets · API keys"]
        AppIns["Azure Application Insights\nLogs · Metrics · Traces · Alerts"]
    end

    Auth0(["Auth0\nIdentity Broker\nMicrosoft Entra ID · OAuth 2.0 PKCE"])
    BackendAPI(["Backend API\nTrust Record Compilation\n(separate service)"])

    Browser -->|"HTTPS"| CDN
    CDN --> FrontendApp
    FrontendApp -->|"OAuth 2.0 PKCE"| Auth0
    FrontendApp -->|"HTTPS / REST + Bearer JWT"| BackendAPI
    FrontendApp -->|"Managed Identity"| KeyVault
    FrontendApp -->|"OpenTelemetry SDK"| AppIns
```

---

### Code Diagram — Auth Bounded Context

```mermaid
classDiagram
    direction TB

    class AuthFacade {
        <<Facade — Singleton>>
        -auth0Client Auth0Client
        +login() Promise~void~
        +logout() Promise~void~
        +getAccessToken() Promise~string~
        +getSession() UserSessionDTO
        +getInstance() AuthFacade
    }

    class AuthMiddleware {
        <<Proxy>>
        -authFacade AuthFacade
        +intercept(request) Promise~Request~
        -refreshTokenIfExpired() Promise~void~
    }

    class MicrosoftProfileAdapter {
        <<Adapter>>
        +adapt(rawClaims MicrosoftClaims) UserSessionDTO
    }

    class AuthAuditQueue {
        <<Queue-Based Logging>>
        -queue AuthEvent[]
        +enqueue(event AuthEvent) void
        -flush() Promise~void~
    }

    class UserSessionDTO {
        <<DTO>>
        +userId string
        +email string
        +displayName string
        +role RoleType
        +accessToken string
        +expiresAt number
    }

    class RoleDefinitions {
        <<Map>>
        +INVESTOR PermissionCode[]
        +SME_OWNER PermissionCode[]
        +FINANCIAL_ANALYST PermissionCode[]
        +SYS_ADMIN PermissionCode[]
    }

    AuthFacade --> MicrosoftProfileAdapter
    AuthFacade --> AuthAuditQueue
    AuthMiddleware --> AuthFacade
    MicrosoftProfileAdapter --> UserSessionDTO
    AuthFacade --> RoleDefinitions
```
---

# Backend Design
