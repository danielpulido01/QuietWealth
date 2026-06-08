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
### 1.3.2 Component Hierarchy
### 1.3.3 Component Categories
### 1.3.4 Component Reuse Strategy
### 1.3.5 [Hooks]
### 1.3.6 Naming conventions
### 1.3.7 Styles and Design Tokens
### 1.3.8 Responsive Design
### 1.3.9 Internationalization
### 1.3.10 Performance Guidelines

## 1.4 Security 
### 1.4.1 Technologies
### 1.4.2 Authentication
### 1.4.3 Authorization
### 1.4.4 Encryption and Data Privacy
### 1.4.5 API Communication
### 1.4.6 Storage Rules
### 1.4.7 Data Masking
### 1.4.8 OWASP Mitigations(Camilo)

## 1.5 Layered Design
## 1.6 Design Patterns

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
    ├── documentUpload.spec.ts
    └── expertValidation.spec.ts
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

# Backend Design