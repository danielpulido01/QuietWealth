# DUA-Streamliner

## Problem Statement

The preparation process of the Single Customs Declaration (DUA) in Costa Rica is manual, repetitive, and highly dependent on expert knowledge. To complete it correctly, multiple source documents must be interpreted - including commercial invoices, packing lists, certificates of origin, bills of lading, and insurance policies - which are typically provided in heterogeneous formats such as Excel, Word, PDF, and scanned images, often with varying structures.

This documentary diversity requires case-by-case interpretation, increasing the risk of errors, value inconsistencies, missing information, and potential penalties or delays in import and export procedures. Additionally, the time spent on operational tasks limits the customs professional's ability to focus on strategic validation and regulatory compliance.

The core problem lies in the absence of an intelligent system capable of automatically interpreting heterogeneous commercial documents, extracting relevant information, and reliably mapping it to the official DUA template defined by the Ministry of Finance.


## Authors

- Daniel Pulido  
- Juan Pablo Cambronero


# 1. Frontend Design

## 1.1 Technology stack

- Application Type: SPA Web App
- Web Framework: Reactjs version 19.2
- Web server: NodeJS version 21 with Vite
- Coding Language: TypeScript 5.9.3
- Unit Testing: Jest version 30.2.0 
- Data Validations: Zod 4.3.6
- Code Prettier Framework: Prettier 3.8.1
- Code Style Framework: ESLint 10.0.2
- Integration Testing: Playwright version 1.58.2
- Cloud Service: Azure
- Hosted Services with the Cloud Service: Azure App Service
- Code Repositories Service: Azure DevOps
- Code Automation Tasks Tool: Husky 9.1.7
- CI/CD Pipeline Technology: Azure DevOps Pipelines
- Environments: Development, Stage and Production
- Environment Deployment Tools: Azure Devops Environments
- Observability Framework: Azure Application Insights SDK


## 1.2 UX UI analysis

### 1.2.1 Core Business Process 

#### Login
1. User enters username
2. User enters password
3. User enters one-time token
4. User presses Login
5. System validates credentials
6. System validates token
7. If it fails, the system displays an invalid credentials message
8. System logs the login attempt
9. User can retry login
10. If successful, the system creates a session
11. System redirects to Home

#### Home
1. System redirects the user to the Home screen after login
2. System loads the user information
3. System retrieves the list of uploaded files
4. System retrieves recent activity
5. System displays the list of uploaded files
6. System displays the upload date of each file
7. System displays the status of each file
8. System displays the history of generated DUAs

#### Configure the generator
1. User selects the "Generate DUA" option
2. User uploads a folder containing documents
3. System validates file formats
4. System lists detected documents
5. User uploads the DUA template
6. System validates the template
7. System confirms required files
8. User confirms process start
9. User presses Start generation
10. System begins processing
11. System displays a generation started message

#### Progress monitoring
1. System displays file reading progress
2. System updates the processed files counter
3. System indicates the current stage of the process
4. System displays the status of each document
5. System logs detected errors
6. System notifies warnings
7. User can check the process status
8. User can refresh progress

#### Retrieving the result
1. System generates a preliminary DUA document
2. System displays a preview
3. User reviews the document
4. User identifies marked fields
5. User confirms the document
6. User downloads the Word file
7. System logs the download

#### Logout
1. User selects Logout
2. System ends the session
3. System clears the active session
4. System redirects to the login screen
5. System displays a session closed message


### 1.2.2 Wireframes

#### Login Screen
The user can log in into his account using username, password and one-time token

![Login Screen](/media/login.png)

#### Home Screen
Users can view a summary of uploaded files, recent activity, history, etc

