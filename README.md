# QuietWealth

## Problem Statement
Provide an expedited financial trust record for SMEs.

## UX prototyping

# Frontend Design

## Technology Stack
- Application Type: SSR Web App
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

## Authentication and Authorization

# Backend Design

## Technology Stack
- API style: REST API over HTTPS
- API specification standard: OpenAPI
- API gateway and hosting: Azure API Management + Azure App Service
- Database: Azure SQL Database
- File storage: Azure Blob Storage
- Asynchronous operations and notifications: Azure Notification Hubs
- Load balancing: no dedicated load balancer required for the expected traffic profile
- Backend framework and language: .NET SDK 10.0.102, ASP.NET Core
- Repository structure: monorepo shared with the frontend; backend folder: (AGREGAR) ``
- Testing: xUnit for unit and integration tests
- API documentation tooling: Swagger / OpenAPI tooling for contract publication and validation
- Code quality: `dotnet format` and built-in .NET analyzers
- Services (CAMBIAR):
  - Authentication service
  - Document upload service
  - DUA generation orchestration service
  - Notification service
  - Result download service


# Data Design

# Auth

## Recomendaciones Rodri
- Definir qué contenidos va a tener el JWT
- Ver lo del HTTPS required
- Client ID and Client Secret irían dentro del jwt
- Cuánto de expiración al token
- Cuánto al refresh
- CSRF donde ponerlo, qué es?
- Qué vamos a hacer con esos casos que puede tardar hasta 5 segundos para auth? Progress bar o label para indicar al usuario
- Soporta thousands concurrent pero cuántos necesita mi app? Ver cuántos esperamos y ver si están bajo el treshold estamos bien
- El jwt probablemente no pase de 10 kb pero hay que definir lo que lleva
- Cuantificar cuantas autenticaciones en el horario establecido
- Quitar la hablada innecesaria
- Aterrizar bien el workflow

---

## Integration Spec

### Name
Auth0 Authentication Platform by Okta

### Protocol
- HTTPS
- REST API
- OAuth 2.0
- JSON Web Tokens (JWT)

Integrated Identity Providers:
- Microsoft Login (Microsoft Entra ID)

### Security Constraints
- OAuth 2.0 Authorization Code Flow
- JWT validation
- Session validation in backend
- HTTPS required for all authentication traffic
- MFA support available through Auth0
- Client ID and Client Secret required
- Token expiration validation
- Refresh token rotation
- CSRF protection using state parameter
- Security integrated with Microsoft Entra ID through Auth0 federation

### Configuration and Secure Parameter Storage

Configuration parameters:
- AUTH0_DOMAIN
- AUTH0_CLIENT_ID
- AUTH0_CLIENT_SECRET
- AUTH0_CALLBACK_URL
- AUTH0_AUDIENCE

Secure storage locations:
- .env files for local development
- Azure Key Vault for production and QA
- GitHub Actions Secrets

### Throughput

Expected integration characteristics:
- Average authentication response time: 1–5 seconds
- JWT payload size: below 10 KB
- Support for thousands of concurrent authentication requests

Potential bottleneck:
Large concurrent login spikes during business hours for SME users accessing financial trust records.

No mitigation necessary since we expect XXX users daily and are not expecting thousands of concurrent auth requests. JSON payloads will have a size of XX KB which is handled easily by Auth0.

### Workload

Expected workload scenario:
- High login activity between 7:00 AM and 6:00 PM
- SME administrators and financial users accessing dashboards simultaneously
- Increased authentication requests at beginning of workdays

Potential risks:
- Authentication latency caused by external identity providers
- MFA delays from Microsoft enterprise accounts
- Network congestion during peak hours

Mitigation strategy:
- Frontend loading states and retry mechanisms
- Session caching
- Configurable timeout policies

### Integration Strategy

Authentication Flow:
1. User selects "Continue with Microsoft"
2. Frontend redirects user to Auth0 Universal Login
3. Auth0 federates authentication with Microsoft
4. Identity provider authenticates the user
5. Auth0 returns authorization code to QuietWealth backend
6. Backend exchanges authorization code for tokens
7. Backend validates JWT and ID Token
8. User profile is created or updated internally
9. Internal JWT session is generated
10. User gains access to the SME financial trust platform

### Object-Oriented Design Patterns Required

#### Facade Pattern
Used to abstract all third-party authentication providers behind a single authentication interface.

Example:
- AuthFacade.authenticateUser()

#### DTOs (Data Transfer Objects)
Used for authentication request and response encapsulation.

DTO examples:
- AuthRequestDTO
- AuthResponseDTO
- UserSessionDTO
- ExternalProfileDTO

---

## References

- Auth0 Documentation  
https://auth0.com/docs

- OAuth 2.0 Framework  
https://datatracker.ietf.org/doc/html/rfc6749

- Microsoft Entra ID Documentation  
https://learn.microsoft.com/en-us/entra/