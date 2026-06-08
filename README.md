# QuietWealth

## Problem Statement
Provide an expedited financial trust record for SMEs.

# Frontend Design

## Technology Stack
- Application Type: SSR Web App
- Web Framework: React.js 19.2
- Web Server: Node.js 22 with Next.js 15
- Coding Language: TypeScript 5.9.3
- Styling: TailwindCSS 4.1
- State Management: Redux Toolkit 2.8
- Unit Testing: Jest 30.2.0
- Data Validations: Zod 4.3.6
- Code Prettier Framework: Prettier 3.8.1
- Code Style Framework: ESLint 10.0.2
- Integration Testing: Playwright 1.52
- HTTP Client: Axios 1.9
- Auth SDK: Auth0 React SDK 2.2
- Cloud Service: Azure
- Hosted Service: Azure App Service
- Code Repository: Azure DevOps Repos
- Code Automation Tasks Tool: Husky 9.1.7
- CI/CD Pipeline Technology: Azure DevOps Pipelines
- Environments: Development, Stage, Production
- Environment Deployment Tools: Azure DevOps Environments
- Observability Framework: Azure Application Insights SDK

## UX/UI Analysis

## Core Business Process

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

## Wireframes
### Login Screen
**Description**

Microsoft-authenticated entry point to the platform.

![Login](Media/login.png)

### Marketplace Screen
**Description**

Lists certified SMEs with key financial metrics and trust indicators for investors to browse and compare.

![Markectplace](Media/marketPlace.png)

### Document Upload Screen
**Description**

Allows SMEs to submit financial documents for expert review and certification.

![UploadaDocument](Media/loadDocuments.png)

### Expert Validation Panel Screen
**Description**

Enables financial experts to review and certify pending SME applications.

![validation](Media/validacion.png)

### Investment Detail Screen

**Description**

Shows verified SME financial metrics, growth charts, and expert certifications to support investor decision-making.

![DetalleInversion01](Media/DetalleInv01.png)
![DetalleInversion02](Media/DetalleInv02.png)
![DetalleInversion03](Media/DetalleInv03.png)

### Testing results

Tabla testing · MD
| Participant | Duration | OS | Browser | Opinion Scale (1–5) | Open Feedback |
|-------------|----------|----|---------|---------------------|---------------|
| 542521286 | 49s | Windows | Chrome | 4 | "Considero que la información mostrada es clara." |
| 510669335 | 42s | Windows | Chrome | 5 | "Esta bien" |
| 543901432 | 17.8s | Windows | Brave | 4 | "all good" |
| 508804036 | 70.1s | Windows | Edge | 5 | "." |
| 542802936 | 99.5s | Windows | Edge | 5 | "Anuncios de invierta ahora no deberían de aparecer en la aplicación como tal, solo en una web." |
| 537502878 | 50.1s | Linux | Firefox | 5 | "Muy detallada y presentable, no mejoraría nada." |
| **Average** | **54.8s** | — | — | **4.7 / 5** | — |

---

### Heatmaps for clicks and drop-offs

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

![bannerNuevo](Media/DetalleInv_bannerCambiado.png)

---

## Authentication and Authorization

# Backend Design