![User's Home Screen](/media/home.png)

#### Configure Generation
Users can configure the generation of the DUA with selected files and a DUA template

![DUA Generation Configuration Screen](/media/configure-generator.png)

#### Generation Progress
Shows the progress of the generation based on amount of files processed, current phase, etc

![Progress Screen](/media/progress.png)

#### Preview
Shows a preview of the generated DUA, users can validate and download the docx file

![Document Preview Screen](/media/preview.png)

#### Logout
Shows a message to the user verifying the session is closed

![Logout Screen](/media/logout.png)


### 1.2.3 UX Test Results

A usability test was conducted using Maze to validate the proposed wireframes of the DUA Streamliner system. The test was shared remotely via URL with 4 participants.

#### Test Objective
Evaluate user ability to:
- Log in successfully
- Generate a DUA
- Configure DUA generator correctly
- Review the generated document
- Log out of the system

#### Tasks Executed

| Task | Description |
|------|------------|
| Task 1 - Login | User attempts to log into the system |
| Task 2 - Generate DUA | User initiates the DUA generation process |
| Task 3 - Configure Generator | User uploads files and configures generation |
| Task 4 - Review Document | User analyzes and validates generated DUA |
| Task 5 - Logout | User ends the session |

#### Participants
- Lázaro González (Student)
- Jimena Sanchez (Student)
- Juan Diego Arce (Student)
- Josué Venegas (Student)

#### Key Metrics (Maze)

#### Overall Performance

| Metric | Value | Interpretation |
|--------|------|----------------|
| Completion Rate | 100% | All users successfully completed all tasks, indicating a clear and understandable flow |
| Success Rate | 100% | No task failures occurred |
| Average Time on Task | 5.8 seconds | Tasks were completed quickly, suggesting high efficiency |
| Misclick Rate | 6.7% | Low overall error rate, with minor friction concentrated in login |

#### Task-Level Performance

| Task | Avg Time (s) | Success Rate | Misclick Rate | Interpretation |
|------|-------------|--------------|---------------|----------------|
| Login | 14.2 | 100% | 33.3% | Higher friction; users hesitated or misclicked during authentication |
| Generate DUA | 3.0 | 100% | 0% | Very clear action, no confusion |
| Configure Generator | 4.3 | 100% | 0% | Process understood without errors |
| Review Document | 4.5 | 100% | 0% | Validation step intuitive |
| Logout | 3.1 | 100% | 0% | Simple and direct interaction |

#### Findings

- All participants successfully completed every task, indicating a clear and understandable user flow.
- The login task showed a higher misclick rate (33.3%), suggesting minor usability friction in the authentication interface.
- All other tasks showed 0% misclick rate, indicating strong clarity in navigation and actions.
- The DUA generation and configuration process was completed quickly and without errors.
- The review and logout flows were intuitive and required minimal effort.

#### Observations

- Users understood the system flow from login to document generation without guidance.
- The interface provided clear feedback during each step of the process.
- The login screen may require slight improvements in input clarity or button visibility.

#### Evidence

The following screenshot from Maze shows the registered participants and their test execution status:

![Participants](/media/participants.png)

#### Task 1 - Login

Users attempted to authenticate using their credentials.

**Maze Evidence**

![Task 1 Login](/media/task1-login.png)

**Heatmap**

![Task 1 Heatmap](/media/task1-heatmap.jpg)

#### Task 2 - Generate DUA

Users initiated the DUA generation process from the main interface.

**Maze Evidence**

![Task 2 Generate](/media/task2-generate.png)

**Heatmap**

![Task 2 Heatmap](/media/task2-heatmap.jpg)

#### Task 3 - Configure Generator

Users uploaded files and configured the generation process.

**Maze Evidence**

![Task 3 Configure](/media/task3-configure.png)

**Heatmap**

![Task 3 Heatmap](/media/task3-heatmap.jpg)

#### Task 4 - Review Document

Users reviewed the generated DUA and validated its correctness.

**Maze Evidence**

![Task 4 Review](/media/task4-review.png)

**Heatmap**

![Task 4 Heatmap](/media/task4-heatmap.jpg)

#### Task 5 - Logout

Users ended their session through the logout action.

**Maze Evidence**

![Task 5 Logout](/media/task5-logout.png)

**Heatmap**

![Task 5 Heatmap](/media/task5-heatmap.jpg)


## 1.3 Component design strategy

### 1.3.1 Components
The frontend follows an atomic design for component architecture.

### 1.3.2 Component Hierarchy
[Components](/src/components)

Current component implementation uses 4 atomic UI layers plus shared support modules:
```
src/
 ├ components/
 │   ├ atoms/
 │   ├ molecules/
 │   ├ organisms/
 │   ├ pages/
 │   ├ hooks/
 │   ├ i18n/
 │   └ styles/
```

### 1.3.3 Component Categories

#### [Atoms](/src/components/atoms)
Reusable low-level UI components (no business logic)

- Must be pure UI
- No API calls
- No business logic
- Only accept props
- Must support theme tokens

```
Button
Input
PasswordInput
Select
Checkbox
Radio
Modal
Card
Badge
Spinner
ProgressBar
Table
Toast
```

Example usage:
``` TypeScript
<Button variant="primary" size="md" loading>
  Login
</Button>
```

#### [Molecules](/src/components/molecules)
Built from primitives

- Combine primitives
- Handle UI logic
- No API calls directly
- Data passed via props

```
info-banner.tsx
```

Example:
```
InfoBanner
 ├ Alert
 └ Button
```

#### [Organisms](/src/components/organisms)
Components responsible for larger layout composition and section structure.

- Must not contain business logic
- Responsible only for layout composition

```
MainLayout
AuthLayout
DashboardLayout
Sidebar
Topbar
PageContainer
```

Example:
```
DashboardLayout
 ├ Sidebar
 ├ Topbar
 └ PageContent
```

#### [Pages](/src/components/pages)
Feature-specific components tied to a business process.

- Coordinate business logic through hooks, which interact with services
- Manage state
- Compose composites + layouts
- Are mounted by route definitions in [AppRouter.tsx](/src/routes/AppRouter.tsx) and [routeConfig.ts](/src/routes/routeConfig.ts)

```
GenerationProgressPage.tsx
```

### 1.3.4 Component Reuse Strategy

Before creating a new component developers must:
1. Search in [Atoms](/src/components/atoms)
2. Search in [Molecules](/src/components/molecules)
If a similar component exists, extend it by adding props, variants, or composition instead of duplicating code.

Components must be configurable using props instead of duplication.

```
<Button variant="primary" />
<Button variant="secondary" />
<Button variant="danger" />
```

#### [Hooks](/src/components/hooks)
Components use hooks for business logic.
Example:
```
useLogin()
useLogout()
useGenerationProgress()
useDuaGeneration()
useApplicationServices()
```

Hooks use [Services](/src/services), [Auth service](/src/auth/authService.ts), and [State managers](/src/state) for orchestration:

Example:
```
applicationFacade.ts
generationManager.ts
```

### 1.3.5 [Styles](/src/components/styles)
All visual styles must be centralized using design tokens in [Tokens](/src/components/styles/tokens.ts)

Example:
```
export const colors = {
  primary: "#0052CC",
  secondary: "#36B37E",
  danger: "#FF5630",
  background: "#F4F5F7",
}

export const spacing = {
  sm: "8px",
  md: "16px",
  lg: "24px",
}

export const radius = {
  sm: "4px",
  md: "8px",
  lg: "12px"
}
```

#### [Theme](/src/components/styles/theme.ts)
How do I switch dark/light mode? How do I add a new theme?

Example:

export const theme = {
  colors,
  spacing,
  radius,
  typography: {
    fontFamily: "Inter, sans-serif",
    headingWeight: 600
  }
}

#### Styling rules
Developers must:
- Use tokens
- Avoid hardcoded colors
- Prefer token-based class names/CSS variables for visual styling
- Use inline styles only for temporary layout scaffolding

Example:

Correct
```TypeScript
<Button className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)]" />
```
Incorrect
```TypeScript
<Button style={{ background: "#0052CC" }} />
```

### 1.3.6 Internationalization Strategy
All text must be externalized.

#### [i18n](/src/components/i18n)
Insert new languages in this folder:
[es](/src/components/i18n/es.json)
[en](/src/components/i18n/en.json)

Example:
```JSON
{
  "login.title": "Login",
  "login.username": "Username",
  "login.password": "Password",
  "login.token": "One-time token"
}
```

#### Usage rule
Components must not contain literal text.
Example:

Incorrect
```TypeScript
<h1>Login</h1>
```

Correct
```TypeScript
<h1>{t("login.title")}</h1>
```

#### Translation hook
Developers must use:
```
react-i18next
```

Example:
```TypeScript
const { t } = useTranslation()
```

### 1.3.7 Responsiveness Strategy
Responsiveness must be centralized using breakpoint tokens in [breakpoints](/src/components/styles/breakpoints.ts)

Example:
```TypeScript
export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1200
}
```

#### Responsive rules
Developers must:
- Use flex/grid layouts
- Avoid fixed widths
- Use responsive utilities

Example:
```
grid-template-columns:
1 column mobile
2 columns tablet
3 columns desktop
```

#### Layout example
```
Home Page
 ├ Summary cards
 ├ Uploaded files table
 └ Activity log
```

Responsive behavior:
| Device | Layout |
|--------|--------|
| Mobile | Vertical stack |
| Tablet | 2 column grid |
| Desktop | 3 column grid |

### 1.3.8 Testing Requirements for Components
Each component must include tests.

#### Unit tests
How exactly are these configured and tested?
```
components/primitives/Button/Button.test.tsx
```

Testing rules:

Test:
- Rendering
- Props
- Events
- Edge cases

Example tests:
- Button renders correctly
- Button shows loading state
- Button triggers click handler

#### Integration tests
Using Playwright for flows:

Required flows:
- Login flow
- File upload
- Generation process
- Preview download
- Logout

#### Performance Guidelines
Developers must:
- Use React.memo for heavy components
- Use lazy() for feature modules
- Avoid unnecessary re-renders

Examples:

```tsx
import { memo } from "react";

type StatCardProps = { title: string; value: string };

export const StatCard = memo(function StatCard({ title, value }: StatCardProps) {
  return (
    <article>
      <h3>{title}</h3>
      <p>{value}</p>
    </article>
  );
});
```

```tsx
import { lazy, Suspense } from "react";

const GeneratorPage = lazy(() => import("@/features/dua-generator/ConfigureGeneratorPage"));
const PreviewPage = lazy(() => import("@/features/dua-generator/PreviewPage"));

export function AppRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GeneratorPage />
      <PreviewPage />
    </Suspense>
  );
}
```

```tsx
import { useCallback, useMemo, useState } from "react";

type FileItem = { id: string; name: string; status: "ok" | "error" };

export function FileList({ files }: { files: FileItem[] }) {
  const [query, setQuery] = useState("");

  const visibleFiles = useMemo(
    () => files.filter((f) => f.name.toLowerCase().includes(query.toLowerCase())),
    [files, query]
  );

  const onSearchChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  return (
    <section>
      <input value={query} onChange={(e) => onSearchChange(e.target.value)} />
      <ul>
        {visibleFiles.map((file) => (
          <li key={file.id}>{file.name}</li>
        ))}
      </ul>
    </section>
  );
}
```

## 1.4 Security 

### 1.4.1 Technologies
- React Router
- Context API
- Zod
- Axios or Fetch wrapper
- JWT bearer tokens for protected API requests

### 1.4.2 Authentication
Uses username, password, and one-time token authentication.

1. User submits username, password, and one-time token.
2. Frontend validates the form using Zod.
  ```TypeScript
  import { z } from "zod";

  export const loginRequestSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
    otp: z.string().min(1),
  });
  
  export type LoginRequest = z.infer<typeof loginRequestSchema>;
  ```
3. Frontend sends credentials to backend via [authService.ts](/src/auth/authService.ts).
  ```TypeScript
  import { parseWithSchema } from "../utils/schemaValidator";
  import { loginRequestSchema } from "./auth-schemas";
  import { httpClientFacade } from "../services/client";
  import type { AuthSession } from "../state/session.types";

  export class AuthService {
    async login(input: { username: string; password: string; otp: string }): Promise<AuthSession | null> {
      const payload = parseWithSchema(loginRequestSchema, input, { schemaName: "login request" });
      const response = await httpClientFacade.fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Login failed.");
      }

      return this.getCurrentSession();
    }
  }
  ```
4. Backend validates the credentials.
5. Backend validates the one-time token.
6. Backend issues the JWT bearer token.
7. Backend creates the session context.
8. Backend returns:
   - JWT bearer token
   - Authenticated user profile
   - Permission set or role set
9. Frontend normalizes and stores the authenticated session (user, roles, permissions) through `SessionProvider` and `sessionManager`.
  ```TypeScript
  // Inside useLogin after successful authentication
  const session = await authService.login(parsed.data);
  setSession(session); // SessionProvider delegates to sessionManager.setSession

  // SessionProvider maps session data for app-wide access
  const value = {
    session,
    user: session?.user ?? null,
    roles: session?.roles ?? [],
    permissions: session?.permissions ?? [],
    isAuthenticated: session?.isAuthenticated ?? false,
  };
  ```
10. Frontend redirects to the Home screen.

[useLogin.ts](/src/components/hooks/useLogin.ts)
  ```TypeScript
  import { useState } from "react";
  import { useSession } from "./useSession";
  import { useApplicationServices } from "./useApplicationServices";

  export function useLogin() {
    const { auth } = useApplicationServices();
    const { setSession } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function login(input: { username: string; password: string; otp: string }) {
      setError(null);
      setIsLoading(true);

      try {
        const session = await auth.login(input);
        if (!session) {
          setError("No active session was returned by the server.");
          return false;
        }
        setSession(session);
        return true;
      } catch {
        setError("Login failed.");
        return false;
      } finally {
        setIsLoading(false);
      }
    }

    return { login, isLoading, error };
  }
  ```

### 1.4.3 Authorization

#### 1.4.3.1 Roles
Roles are found in [roles.ts](/src/auth/policies/roles.ts)

| Code     | Description                                                                                                                |
| -------- | -------------------------------------------------------------------------------------------------------------------------- |
| admin    | Full access to the platform, including user, role, permission, audit, and system administration                            |
| operator | Can upload files, configure the generator, start DUA generation, monitor progress, preview results, and download documents |
| reviewer | Can review generated DUAs, preview documents, confirm them, and download results                                           |
| viewer   | Can access Home, view files, view activity, and monitor process status, but cannot generate or confirm DUAs                |

#### 1.4.3.2 Permissions
Permissions are found in [permissions.ts](/src/auth/policies/permissions.ts)

**Permission Catalog**
| Code                   | Description                                                        |
| ---------------------- | ------------------------------------------------------------------ |
| auth.login             | User can authenticate using username, password, and one-time token |
| auth.logout            | User can terminate the active session                              |
| session.read           | User can access the Home screen through an active session          |
| user.profile.read      | User can view their user information on the Home screen            |
| files.read             | User can view uploaded files and their metadata                    |
| files.upload           | User can upload folders or documents used for DUA generation       |
| files.delete           | User can delete uploaded files                                     |
| activity.read          | User can view recent activity related to their processes           |
| dua.template.upload    | User can upload a DUA template used for document generation        |
| dua.template.validate  | System validates uploaded templates before generation              |
| dua.generate           | User can start the DUA generation process                          |
| dua.preview            | User can preview the generated DUA before confirming               |
| dua.confirm            | User can confirm the generated DUA document                        |
| dua.download           | User can download the generated DUA document                       |
| generation.read        | User can monitor the progress of a generation process              |
| generation.refresh     | User can refresh the generation progress                           |
| generation.errors.read | User can view warnings and errors generated during processing      |

**Admin Permissions**
| Code                   | Description                                   |
| ---------------------- | --------------------------------------------- |
| users.read             | Admin can view the list of users              |
| users.create           | Admin can create new users                    |
| users.update           | Admin can update user information             |
| users.delete           | Admin can delete users                        |
| roles.read             | Admin can view system roles                   |
| roles.create           | Admin can create roles                        |
| roles.update           | Admin can modify roles                        |
| roles.delete           | Admin can delete roles                        |
| permissions.read       | Admin can view permission definitions         |
| permissions.assign     | Admin can assign permissions to roles         |
| generation.cancel      | Admin can cancel an active generation process |
| activity.audit.read    | Admin can view the complete system audit log  |
| system.settings.update | Admin can modify system configuration         |


#### 1.4.3.3 Role-Permission Mapping
Role to permissions mapping is found in [rolePermissions.ts](/src/auth/policies/rolePermissions.ts)

| Role     | Permissions                                                                                                                                                                                                                                         |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| admin    | All permissions                                                                                                                                                                                                                                     |
| operator | auth.login, auth.logout, session.read, user.profile.read, files.read, files.upload, files.delete, activity.read, dua.template.upload, dua.template.validate, dua.generate, generation.read, generation.refresh, generation.errors.read, dua.preview, dua.download |
| reviewer | auth.login, auth.logout, session.read, user.profile.read, files.read, activity.read, dua.preview, dua.confirm, dua.download, generation.read, generation.refresh, generation.errors.read                                                            |
| viewer   | auth.login, auth.logout, session.read, user.profile.read, files.read, activity.read, generation.read                                                                                                                                                |


#### 1.4.3.4 Access Policies
Access Policies are found in [accessPolicy.ts](/src/auth/policies/accessPolicy.ts)

| Policy                  | Required Permissions                                       | Description                                           |
| ----------------------- | ---------------------------------------------------------- | ----------------------------------------------------- |
| canViewHome             | session.read, user.profile.read, files.read, activity.read | Allows access to the Home screen and its main widgets |
| canGenerateDua          | dua.generate, files.upload, dua.template.upload            | Allows starting the DUA generation flow               |
| canMonitorGeneration    | generation.read                                            | Allows viewing generation progress                    |
| canRefreshGeneration    | generation.refresh                                         | Allows refreshing process status                      |
| canViewGenerationErrors | generation.errors.read                                     | Allows viewing warnings and processing errors         |
| canPreviewDua           | dua.preview                                                | Allows previewing the generated DUA                   |
| canConfirmDua           | dua.confirm                                                | Allows confirming the generated DUA                   |
| canDownloadDua          | dua.download                                               | Allows downloading the generated DUA file             |
| canManageUsers          | users.read, users.create, users.update, users.delete       | Allows user administration                            |
| canManageRoles          | roles.read, roles.create, roles.update, roles.delete       | Allows role administration                            |
| canAssignPermissions    | permissions.read, permissions.assign                       | Allows permission assignment to roles                 |
| canReadAuditLog         | activity.audit.read                                        | Allows access to full audit logs                      |
| canManageSystemSettings | system.settings.update                                     | Allows changing platform settings                     |
| canCancelGeneration     | generation.cancel                                          | Allows canceling active generation processes          |


#### 1.4.3.5 Routing Protection
This project has three methods of routing protection, use depending on each routes context.

**[AuthGuard.tsx](/src/auth/guards/AuthGuard.tsx)**

Use this guard to prevent unauthenticated access to specific routes.

Example usage:
[AppRouter.tsx](/src/routes/AppRouter.tsx)
```TypeScript
  <AuthGuard>
    <DashboardLayout>
      <HomePage />
    </DashboardLayout>
  </AuthGuard>
```

**[GuestGuard.tsx](/src/auth/guards/GuestGuard.tsx)**

Use this guard to prevent authenticated users accessing unauthenticated sites.

Example usage:
[AppRouter.tsx](/src/routes/AppRouter.tsx)
```TypeScript
  <GuestGuard>
    <LoginPage />
  </GuestGuard>
```

**[PolicyGuard.tsx](/src/auth/guards/PolicyGuard.tsx)**

Use this guard when an entire route, page, or protected section requires a specific set of permissions defined by an access policy.

Example usage:
[AppRouter.tsx](/src/routes/AppRouter.tsx)
  ```TypeScript
  <AuthGuard>
    <PolicyGuard required={accessPolicy.canGenerateDua}>
      <ConfigureGeneratorPage />
    </PolicyGuard>
  </AuthGuard>
  ```

#### 1.4.3.6 Usage
Developers must never write:
```TypeScript
if (user.role === "admin")
```
directly inside pages or components. Instead they should use:
```TypeScript
const { hasAccess } = usePolicies();

{hasAccess("canGenerateDua") && <StartGenerationButton />}
```
Policies centralize business access rules so that permission changes are made in one place only.

Use permissions directly only inside:
- policy definitions
- low-level authorization utilities
- backend authorization logic

**When to use policy hooks vs guards**

Use `PolicyGuard` when the entire route, page, or major protected section must be blocked for unauthorized users.

Example:
```TypeScript
<AuthGuard>
  <PolicyGuard required={accessPolicy.canGenerateDua}>
    <ConfigureGeneratorPage />
  </PolicyGuard>
</AuthGuard>
```

Use `usePolicies()` inside components to control smaller UI behaviors such as:
- showing or hiding buttons
- rendering optional sections
- displaying access explanations
- detecting partial access

Example:
```TypeScript
const { hasAccess } = usePolicies();
const { hasPermission } = usePermissions();

{hasAccess("canGenerateDua") && <StartGenerationButton />}
```

**hasAccess**

Use `hasAccess` when the user must have all permissions required by the policy.

This is the default method for most actions.

Example:
```ts
const { hasAccess } = usePolicies();

return (
  <>
    {hasAccess("canGenerateDua") && <StartGenerationButton />}
  </>
);
```
Use `hasAccess` for:
- action buttons
- form submission actions
- protected widgets
- feature visibility that requires full access

**hasSomeAccess**

Use `hasSomeAccess` when a screen or component can still provide value with partial access.

This is useful when a section contains multiple sub-features and you want to render the container if the user can access at least one of them.

Example:
```ts
const { hasSomeAccess, hasAccess } = usePolicies();

return (
  <>
    {hasSomeAccess("canViewHome") && (
      <HomePanel>
        {hasAccess("canViewHome") ? (
          <FullHomeContent />
        ) : (
          <LimitedHomeContent />
        )}
      </HomePanel>
    )}
  </>
);
```

Use `hasSomeAccess` for:
- dashboards with partial widgets
- grouped action menus
- sections that degrade gracefully
- navigation groups where at least one item is available

Do not use `hasSomeAccess` for:
- destructive actions
- form submissions
- secure business operations
- anything that requires full authorization

**getMissingPermissions(policyName)**

Use `getMissingPermissions` when the UI needs to explain why access is denied or when debugging authorization.

Example:
```ts
const { hasAccess, getMissingPermissions } = usePolicies();

if (!hasAccess("canManageUsers")) {
  return (
    <AccessDeniedMessage
      missingPermissions={getMissingPermissions("canManageUsers")}
    />
  );
}
```

Use `getMissingPermissions` for:
- admin/debug pages
- support troubleshooting
- access denied messages
- logs and diagnostics

Do not expose raw permission codes to end users unless that is intentional for admin or internal tools.

For normal users, prefer friendly messages like:
- "You do not have access to generate DUAs."
- "Contact an administrator if you need this action enabled."

Example:
```tsx
{hasPermission("dua.generate") && <StartGenerationButton />}
```

**To add additional roles/permissions:**

1. Add role definition in [roles.ts](/src/auth/policies/roles.ts)
  ```TypeScript
  export const Roles = {
    ADMIN: "admin",
    OPERATOR: "operator",
    REVIEWER: "reviewer",
  } as const;
  ```
2. Add permission definition in [permissions.ts](/src/auth/policies/permissions.ts)
  ```TypeScript
  export const Permissions = {
    DUA_READ: "dua.read",
    DUA_GENERATE: "dua.generate",
    DUA_DOWNLOAD: "dua.download",
    FILES_READ: "files.read",
    FILES_UPLOAD: "files.upload",
    ACTIVITY_READ: "activity.read",
  } as const;
  ```
  and in [session.types.ts](/src/state/session.types.ts)
  ```TypeScript
  export type PermissionCode =
  | "dua.read"
  | "dua.generate"
  | "dua.download"
  | "files.read"
  | "files.upload"
  | "activity.read";
  ```

3. Map policies to permissions in [accessPolicy.ts](/src/auth/policies/accessPolicy.ts)
  ```TypeScript
  import { Permissions } from "./permissions";

  export const accessPolicy = {
    canViewHome: [Permissions.FILES_READ, Permissions.ACTIVITY_READ],
    canGenerateDua: [Permissions.DUA_GENERATE, Permissions.FILES_UPLOAD],
    canDownloadDua: [Permissions.DUA_DOWNLOAD],
  };
  ```

Permissions should be added in the backend as well in order for this to work

### 1.4.4 API Communication

#### Centralized API Client
[client.ts](/src/services/client.ts)

#### HTTP Interceptors
[httpInterceptors.ts](/src/services/httpInterceptors.ts)

### 1.4.5 Storage Rules
**Allowed storage**
- UI preferences
- selected language
- theme
- non-sensitive temporary UI state

**Forbidden storage**
- access tokens
- refresh tokens
- passwords
- one-time tokens
- raw permission payloads if sensitive

**Preferred storage model**
- backend session stored in secure, HTTP-only, same-site cookies
- frontend session state kept in memory through SessionProvider

**Examples**
```ts
// Allowed: non-sensitive preferences
localStorage.setItem("theme", "dark");
localStorage.setItem("language", "en");

// Forbidden: secrets
// localStorage.setItem("accessToken", token);
// localStorage.setItem("password", password);
```

**Enforcement**
- Keep authentication credentials in backend-managed secure cookies only.
- Clear in-memory session data on logout and on 401 responses.
- Review pull requests for any usage of `localStorage` or `sessionStorage` with sensitive keys.

### 1.4.6 Logout
Responsibilities:
- call backend logout endpoint
- clear session provider state
- clear sensitive in-memory data
- redirect to login

[useLogout.ts](/src/components/hooks/useLogout.ts)

### 1.4.7 Session Expiration

When backend returns 401 Unauthorized:
- interceptor must detect it
- sessionManager clears session state
- user is redirected to login
- user sees a session expired message

## 1.5 Layered design

The frontend uses a five-layer architecture with clear responsibilities and downward-only dependencies through hooks and services.

**Architecture diagram:**

![Frontend Layers](/media/Diagrama-5-Capas.png)


**Layer 1 - Presentation:** UI components (primitives, composites, layouts, feature pages) render data and capture input. They do not call APIs directly. AppRouter and route guards protect navigation.

**Layer 2 - Application:** Hooks orchestrate validation, service calls, and state updates. Standard flow: validate input -> call service -> update infrastructure (session, permissions).

**Layer 3 - Domain Logic:** Zod schemas validate input. Permission checks use `usePermissions()`, not direct role comparisons. Policies define roles and permissions.

**Layer 4 - Services:** Facades and source clients in [client.ts](/src/services/client.ts), auth operations in [authService.ts](/src/auth/authService.ts), and strategy/proxy/reporting modules handle backend communication and processing seams.

**Layer 5 - Infrastructure:** Shared foundation: `SessionProvider`, design tokens, i18n, observability, and utilities.

**Folder mapping:**

| Folder | Layers | Purpose |
|--------|--------|---------|
| `src/components/` | Layer 1 | UI components (atoms/molecules/organisms/pages) |
| `src/routes/` | Layer 1 | Route composition and guarded navigation |
| `src/auth/guards/` | Layer 1 | Routing guards (AuthGuard, GuestGuard, PolicyGuard) |
| `src/components/hooks/` | Layer 2 | Application orchestration hooks |
| `src/auth/policies/`, `src/models/` | Layer 3 | Domain access rules and shared schemas/types |
| `src/services/`, `src/auth/authService.ts` | Layer 4 | HTTP facade, auth service, interceptors, strategy/proxy/reporting modules |
| `src/state/`, `src/components/styles/`, `src/components/i18n/`, `src/utils/` | Layer 5 | Session/state stores, design system, localization, utilities |

**Dependency rules:**

- Presentation can only call Application (hooks) and Infrastructure.
- Application can call Domain Logic, Services, and Infrastructure.
- Domain Logic can only use Infrastructure.
- Services can only use Infrastructure.
- **No layer may call upward.**

Common violations: primitive components importing services, services using React state, feature pages calling `fetch` directly, hooks checking `user.role === "admin"` instead of `usePermissions()`.

**Example: Login flow**

`useLogin()` -> `useApplicationServices().auth.login()` -> `authService.login()` -> `httpClientFacade.fetch("/api/auth/login")` -> `authService.getCurrentSession()` -> `sessionManager.setSession()` -> `SessionProvider` update.

**Example: DUA generation flow**

`GenerationProgressPage` -> `useDuaGeneration().startGeneration()` -> `generationManager.startGeneration()` -> `generationProgressStore.patchState(...)` -> `useGenerationProgress()` subscription update -> progress UI render.

## 1.6 Design patterns

### Singleton
The following classes currently use singleton pattern:
- [logger.ts](/src/utils/logger.ts)
  - `ConsoleLogStrategy`
  - `RemoteLogStrategy`
  - `Logger`
- [error-handler.ts](/src/utils/error-handler.ts)
  - `ErrorHandler`
- [authService.ts](/src/auth/authService.ts)
  - `AuthService`
- [sessionManager.ts](/src/state/sessionManager.ts)
  - `SessionManager`
- [generationProgressStore.ts](/src/state/generationProgressStore.ts)
  - `GenerationProgressStore`
- [generationManager.ts](/src/state/generationManager.ts)
  - `GenerationManager`
- [client.ts](/src/services/client.ts)
  - `DefaultHttpClientFacade`
- [authService.ts](/src/auth/authService.ts)
  - `DefaultAuthServiceFacade`
- [applicationFacade.ts](/src/services/applicationFacade.ts)
  - `DefaultApplicationServiceFacade`

#### When to apply here
Apply only if all are true:

1. One shared instance is desired app-wide.
2. Behavior must stay consistent across all consumers.
3. Class should not be recreated with different runtime config per feature.

#### Do not apply here

Skip singleton for:

- Error objects (`*Error` classes): create per error event.
- React components (`*.tsx` class components): React manages lifecycle.
- Per-operation mutable workers (report formatters/generators with internal buffers).
- Classes expected to be composed with different options in tests/features (for example semantic analyzer implementations).
- `SourceHttpClient`: managed as per-source registry (multiton), not one global instance.

#### Implementation recipe

For a candidate class, implement this exact structure:

```ts
export class MyService {
  private static instance: MyService | null = null;

  static getInstance() {
    if (!MyService.instance) {
      MyService.instance = new MyService();
    }
    return MyService.instance;
  }

  private constructor() {}

  // existing methods...
}

export const myService = MyService.getInstance();
```

#### If constructor currently takes dependencies

Use lazy default dependencies inside `getInstance()` and keep one public exported instance.

```ts
static getInstance(dep: Dep = defaultDep) {
  if (!X.instance) {
    X.instance = new X(dep);
  }
  return X.instance;
}
```

#### Migration steps for a new class

1. Add `private static instance` field.
2. Add `static getInstance(...)`.
3. Make constructor `private`.
4. Replace exported `new ClassName(...)` with `ClassName.getInstance(...)`.
5. Keep existing exported constant name to avoid call-site churn.

#### Quick checks before finishing

Run:

```powershell
rg -n "new ClassName\(" src -S
```

Expected: only the `new ClassName(...)` inside `getInstance()` remains.

Also verify no existing consumers were forced to import the class directly when they were using the exported instance constant.


### Observer
Use these files as the canonical pattern:

- [generation.types.ts](/src/state/generation.types.ts)
- [generationProgressStore.ts](/src/state/generationProgressStore.ts)
- [generationManager.ts](/src/state/generationManager.ts)
- [useGenerationProgress.ts](/src/components/hooks/useGenerationProgress.ts)
- [useDuaGeneration.ts](/src/components/hooks/useDuaGeneration.ts)
- [GenerationProgressPage.tsx](/src/components/pages/GenerationProgressPage.tsx)

#### 1) State Contract (`*.types.ts`)

Define:

- Progress phases
- Run state (`idle`, `running`, `completed`, etc.)
- Progress snapshot shape
- `createInitial...State()` factory

Rule: keep this file purely declarative (types + initializer).

#### 2) Observable Store (`*Store.ts`)

Must expose:

- `getState()`
- `subscribe(listener) => unsubscribe`
- `setState(next)`
- `patchState(partial)`
- `reset()`

Rule: listeners are stored in a `Set`, and `subscribe` must emit current state immediately.

#### 3) Manager/Publisher (`*Manager.ts`)

Must expose:

- `start...()` to begin async work
- `cancel...()` (optional but recommended)
- `subscribe(...)` pass-through to store
- `get...Snapshot()` pass-through to store

Rule: start work asynchronously (`void this.run...()`) so UI thread is not blocked.

Business logic methods should be isolated and replaceable:

- `prepare...()` placeholder
- `persist...()` placeholder

#### 4) Subscriber Hook (`use...Progress.ts`)

Hook responsibilities:

- seed state from manager snapshot
- subscribe on mount
- unsubscribe on unmount
- return current state only

Rule: no business logic inside subscriber hook.

#### 5) Action Hook (`use...Generation.ts` or similar)

Hook responsibilities:

- expose `start...()` / `cancel...()`
- hold local start/cancel errors and loading flags
- delegate execution to manager

Rule: this hook is orchestration-facing, not rendering-facing.

#### 6) View Component

Responsibilities:

- read progress from subscriber hook
- trigger actions via action hook
- render status/progress/errors

Rule: no direct service/store calls in view.

#### Reuse Steps For New Flows

When implementing another long-running workflow (example: import, analysis, export):

1. Copy and rename the 3 state files (`types`, `store`, `manager`).
2. Replace phase names and status texts.
3. Keep the same observer API (`subscribe/getState/patchState`).
4. Create two hooks:
   - one subscriber hook (`useXProgress`)
   - one action hook (`useXActions` or `useXGeneration`)
5. Wire a page/view to those hooks only.
6. Replace placeholder methods with real business logic later.

#### Minimal Agent Checklist

Before marking work complete, ensure:

- [ ] Store has unsubscribe support.
- [ ] `subscribe` emits snapshot immediately.
- [ ] Manager starts async work without blocking render.
- [ ] Progress updates are pushed through store (not polled in view).
- [ ] Hooks are the only interface used by UI.
- [ ] Placeholders are isolated for future real logic.

#### Agent Copy Template

```ts
// store
type Listener<T> = (state: T) => void;
class XStore {
  private listeners = new Set<Listener<XState>>();
  private state: XState = createInitialXState();
  getState() { return this.state; }
  subscribe(listener: Listener<XState>) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }
  patchState(partial: Partial<XState>) {
    this.state = { ...this.state, ...partial };
    for (const listener of this.listeners) listener(this.state);
  }
}
```

```ts
// manager
async function startX() {
  store.patchState({ runState: "running" });
  void runXAsync(); // non-blocking kickoff
}
```

```ts
// progress hook
function useXProgress() {
  const [state, setState] = useState(() => manager.getSnapshot());
  useEffect(() => manager.subscribe(setState), []);
  return state;
}
```

### Proxy
[semantic](/src/services/semantic)
- [SemanticAnalyzer.ts](/src/services/semantic/SemanticAnalyzer.ts)
  - Interface: `SemanticAnalyzer`
  - Method: `calculateSimilarity(input) => Promise<SemanticSimilarityResult>`
- [RealSemanticAnalyzer.ts](/src/services/semantic/RealSemanticAnalyzer.ts)
  - Class: `RealSemanticAnalyzer implements SemanticAnalyzer`
  - Optional constructor dependency: `EmbeddingProvider`
- [SemanticAnalyzerProxy.ts](/src/services/semantic/SemanticAnalyzerProxy.ts)
  - Class: `SemanticAnalyzerProxy implements SemanticAnalyzer`
  - Extra methods: `getMetrics()`, `clearCache()`
- [index.ts](/src/services/semantic/index.ts)
  - Barrel exports for all public types/classes

#### How to use in other classes
1. Depend on the interface (`SemanticAnalyzer`).
2. Inject one shared analyzer instance (use proxy in runtime).
3. Call `calculateSimilarity` for each `(chunk, section)` pair.

```ts
import type { SemanticAnalyzer, SemanticSectionProfile } from "./semantic";

export class ChunkClassifier {
  constructor(private readonly analyzer: SemanticAnalyzer) {}

  async bestMatch(chunkId: string, chunkText: string, sections: SemanticSectionProfile[]) {
    let best: { sectionId: string; score: number } | null = null;

    for (const section of sections) {
      const r = await this.analyzer.calculateSimilarity({ chunkId, chunkText, section });
      if (!best || r.score > best.score) best = { sectionId: r.sectionId, score: r.score };
    }

    return best;
  }
}
```

Composition root (create once, reuse):

```ts
import { RealSemanticAnalyzer, SemanticAnalyzerProxy } from "./semantic";

const semanticAnalyzer = new SemanticAnalyzerProxy(new RealSemanticAnalyzer(), {
  enableLogging: true,
});

// inject semanticAnalyzer into services/classes that need similarity
```

#### How to replicate this module in another project

1. Create folder: [semantic](/src/services/semantic).
2. Add [SemanticAnalyzer.ts](/src/services/semantic/SemanticAnalyzer.ts) with only:
   - input types (`chunkId`, `chunkText`, `section`)
   - result type (`chunkId`, `sectionId`, `score`, `source`)
   - interface method `calculateSimilarity(...)`
3. Add [RealSemanticAnalyzer.ts](/src/services/semantic/RealSemanticAnalyzer.ts):
   - implements `SemanticAnalyzer`
   - keep real model call isolated here
4. Add [SemanticAnalyzerProxy.ts](/src/services/semantic/SemanticAnalyzerProxy.ts):
   - constructor receives `SemanticAnalyzer`
   - cache key = chunk + section + semantic fingerprint
   - on hit: return cached value with `source: "cache"`
   - on miss: call real analyzer, cache result, return it
   - include `getMetrics()` and `clearCache()`
5. Add [index.ts](/src/services/semantic/index.ts) barrel exports.
6. Wire once in bootstrap/composition root and inject interface everywhere.

#### Minimal contract to keep stable

Do not break these unless you migrate all callers:

- Interface name: `SemanticAnalyzer`
- Method name: `calculateSimilarity`
- Result fields: `chunkId`, `sectionId`, `score`, `source`
- Proxy utility methods: `getMetrics`, `clearCache`

#### Testing guidance

- Unit tests for callers should use a fake `SemanticAnalyzer` (not the real class).
- Proxy tests should verify:
  - first call is miss + model call
  - repeated call is hit + no extra model call
  - metrics counters update correctly

#### Notes for replacing placeholder AI logic

When integrating a real AI provider, update only `RealSemanticAnalyzer` (or its `EmbeddingProvider`).
Keep proxy and callers unchanged.



### Reporting Bridge
Use this module when you need the same report writer to produce multiple output formats.

#### What to use
Import from:

```ts
import {
  DuaTemplateReportGenerator,
  WordOutputFormatter,
  PdfOutputFormatter,
  HtmlOutputFormatter,
  type OutputFormatter,
} from "@/services/reporting";
```

#### Required flow in caller classes

1. Map source data into `templateData`.
2. Choose formatter (`word` | `pdf` | `html`).
3. Create `DuaTemplateReportGenerator(formatter)`.
4. Call `generate({ reportTitle, templateData })`.
5. Return/store the generated output.

#### Reference integration

```ts
import {
  DuaTemplateReportGenerator,
  HtmlOutputFormatter,
  PdfOutputFormatter,
  WordOutputFormatter,
  type OutputFormatter,
} from "@/services/reporting";

type OutputKind = "word" | "pdf" | "html";

export class ReportApplicationService {
  generateDuaReport(output: OutputKind, templateData: unknown) {
    const formatter = this.createFormatter(output);
    const generator = new DuaTemplateReportGenerator(formatter);

    return generator.generate({
      reportTitle: "DUA generado",
      templateData,
    });
  }

  private createFormatter(output: OutputKind): OutputFormatter {
    if (output === "word") return new WordOutputFormatter();
    if (output === "pdf") return new PdfOutputFormatter();
    return new HtmlOutputFormatter();
  }
}
```

#### How to replicate for another report type

Create a new generator class in this folder, extending `ReportGenerator` and implementing only `buildSections`:

```ts
import { ReportGenerator } from "./ReportGenerator";
import type { ReportSection } from "./OutputFormatter";

export class AnotherTemplateReportGenerator extends ReportGenerator {
  protected buildSections(templateData: unknown): ReportSection[] {
    // Placeholder or real mapping logic
    return [
      { id: "s1", title: "Section 1", body: "TODO" },
    ];
  }
}
```

Then reuse existing formatters, or add a new formatter implementation.

#### How to add a new output format

1. Add a formatter file implementing `OutputFormatter`.
2. Add new format literal to `OutputFormat` in `OutputFormatter.ts`.
3. Export the formatter in `index.ts`.
4. Add selection logic in caller service (`createFormatter`).

Minimal formatter template:

```ts
import type { GeneratedOutput, OutputFormatter, ReportSection } from "./OutputFormatter";

export class MarkdownOutputFormatter implements OutputFormatter {
  private parts: string[] = [];

  startDocument(reportTitle: string): void {
    this.parts = [`# ${reportTitle}`];
  }

  writeSection(section: ReportSection): void {
    this.parts.push(`## ${section.title}`);
    this.parts.push(section.body);
  }

  finalizeDocument(): GeneratedOutput {
    return {
      format: "markdown",
      content: this.parts.join("\n\n"),
    };
  }
}
```

#### Current placeholders
- `DuaTemplateReportGenerator.buildSections(...)` contains placeholder mapping logic.
- Output formatters currently return string content placeholders (no real Word/PDF engine yet).

### Strategy (Unauthorized Handling)
This file explains how to reuse the strategy-based unauthorized/session protection implementation.

#### Reference files

- [httpInterceptors.ts](/src/services/httpInterceptors.ts)
- [unauthorizedHandlingStrategy.ts](/src/services/unauthorizedHandlingStrategy.ts)

- Fixed:
  - Consumers still call `interceptHttpResponse(...)` the same way.
  - `handleUnauthorized` option still gates 401 handling.
- Swappable:
  - 401 unauthorized behavior is resolved through a strategy (`UnauthorizedHandlingStrategy`).

#### Contract to follow

Implement this interface:

```ts
export interface UnauthorizedHandlingStrategy {
  readonly name: string;
  shouldHandle(input: UnauthorizedHandlingInput): boolean;
  handle(input: UnauthorizedHandlingInput): void;
}
```

#### Current default strategy (HTTP-only cookie flow)

- Class: `HttpOnlyCookieUnauthorizedHandlingStrategy`
- Behavior:
  - Skips auth bootstrap endpoints (`/api/auth/login|refresh|forgot-password|reset-password`)
  - Calls `sessionManager.handleUnauthorized()`
- This preserves the existing cookie-based session flow.

#### How to add a new mechanism

1. Create a new class implementing `UnauthorizedHandlingStrategy` in `src/services/unauthorizedHandlingStrategy.ts` (or a sibling strategy file).
2. Keep `shouldHandle(...)` and `handle(...)` methods, even if logic is placeholder at first.
3. Register globally when needed:

```ts
setUnauthorizedHandlingStrategy(new YourUnauthorizedHandlingStrategy());
```

4. Optional per-call override (without changing existing consumers):

```ts
interceptHttpResponse(response, request, {
  handleUnauthorized: true,
  unauthorizedStrategy: new YourUnauthorizedHandlingStrategy(),
});
```

#### Minimal template for future strategies

```ts
class YourUnauthorizedHandlingStrategy implements UnauthorizedHandlingStrategy {
  readonly name = "your-strategy-name";

