# QuietWealth Development Plane Control

## Author 
Victoria Molina Martínez 2022438537

---
### Requirements
- Have Docker Desktop running 
- Node.js installed 
- Git
---

## Mock mode

## 1. Clone repository and configuration
```bash
git clone https://github.com/danielpulido01/QuietWealth.git
cd QuietWealth
```
 
create `.env` in the root:
```
ANTHROPIC_API_KEY=sk-ant-fake-key-not-needed-in-mock-mode
AI_MOCK=true
GITHUB_TOKEN=ghp_fake
GITHUB_REPOSITORY=danielpulido01/QuietWealth
```
 
### 2. Start the environment
```bash
docker compose up -d
```
 
### 3. Run the full pipeline
 
```bash
# Generate 6 domain specifications
node devplane.mjs /feature "Implement customer self-service password reset"
 
# Generate code (use the feature-id from the previous step)
node devplane.mjs /build-feature <feature-id>
 
# Validate and generate tests
node devplane.mjs /validate-feature <feature-id>
 
# Run CI, create branch and PR
node devplane.mjs /release-feature <feature-id>
```
 
**Expected output:**
```
/feature          → 6 specs generated (frontend, backend, data, observability, testing, cicd)
/build-feature    → 3 implementation files generated
/validate-feature → Score 92/100, 5 checks ✓, 2 test files generated
/release-feature  → Branch and PR created
```
 
---
 
## Real Mode (Anthropic API)
 
### 1. Clone and configure
```bash
git clone https://github.com/danielpulido01/QuietWealth.git
cd QuietWealth
```
 
Create a `.env` file with your real key from https://console.anthropic.com:
```
ANTHROPIC_API_KEY=sk-ant-api03-yourRealKey...
AI_MOCK=false
GITHUB_TOKEN=ghp_yourRealToken
GITHUB_REPOSITORY=danielpulido01/QuietWealth
```
 
### 2. Start the environment
```bash
docker compose up -d
```
 
### 3. Run the full pipeline
 
```bash
node devplane.mjs /feature "Implement customer self-service password reset"
node devplane.mjs /build-feature <feature-id>
node devplane.mjs /validate-feature <feature-id>
node devplane.mjs /release-feature <feature-id>
```
 
In real mode, Claude generates specs and code tailored to the QuietWealth stack (React 19 + ASP.NET Core 9 + Azure SQL).
 
---
 
## Web UI
 
Available at **http://localhost:4000** — same commands in a visual interface.
 
---
 
## Shut everything down
 
```bash
docker compose down
```
 
To shut down and delete all data (volumes):
```bash
docker compose down -v
```