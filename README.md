# QuietWealth

## Problem Statement
Provide an expedited financial trust record for SMEs.

# Auth

## Recomendaciones Rodri
- OpenID connect no es necesario
- Definir qué contenidos va a tener el JWT
- Ver lo del HTTPS required
- Client ID and Client Secret irían dentro del jwt
- Cuánto de expiración al token
- Cuánto al refresh
- CSRF donde ponerlo, qué es?
- Microsoft Entra o Google?
- Dejar un solo lugar para storage de secrets
- Qué vamos a hacer con esos casos que puede tardar hasta 5 segundos para auth? Progress bar o label para indicar al usuario
- Soporta thousands concurrent pero cuántos necesita mi app? Ver cuántos esperamos y ver si están bajo el treshold estamos bien
- El jwt probablemente no pase de 10 kb pero hay que definir lo que lleva
- Cuantificar cuantas autenticaciones en el horario establecido
- Quitar la hablada innecesaria
- Aterrizar bien el workflow
- Facade está bien
- DTO está bien

---

## Integration Spec

### Name
Auth0 Authentication Platform

### Provider
Auth0 by Okta

### Protocol
- HTTPS
- REST API
- OAuth 2.0
- OpenID Connect (OIDC)
- JSON Web Tokens (JWT)

Integrated Identity Providers:
- Google Login
- Microsoft Login (Microsoft Entra ID)

### Security Constraints
- OAuth 2.0 Authorization Code Flow
- OpenID Connect authentication
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

Sensitive parameters will be stored securely using environment variables and secret management services.

Configuration parameters:
- AUTH0_DOMAIN
- AUTH0_CLIENT_ID
- AUTH0_CLIENT_SECRET
- AUTH0_CALLBACK_URL
- AUTH0_AUDIENCE

Possible secure storage locations:
- .env files for local development
- Azure Key Vault
- AWS Secrets Manager
- GitHub Actions Secrets
- CI/CD secure deployment variables

No secrets or API credentials will be hardcoded in the repository.

### Throughput

Auth0 supports enterprise-scale authentication workloads with global infrastructure.

Expected integration characteristics:
- Average authentication response time: 1–5 seconds
- JWT payload size: typically below 10 KB
- Session duration configurable between minutes and days
- Support for thousands of concurrent authentication requests

Potential bottleneck:
Large concurrent login spikes during business hours for SME users accessing financial trust records.

Mitigation strategy:
- Use internal JWT session reuse after initial authentication
- Cache Auth0 public signing keys (JWKS)
- Avoid repeated token validation requests
- Asynchronous user profile synchronization
- Stateless backend authentication architecture

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
- Asynchronous login flow
- Frontend loading states and retry mechanisms
- Session caching
- Configurable timeout policies
- Decoupled authentication microservice

### Integration Strategy

Authentication Flow:
1. User selects "Continue with Google" or "Continue with Microsoft"
2. Frontend redirects user to Auth0 Universal Login
3. Auth0 federates authentication with Google or Microsoft
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

- OpenID Connect Specification  
https://openid.net/connect/

- Microsoft Entra ID Documentation  
https://learn.microsoft.com/en-us/entra/

- Google Identity Platform  
https://developers.google.com/identity