  shouldHandle({ request }: UnauthorizedHandlingInput) {
    // placeholder
    return true;
  }

  handle({ request }: UnauthorizedHandlingInput) {
    // placeholder
  }
}
```

#### Guardrails for agents

- Do not call `sessionManager.handleUnauthorized()` directly from `httpInterceptors.ts`.
- Keep 401 decision + execution inside strategy methods.
- Keep the default strategy as HTTP-only cookie session behavior.
- Add new behavior by adding/replacing strategy implementations, not by changing interceptor consumers.

### Facade Pattern Runbook (Hooks -> Auth + HTTP)
Expose a single service access surface for hooks while keeping auth and HTTP implementation details behind facades.

#### Files to keep aligned

- [client.ts](/src/services/client.ts)
- [authService.ts](/src/auth/authService.ts)
- [applicationFacade.ts](/src/services/applicationFacade.ts)
- [useApplicationServices.ts](/src/components/hooks/useApplicationServices.ts)
- [useLogin.ts](/src/components/hooks/useLogin.ts)
- [useLogout.ts](/src/components/hooks/useLogout.ts)

#### Contracts

1. HTTP facade contract [client.ts](/src/services/client.ts)
```ts
export interface HttpClientFacade {
  fetch(input: string, init?: RequestInit): Promise<Response>;
  authFetch(input: string, init?: RequestInit): Promise<Response>;
  json<T>(input: string, init?: RequestInit): Promise<T>;
  authJson<T>(input: string, init?: RequestInit): Promise<T>;
  // source/external helpers as needed
}
```

2. Auth facade contract [authService.ts](/src/auth/authService.ts)
```ts
export interface AuthServiceFacade {
  login(input: LoginInput): Promise<AuthSession | null>;
  logout(): Promise<void>;
  refreshSession(): Promise<AuthSession | null>;
  requestPasswordReset(email: string, redirectTo?: string): Promise<void>;
  resetPassword(accessToken: string, refreshToken: string, newPassword: string): Promise<void>;
  getCurrentSession(): Promise<AuthSession | null>;
  isAuthServiceError(reason: unknown): reason is AuthServiceError;
  isNoTenantAccessError(reason: unknown): reason is NoTenantAccessError;
  toErrorMessage(reason: unknown, fallbackMessage?: string): string;
}
```

3. App facade contract [applicationFacade.ts](/src/services/applicationFacade.ts)
```ts
export interface ApplicationServiceFacade {
  readonly auth: AuthServiceFacade;
  readonly http: HttpClientFacade;
}
```

#### Implementation Steps

1. In [client.ts](/src/services/client.ts), keep low-level source client behavior intact, add `HttpClientFacade`, and export a singleton (`httpClientFacade`).
2. Keep legacy function exports (`apiFetch`, `authFetch`, etc.) but make them delegate to `httpClientFacade` for backward compatibility.
3. In [authService.ts](/src/auth/authService.ts), replace direct low-level client imports with `httpClientFacade`.
4. Add `AuthServiceFacade` + singleton (`authServiceFacade`) that delegates to `authService` and centralizes auth error guards.
5. Add [applicationFacade.ts](/src/services/applicationFacade.ts) that composes `authServiceFacade` and `httpClientFacade`.
6. Add [useApplicationServices.ts](/src/components/hooks/useApplicationServices.ts) and return the app facade singleton.
7. Update hooks to consume `useApplicationServices()` instead of importing auth/http services directly.

#### Placeholder Rule

When adding a new operation, add it to the relevant facade interface first, then implement a passthrough or placeholder body (`Promise.resolve(...)`) until business logic is ready.

#### Checklist for New Agents

- Hooks import only `useApplicationServices` for service access.
- `authService.ts` only uses HTTP via `httpClientFacade`.
- [client.ts](/src/services/client.ts) exposes one facade entrypoint and keeps legacy helpers as delegates.
- New domains are added by extending facades, not by importing low-level clients in hooks.


### Not implemented (pending)
- Use Builder Pattern and Strategy Pattern to create and compose heterogeneous DUA document processors (docx, xlsx, pdf, jpg, png) from application hooks, centralizing format-processing abstractions and keeping UI orchestration in [src/components/hooks](/src/components/hooks).
  ```ts
  interface ProcessorStrategy {
    process(file: File): Promise<Record<string, string>>;
  }

  class ProcessorBuilder {
    constructor(private strategy: ProcessorStrategy) {}
    async run(file: File) { return this.strategy.process(file); }
  }
  ```

- Use Adapter Pattern for Word document field replacement by format type (ParagraphAdapter, TableAdapter, LabelAdapter, AmountAdapter) in the backend document-generation service, since this concern is not currently implemented in frontend services.
  ```ts
  interface FieldAdapter { extract(input: unknown): Record<string, string>; }
  class ParagraphAdapter implements FieldAdapter { extract(input) { return {}; } }
  class TableAdapter implements FieldAdapter { extract(input) { return {}; } }
  ```

## 1.7 src folder

The `/src` folder contains the application scaffold organized by architectural layers and functional domains, following the 5-layer architecture specified in sections 1.1 to 1.6.

```text
src
├── AppProviders.tsx
├── main.tsx
├── auth/
│   ├── auth-schemas.ts
│   ├── AuthProvider.tsx
│   ├── authService.ts
│   ├── guards/
│   │   ├── AuthGuard.tsx
│   │   ├── GuestGuard.tsx
│   │   └── PolicyGuard.tsx
│   └── policies/
│       ├── accessPolicy.ts
│       ├── permissions.ts
│       ├── rolePermissions.ts
│       └── roles.ts
├── components/
│   ├── atoms/
│   │   ├── ImageWithFallback.tsx
│   │   ├── language-switcher.tsx
│   │   ├── theme-switcher.tsx
│   │   └── ui/
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── input-otp.tsx
│   │       └── ... (additional shadcn/ui components)
│   ├── hooks/
│   │   ├── useApplicationServices.ts
│   │   ├── useDuaGeneration.ts
│   │   ├── useGenerationProgress.ts
│   │   ├── useLogin.ts
│   │   ├── useLogout.ts
│   │   ├── usePermissions.ts
│   │   ├── usePolicies.ts
│   │   ├── useSession.ts
│   │   └── useTheme.ts
│   ├── i18n/
│   │   ├── config.ts
│   │   ├── I18nProvider.tsx
│   │   ├── en.json
│   │   └── es.json
│   ├── molecules/
│   │   ├── app-error-boundary.tsx
│   │   └── info-banner.tsx
│   ├── organisms/
│   │   ├── homePageLayout.css
│   │   └── homePageLayout.tsx
│   ├── pages/
│   │   └── GenerationProgressPage.tsx
│   └── styles/
│       ├── breakpoints.ts
│       ├── globals.css
│       ├── theme.ts
│       ├── ThemeProvider.tsx
│       └── tokens.ts
├── models/
│   ├── app-error.ts
│   ├── common-schemas.ts
│   └── loginRequest-schema.ts
├── routes/
│   ├── AppRouter.tsx
│   └── routeConfig.ts
├── services/
│   ├── applicationFacade.ts
│   ├── client.ts
│   ├── httpInterceptors.ts
│   ├── unauthorizedHandlingStrategy.ts
│   ├── reporting/
│   │   ├── DuaTemplateReportGenerator.ts
│   │   ├── HtmlOutputFormatter.ts
│   │   ├── OutputFormatter.ts
│   │   ├── PdfOutputFormatter.ts
│   │   ├── ReportGenerator.ts
│   │   ├── WordOutputFormatter.ts
│   │   └── index.ts
│   └── semantic/
│       ├── RealSemanticAnalyzer.ts
│       ├── SemanticAnalyzer.ts
│       ├── SemanticAnalyzerProxy.ts
│       └── index.ts
├── state/
│   ├── generation.types.ts
│   ├── generationManager.ts
│   ├── generationProgressStore.ts
│   ├── session.types.ts
│   ├── sessionManager.ts
│   ├── SessionProvider.tsx
│   └── sessionStore.ts
└── utils/
    ├── error-handler.ts
    ├── logger.ts
    ├── schemaValidator.ts
    └── sessionManager.ts
```

# 2. Backend Design

## Technology Stack
- API style: REST API over HTTPS
- API specification standard: OpenAPI
- API gateway and hosting: Azure API Management + Azure App Service
- Database: Azure SQL Database
- File storage: Azure Blob Storage
- Asynchronous operations and notifications: Azure Notification Hubs
- Load balancing: no dedicated load balancer required for the expected traffic profile
- Backend framework and language: .NET SDK 10.0.102, ASP.NET Core
- Repository structure: monorepo shared with the frontend; backend folder: `duabusiness`
- Testing: xUnit for unit and integration tests
- API documentation tooling: Swagger / OpenAPI tooling for contract publication and validation
- Code quality: `dotnet format` and built-in .NET analyzers
- Services:
  - Authentication service
  - Document upload service
  - DUA generation orchestration service
  - Notification service
  - Result download service

## Security
- Transport security: HTTPS enforced at Azure API Management for all public endpoints
- Authentication:
  - Username, password, and OTP are validated server-side
  - After successful credential and OTP validation, the backend issues JWT bearer tokens
  - JWT signing algorithm: RS256
  - JWT tokens are required for all protected endpoints
- Encryption at rest:
  - Azure SQL Database uses Transparent Data Encryption (TDE) with service-managed keys
  - Reference: https://learn.microsoft.com/en-us/azure/azure-sql/database/security-overview?view=azuresql#transparent-data-encryption-encryption-at-rest-with-service-managed-keys
- Request payload limits:
  - General API payload limit: 10 MB
  - File upload endpoints exception: up to 100 MB per request to support realistic DUA document sets with multiple PDF, Excel, Word, and scanned image files
  - Requests above these limits must be rejected with a clear validation error
- Rate limiting at Azure API Management:
  - Maximum concurrent connections per authenticated client: 10
  - Request rate limit per authenticated client: 60 requests per minute
  - Stricter limits may be applied to authentication endpoints to reduce abuse risk
- Data retention and archiving:
  - Production operational data and generated files remain in the active production environment for 90 days
  - After 90 days, records and generated artifacts are moved to an archive tier for audit and traceability purposes
  - Archived data is retained according to institutional or customs compliance requirements

## Observability
- Telemetry platform: Azure Application Insights, aligned with the frontend for unified end-to-end telemetry
- Dashboard and analysis tool: Azure Monitor
- Logged backend events:
  - AuthLoginRequested
  - AuthLoginSucceeded
  - AuthLoginFailed
  - OtpValidationSucceeded
  - OtpValidationFailed
  - UserLoggedOut
  - FileUploadStarted
  - FileUploadCompleted
  - FileUploadRejected
  - SupportedFilesValidated
  - DuaTemplateUploadStarted
  - DuaTemplateValidated
  - DuaGenerationRequested
  - DuaGenerationQueued
  - DuaGenerationStarted
  - DocumentParsingStarted
  - DocumentParsingCompleted
  - DataExtractionCompleted
  - DataExtractionFailed
  - FieldMappingCompleted
  - FieldMappingFailed
  - DuaDocumentGenerated
  - DuaGenerationCompleted
  - DuaGenerationFailed
  - NotificationDispatched
  - ProgressStatusTransitionLogged
  - GeneratedDuaPreviewRequested
  - GeneratedDuaDownloaded
  - ApiRequestFailed
  - UnhandledExceptionCaptured
- Progress polling guideline: do not log every frontend polling request; log only meaningful status transitions and exceptional progress-check failures

### Operational metrics (required)
- Latency metrics: at minimum P95/P99 per API endpoint and critical business flow.
- Error metrics: request error rate (4xx/5xx), dependency failure rate, and timeout rate.
- Saturation metrics: CPU/memory utilization, queue depth/age, and worker concurrency saturation.
- Monitoring stack options:
  - Self-managed: Prometheus + Grafana.
  - Managed: Azure Monitor.

### Application observability patterns (required)
- Health checks: implement `liveness` and `readiness` endpoints for API and workers.
- Correlation IDs: propagate a single correlation ID across all services, async messages, logs, traces, and domain events.
- SLIs defined from design: availability and latency SLIs must be defined at architecture stage for each critical user flow.


## Infrastructure (DevOps)

### CI/CD orchestration tool
- Standard tool: **Azure DevOps Pipelines** (single CI/CD control plane from this monorepo).
- Rationale: repository-native workflows, PR checks, environments, approvals, and strong Azure integration.

### Infrastructure as Code (IaC)
- Standard tool: **Terraform** for provisioning and updates across environments.
- Managed resources via Terraform:
- Azure API Management
- Azure App Service (API hosting)
- Azure SQL Database
- Azure Blob Storage
- Azure Notification Hubs
- Observability resources (Application Insights / Azure Monitor where applicable)

### Environments and deployment model
- Environments: `dev`, `stage`, `prod` (isolated by resource group and/or subscription).
- Deployment pattern:
- `dev`: automatic deployment on merge to `develop`.
- `stage`: automatic deployment from `main` after CI success.
- `prod`: manual approval + protected environment gate.
- Application deployment target: **Azure App Service** (no Kubernetes required for current scope).
- Production release strategy: deployment slots (`staging` -> `production`) with slot swap and rollback.

### Pipeline structure (recommended)
- `ci-frontend`: install, lint, test, build frontend.
- `ci-backend`: restore, build, test backend (.NET), run static analysis/format checks.
- `security-scan`: dependency/license checks and secret scanning.
- `infra-plan`: `terraform fmt` + `terraform validate` + `terraform plan` per environment.
- `deploy-dev` / `deploy-stage` / `deploy-prod`: apply infra changes (as approved) and deploy application artifacts.

### Governance and quality gates
- Required PR checks before merge: frontend CI, backend CI, security scan.
- Protected branches: `main` and release branches.
- Environment approvals required for `prod`.
- Artifact/version traceability required per deployment (commit SHA, build ID, release timestamp).

## Availability
99.99% uptime = 0.01% downtime per year = 52.56 minutes/year (≈ 0.876 hours/year)

### Resilience patterns (required)
- Circuit breaker per downstream dependency (SQL, Blob, Notification Hubs, external APIs) to fail fast when an integration is unhealthy and protect API latency.
- Timeouts + retries with exponential backoff (and jitter) for transient failures; retries only for idempotent operations or operations protected with idempotency keys.
- Bulkhead isolation so one slow dependency cannot collapse the full API: separate connection pools, bounded concurrency, and isolated worker/queue paths by integration.

### Controlled degradation (required)
- Feature flags to disable non-critical capabilities quickly (notifications, advanced enrichments, non-essential validations) while preserving core transaction flows.
- Partial responses when optional downstream data is unavailable; return available data + explicit `partial=true` and error details per missing section.
- Absorption queues (outbox + async processing) for burst traffic and slow dependencies to decouple request handling from eventual side effects.

With the most recent official SLA (April 8, 2026) for your stack:

|Component	| SLA | Maximum theoretical downtime/year|
|-----------|-----|--------------------------|
|Azure API Management |	99.99% (Premium multi-region)	| 4.38 h / 0.876 h|
|Azure App Service	| 99.99% (with 2+ AZ) | 4.38 h / 0.876 h|
|Azure SQL Database	| 99.99% (no zone-redundant) / 99.995% (zone-redundant)	| 0.876 h / 0.438 h|
|Azure Blob Storage	| 99.9% write hot; 99.99% read RA-GRS/RA-GZRS (depends on tier/redundancy) | 8.76 h / 0.876 h|
|Azure Notification Hubs | 99.9% | 8.76 h|

### Single points of failure (SPOF)
- APIM in a single region or tier without multi-region.
- App Service without Availability Zones.
- SQL without zone redundancy + regional failover.
- Blob in the synchronous write path (99.9% typical for write hot).
- Notification Hubs if treated as a critical path of the transaction.

### Recovery/mitigation for what doesn't provide 99.99% "by default"
- APIM: use Premium with multi-region deployment and failover.
- App Service: deploy across 2+ Availability Zones (ideally with a regional DR strategy).
- SQL: zone-redundant + auto-failover group regional.
- Blob: RA-GZRS/RA-GRS, retries with backoff, and decouple writing with asynchronous processing.
- Notification Hubs: avoid blocking the main flow; use outbox + retries + DLQ + alternate channel (email/SMS) for incidents.

## Scalability

### 1) Scaling model and expected bottlenecks
- Expected bottlenecks by workload:
  - Upload path: network throughput, Blob write throughput, and request concurrency limits.
  - Generation path: CPU/memory for parsing/extraction and queue backlog under peak load.
  - Persistence path: Azure SQL write contention, query latency, and connection pool saturation.
  - Notification path: burst throughput limits in Notification Hubs.

### 2) Stateless application tier and session strategy
- API layer in Azure App Service must remain stateless to allow safe horizontal scaling.
- Primary auth model: JWT bearer tokens, minimizing server-side session coupling.
- If server-side session/state is required (revocation lists, workflow locks, short-lived coordination), use external state store: Azure Cache for Redis.
- JWT-only: simpler scale-out, but harder immediate revocation and token invalidation semantics.

### 3) Heavy processing via queues and workers
- Long-running/CPU-heavy operations (document normalization, parsing, extraction, rendering) must execute asynchronously outside request threads.
- Azure Service Bus + Azure Functions (or dedicated worker service on App Service).
- Queue design requirements: idempotency key per job, retry policy with backoff, dead-letter queue, poison message handling, and replay procedure.

### 4) Data scaling: partitioning and sharding evolution path
- Start with a single Azure SQL logical model optimized with indexing and query tuning.
- Introduce partitioning strategy before saturation (for example by organization/tenant and time window).
- Move cold/history-heavy data to archive models to protect hot-path performance.
- Keep large binaries in Blob Storage and only metadata/references in SQL to reduce database growth pressure.

### 5) Caching and edge distribution
- Use Azure Cache for Redis for high-read metadata, short-lived coordination state, and optional token/session support.
- Use response caching only for safe/idempotent GET operations with explicit TTL and invalidation rules.
- Use CDN/edge (Azure Front Door/CDN) for static assets and, where safe, edge caching of public or explicitly cacheable GET responses.
- Cache governance must define: cache keys, TTLs, invalidation triggers, and stale-data tolerance per endpoint.

### 6) Auto-scaling and cost guardrails
- Auto-scaling policies must be driven by combined metrics, not only CPU:
- CPU/memory, RPS, P95/P99 latency, queue length/age, and SQL pressure indicators.
- Define per-environment min/max instance limits to prevent uncontrolled spend.
- Define protective limits and backpressure behavior (429/rate limiting/queue admission control) when max capacity is reached.
- Add budget and anomaly alerts tied to scaling events, queue growth, and database throughput thresholds.

## Backend key workflows 
### Upload files to generate dua
1. Client sends metadata for the selected files (name, size, mime type, checksum) and the target generation session.
2. Backend validates authentication/authorization (`files.upload`) and enforces request-size/rate limits in APIM.
3. Backend validates supported file types and rejects unsupported/oversized files with per-file errors.
4. Backend opens streaming upload (multipart/chunked) and processes files sequentially or in bounded parallelism.
5. For each file, backend writes the binary stream directly to Azure Blob Storage (no full file buffering in memory).
6. Backend computes/stores checksum, detects duplicates, and records upload status (`started`, `completed`, `rejected`) in Azure SQL.
7. Backend persists file metadata and blob reference (container, blob path, ETag/version, owner, upload timestamp).
8. Backend returns a summary response with accepted/rejected files and emits telemetry events (`FileUploadStarted`, `FileUploadCompleted`, `FileUploadRejected`).

### Setup dua template
1. Client uploads or selects the DUA template for the active generation session (`dua.template.upload`).
2. Backend validates template format/version (expected `.docx` structure and mandatory placeholders/fields).
3. Backend stores template artifact in Azure Blob Storage and creates/updates template metadata in Azure SQL.
4. Backend runs schema/field integrity checks and returns validation findings (blocking errors and warnings).
5. Backend marks template status as `valid` or `invalid` and emits telemetry (`DuaTemplateUploadStarted`, `DuaTemplateValidated`).

### Start dua generation
1. Client requests generation with selected uploaded files + validated template (`dua.generate`).
2. Backend verifies prerequisites: at least one valid source file, valid template, active session, and user permissions.
3. Backend creates a generation record in Azure SQL with status `queued` and a correlation ID.
4. Backend enqueues an asynchronous generation job (or background task trigger) and returns `202 Accepted` with `generationId`.
5. Backend emits telemetry (`DuaGenerationRequested`, `DuaGenerationQueued`).

### Execute generation pipeline (async worker)
1. Worker dequeues `generationId`, acquires lock/idempotency token, and transitions state to `running`.
2. Worker downloads required files/template from Blob and normalizes input formats (PDF, DOCX, XLSX, images/OCR outputs).
3. Worker parses documents and extracts semantic/business data.
4. Worker maps extracted values into canonical DUA domain fields and runs business validation rules.
5. Worker applies mapped values to the DUA template, generates output document(s), and stores artifacts in Blob.
6. Worker persists structured results, warnings/errors, and final state in Azure SQL.
7. Worker updates status transitions (`running` -> `completed` or `failed`) and emits telemetry (`DuaGenerationStarted`, `DocumentParsingCompleted`, `DuaGenerationCompleted`/`DuaGenerationFailed`).
8. Worker triggers user notification through Notification Hubs (non-blocking with retry policy/outbox).

### Track generation progress and errors
1. Frontend polls progress endpoint (`generation.read` / `generation.refresh`) with `generationId`.
2. Backend returns current state, progress percentage, current step, and last transition timestamp.
3. Backend provides structured warning/error list (`generation.errors.read`) when available.
4. Backend only logs meaningful state transitions and exceptional polling failures (avoids telemetry noise).

### Preview, confirm, and download generated dua
1. Once status is `completed`, client requests preview (`dua.preview`).
2. Backend authorizes access, resolves generated artifact, and returns secure preview payload/URL.
3. Reviewer/operator confirms document (`dua.confirm`) or rejects for regeneration with comments.
4. On confirmation, backend marks version as approved and immutable for audit.
5. Client downloads final file (`dua.download`) through authorized endpoint or short-lived signed URL.
6. Backend logs audit trail (`GeneratedDuaPreviewRequested`, `GeneratedDuaDownloaded`) with user, timestamp, and artifact version.

### Data retention and archival
1. Scheduled backend job identifies records/artifacts older than 90 days in active storage.
2. Backend moves eligible metadata/files to configured archive tier while preserving referential integrity.
3. Backend updates lifecycle status in Azure SQL (`archived`) and stores archive location metadata.
4. Backend keeps audit and retrieval capabilities according to customs/compliance retention policy.
5. Backend emits operational telemetry for archival success/failure and retry attempts.

## Architecture diagrams in layers 

### Level 1 - Context
![Context Diagram](media/C4_context.png)

### Level 2 - Container
![Container Diagram](media/C4_container.png)

### Level 4 - Code
![Code Diagram](media/C4_code.png)

## Design Considerations

### 1) Configuration, parameters, and policy as code
- All runtime configuration must be versioned in source control (environment-specific values injected via secure configuration providers, not hardcoded secrets).
- Maintain a single configuration catalog with default values, allowed ranges, owner, and last review date.
- Security and operational policies must be implemented as enforceable controls:
- APIM rate limits/quotas, payload limits, and CORS policies.
- Authentication/authorization policy mappings (`roles -> permissions -> endpoints`).
- Data retention and archival policy (90-day hot data, archive tier lifecycle).
- Any policy change must include: code/config change, migration notes, and rollback plan.

### 2) Resource allocation and capacity planning
- Define baseline and peak workload assumptions: concurrent users, requests/minute, average/maximum upload sizes, and generation job duration.
- Configure App Service scale rules (scale-out on CPU, memory, and queue depth) and set minimum warm instances for business hours.
- Configure SQL connection pooling and query performance budgets (P95/P99 targets, timeout budgets, retry limits).
- Keep file transfer and document generation decoupled through asynchronous processing to avoid blocking API threads.
- Define network and resiliency settings explicitly: request timeout, retry with exponential backoff, circuit-breaker thresholds, and idempotency keys.

### 3) Algorithm selection and business-rule parameterization
- The generation pipeline must be deterministic and traceable per stage: parse -> extract -> map -> validate -> render.
- Each algorithmic component must define its operational parameters (confidence thresholds, validation strictness, fallback behavior).
- Business rules (field mappings, customs validation logic, mandatory/optional rules) must be externalized in versioned rule sets where possible.
- Every release must include regression validation with representative document sets (PDF, DOCX, XLSX, scanned images).
- When extraction confidence is below threshold, route to a manual review path instead of silently auto-filling uncertain values.

### 4) Agent prototype definition (AI-assisted processing)
- Define bounded responsibilities per agent prototype (example: document classification, entity extraction, field mapping suggestions).
- Define non-functional constraints for each agent: latency budget, max token/compute cost, and acceptable error rate.
- Enforce safe execution boundaries: no direct external side effects without orchestration approval; all outputs pass validation rules.
- Establish evaluation metrics before rollout (precision/recall by document type, mapping accuracy, false-positive critical fields).
- Roll out with staged strategy: offline evaluation -> shadow mode -> limited production cohort -> full rollout.

### 5) Interfaces, proxies, and external integrations
- Use contract-first interfaces (OpenAPI) for all public and internal APIs; version contracts semantically.
- Use integration proxies/adapters for external dependencies (storage, notifications, OCR/AI providers) to isolate provider-specific logic.
- Define integration SLAs and failure modes per dependency: timeout, retry policy, dead-letter handling, and compensating actions.
- Standardize observability across boundaries: correlation ID propagation, structured logs, and domain events for state transitions.
- Define backward-compatibility and deprecation policy for interfaces to avoid breaking active clients and long-running jobs.

## Source Code

### Backend scaffold generation scope
- Use a specialized scaffolding agent to generate the backend skeleton in `duabusiness/` from this technical specification.
- Target stack for scaffolded code: ASP.NET Core (.NET SDK 10.0.102) with adapters for Azure SQL, Azure Blob Storage, and Azure Notification Hubs.
- The generated output must include only structure artifacts: project/solution files, folders, class/interface definitions, DTOs, request/response contracts, configuration classes, DI wiring, and CI/CD scripts/templates.
- The generated output must not include functional business logic: no extraction/mapping algorithms, no production SQL queries, no external API side effects, and no hardcoded credentials.
- Methods may be created as stubs (`throw new NotImplementedException()` or equivalent) until implementation phase.

### Monorepo target structure (backend, domain-first)
- Backend root: [`duabusiness/`](/duabusiness)
- Source root: [`duabusiness/src/`](/duabusiness/src)
- Domain modules root: [`duabusiness/src/DUA.Backend/domains/`](/duabusiness/src/DUA.Backend/domains)
- Cross-domain ACL root: [`duabusiness/src/DUA.Backend/acls/`](/duabusiness/src/DUA.Backend/acls)
- Shared kernel root: [`duabusiness/src/DUA.Backend/shared/`](/duabusiness/src/DUA.Backend/shared)
- Tests root: [`duabusiness/tests/`](/duabusiness/tests)
- Deployment/IaC root: [`duabusiness/deploy/`](/duabusiness/deploy)

### Required structure inside each domain module
- For every domain folder under `domains/<domain-name>/`, scaffold exactly these subfolders:
- `controllers/`
- `models/`
- `repositories/`
- `services/`
- Example domains to scaffold first:
- [`duabusiness/src/DUA.Backend/domains/identity-access/`](/duabusiness/src/DUA.Backend/domains/identity-access)
- [`duabusiness/src/DUA.Backend/domains/document-intake/`](/duabusiness/src/DUA.Backend/domains/document-intake)
- [`duabusiness/src/DUA.Backend/domains/template-management/`](/duabusiness/src/DUA.Backend/domains/template-management)
- [`duabusiness/src/DUA.Backend/domains/dua-generation/`](/duabusiness/src/DUA.Backend/domains/dua-generation)
- [`duabusiness/src/DUA.Backend/domains/review-confirmation/`](/duabusiness/src/DUA.Backend/domains/review-confirmation)
- [`duabusiness/src/DUA.Backend/domains/distribution/`](/duabusiness/src/DUA.Backend/domains/distribution)
- [`duabusiness/src/DUA.Backend/domains/retention-archival/`](/duabusiness/src/DUA.Backend/domains/retention-archival)

### ACL policy for cross-domain communication
- All cross-domain calls must go through the ACL layer in [`duabusiness/src/DUA.Backend/acls/`](/duabusiness/src/DUA.Backend/acls).
- No domain is allowed to reference another domain's `repositories/` or `services/` directly.
- ACLs must expose explicit translator/adaptor contracts between domains (anti-corruption boundary).
- Suggested ACL modules:
- [`duabusiness/src/DUA.Backend/acls/document-intake-to-dua-generation/`](/duabusiness/src/DUA.Backend/acls/document-intake-to-dua-generation)
- [`duabusiness/src/DUA.Backend/acls/template-management-to-dua-generation/`](/duabusiness/src/DUA.Backend/acls/template-management-to-dua-generation)
- [`duabusiness/src/DUA.Backend/acls/dua-generation-to-review-confirmation/`](/duabusiness/src/DUA.Backend/acls/dua-generation-to-review-confirmation)
- [`duabusiness/src/DUA.Backend/acls/review-confirmation-to-distribution/`](/duabusiness/src/DUA.Backend/acls/review-confirmation-to-distribution)

### CI/CD and IaC source folders
- GitHub Actions workflows: [`.github/workflows/`](/.github/workflows)
- Terraform root (environment modules): [`duabusiness/deploy/terraform/`](/duabusiness/deploy/terraform)

### Scaffold acceptance criteria
- Solution compiles successfully with empty/stub implementations.
- OpenAPI document is generated for all planned endpoints.
- Dependency injection registrations resolve at startup.
- Each domain contains `controllers`, `models`, `repositories`, and `services`.
- Cross-domain dependencies are only implemented through the `acls` folder.

### Backend Design Patterns

| Pattern | Why it is needed | Where to apply |
|---|---|---|
| Facade (ACL Facade) | Exposes one stable contract per cross-domain integration and hides translation complexity. | `acls/<source>-to-<target>/` with one entry facade per integration flow. |
| Adapter (ACL Translator) | Converts upstream models/events into downstream ubiquitous language without leaking domain internals. | Inside each ACL module as request/event translators. |
| Singleton | Reuses expensive infrastructure clients and avoids connection churn. | Blob, Service Bus, Notification Hub, and Redis client factories in shared infra bootstrap. |
| Repository | Keeps persistence access behind domain-owned contracts. | `domains/<domain>/repositories/` for aggregate retrieval and persistence. |
| Unit of Work | Enforces transactional consistency for multi-entity updates in one domain command. | Domain service/application command boundary for SQL-backed writes. |
| Strategy | Swaps processing logic by file type/rule profile without `if/else` explosion. | Document parsing/extraction/validation behavior in `domains/dua-generation/services/`. |
| Factory Method / Abstract Factory | Centralizes creation of parser/validator/renderer strategies. | Generation domain service composition root. |
| Template Method | Standardizes invariant pipeline steps (`parse -> extract -> map -> validate -> render`) while allowing step specialization. | Base generation workflow service. |
| Specification | Encodes business rules/invariants as reusable predicates and query filters. | Validation rules for templates, generation preconditions, approval checks. |
| Domain Event | Decouples domain actions from side effects and downstream processing. | Emit events in domain services; consume via ACL/event handlers. |
| Outbox | Guarantees reliable event publication with SQL transaction consistency. | Between Azure SQL commits and Service Bus publishing. |
| Saga / Process Manager | Coordinates long-running workflow state across contexts and compensations on failure. | `dua-generation` orchestration lifecycle and retries/compensations. |
| CQRS (lightweight) | Optimizes read-heavy screens without overloading write model. | Progress/history/read endpoints with projection tables/views. |
| Decorator | Adds logging, retry, metrics, caching around services without polluting business code. | Around repository/services and external provider clients. |
| Idempotency Key | Prevents duplicate command execution from retries/client resubmits. | Upload initiation, generation start, approval commands. |

### Pattern usage rules

- Do not call another domain directly from `domains/*`; always go through `acls/*` facades.
- Keep domain models free of infrastructure concerns; infra-specific code stays in repository/adapters/decorators.
- Emit domain events inside the transaction boundary and publish through Outbox after commit.
- Use Saga only for multi-step long-running workflows; avoid it for single-transaction operations.
- Prefer Strategy + Factory for variable business behavior (format/profile-driven logic).

### Suggested starter classes (scaffold-only)

| Pattern | Suggested class/interface |
|---|---|
| ACL Facade | `DocumentIntakeToDuaGenerationFacade` |
| ACL Adapter | `DocumentBatchToGenerationRequestAdapter` |
| Repository | `IGenerationJobRepository`, `IDocumentBatchRepository` |
| Unit of Work | `IUnitOfWork` |
| Strategy | `IDocumentProcessorStrategy`, `IPolicyValidationStrategy` |
| Factory | `DocumentProcessorStrategyFactory` |
| Template Method | `BaseGenerationPipeline` |
| Specification | `TemplateIsValidSpecification`, `GenerationPreconditionsSpecification` |
| Domain Event | `DuaGenerationQueuedEvent`, `DuaApprovedEvent` |
| Outbox | `OutboxMessage`, `IOutboxPublisher` |
| Saga | `GenerationSagaManager` |
| CQRS | `GenerationProgressReadModel`, `GenerationHistoryReadModel` |

## Domain-Driven Design (DDD) domain definition

### Domain classification
| Domain | Classification | Why |
|---|---|---|
| DUA Generation and Validation | Core Domain | This is the business differentiator: transform heterogeneous trade documents into a valid DUA output. |
| Document Intake | Supporting Domain | Enables ingestion, validation, and lifecycle of source files used by the core domain. |
| Template Management | Supporting Domain | Governs DUA template versions, placeholder contracts, and compatibility rules. |
| Review and Confirmation | Supporting Domain | Controls operator/reviewer decision flow before final document release. |
| Distribution and Download | Supporting Domain | Provides secure preview/download and approved artifact delivery. |
| Retention and Archival | Supporting Domain | Applies legal/compliance retention lifecycle and archive traceability. |
| Identity and Access | Generic Domain | Standard authn/authz capabilities reused by all contexts. |
| Audit and Observability | Generic Domain | Cross-cutting event traceability, telemetry, and operational diagnostics. |

### Bounded contexts
| Bounded Context | Main Responsibilities | Aggregate Root(s) | Primary Data Store |
|---|---|---|---|
| IdentityAccess | Login, OTP validation, JWT issuance, role/permission checks | `UserSession`, `AccessPolicy` | Azure SQL |
| DocumentIntake | File registration, upload status, checksum, blob linkage, file eligibility | `DocumentBatch`, `SourceDocument` | Azure SQL + Blob |
| TemplateManagement | Template upload, versioning, compatibility and placeholder validation | `DuaTemplate` | Azure SQL + Blob |
| DuaGeneration | Orchestration of parse -> extract -> map -> validate -> render pipeline | `GenerationJob`, `DuaDraft` | Azure SQL + Blob |
| ReviewConfirmation | Human review workflow, approve/reject decisions, reviewer notes | `ReviewCase`, `ApprovalDecision` | Azure SQL |
| Distribution | Preview/download access, secure artifact retrieval | `GeneratedArtifact` | Azure SQL + Blob |
| RetentionArchival | 90-day lifecycle transition, archive movement, retrieval metadata | `RetentionRecord` | Azure SQL + Blob Archive tier |
| AuditObservability | Domain event log, trace correlation, operational metrics | `AuditEntry` | Azure SQL + App Insights |

### Aggregate invariants (must always hold)
| Context | Invariant |
|---|---|
| DocumentIntake | A `SourceDocument` cannot be `completed` without blob reference + checksum. |
| TemplateManagement | Only one `DuaTemplate` version can be `active` per template channel/profile. |
| DuaGeneration | A `GenerationJob` can start only when required files and one valid template exist. |
| DuaGeneration | Status transitions are monotonic (`queued -> running -> completed/failed/cancelled`). |
| ReviewConfirmation | Only `completed` generation outputs can be approved/rejected. |
| Distribution | Download is allowed only for authorized users and valid artifact state. |
| RetentionArchival | Archived artifacts must preserve immutable audit linkage to source generation. |

### Domain events and consumers
| Event | Produced by | Consumed by |
|---|---|---|
| `FilesUploadStarted` / `FilesUploadCompleted` / `FilesUploadRejected` | DocumentIntake | DuaGeneration, AuditObservability |
| `DuaTemplateValidated` / `DuaTemplateRejected` | TemplateManagement | DuaGeneration, AuditObservability |
| `DuaGenerationQueued` / `DuaGenerationStarted` | DuaGeneration | AuditObservability |
| `DuaGenerationCompleted` / `DuaGenerationFailed` | DuaGeneration | ReviewConfirmation, Distribution, AuditObservability |
| `DuaApproved` / `DuaRejected` | ReviewConfirmation | Distribution, AuditObservability |
| `ArtifactDownloaded` | Distribution | AuditObservability |
| `RecordsArchived` | RetentionArchival | AuditObservability |

### Context map (integration style)
| Upstream Context | Downstream Context | Integration Pattern |
|---|---|---|
| IdentityAccess | All contexts | JWT claims and permission policy enforcement |
| DocumentIntake | DuaGeneration | ACL-mediated contract + published events |
| TemplateManagement | DuaGeneration | ACL-mediated compatibility contract + events |
| DuaGeneration | ReviewConfirmation | ACL-mediated event contract (`DuaGenerationCompleted`) |
| ReviewConfirmation | Distribution | ACL-mediated event contract (`DuaApproved`) |
| Distribution | RetentionArchival | ACL-mediated lifecycle status feed |
| All contexts | AuditObservability | ACL/event publisher with correlation ID propagation |

### Ubiquitous language (project terms)
| Term | Definition |
|---|---|
| `GenerationSession` | Business session that groups selected files, template, and user intent. |
| `DocumentBatch` | Set of uploaded source documents associated to one session. |
| `DuaTemplate` | Versioned template artifact and validation contract for output rendering. |
| `GenerationJob` | Async execution unit that processes one session into a DUA result. |
| `DuaDraft` | Generated but not yet approved DUA output. |
| `ApprovalDecision` | Reviewer decision that finalizes acceptance or rejection of a draft. |
| `GeneratedArtifact` | Previewable/downloadable document produced by generation. |
| `RetentionRecord` | Lifecycle metadata controlling hot-to-archive transitions. |

### Mapping to backend folders (`duabusiness/src/DUA.Backend`)
| Folder | DDD role |
|---|---|
| `domains/<domain-name>/models` | Aggregates, entities, value objects, domain events, invariants |
| `domains/<domain-name>/services` | Domain behaviors and use-case orchestration inside the domain boundary |
| `domains/<domain-name>/repositories` | Persistence contracts/implementations owned by the domain |
| `domains/<domain-name>/controllers` | HTTP endpoints for the domain module |
| `acls/<source>-to-<target>` | Anti-Corruption Layer for all cross-domain translations and calls |
| `shared` | Shared kernel primitives used by multiple domains |


# 3. Data Design