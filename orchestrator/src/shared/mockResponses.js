export const MOCK_SPECS = {
  frontend: `# Frontend Specification – Customer Self-Service Password Reset

## Summary
Implement a password reset flow with email verification and new password form.

## Components
- \`PasswordResetRequestPage\` – form to enter email
- \`PasswordResetConfirmPage\` – form to enter new password + confirm
- \`usePasswordReset\` hook – manages reset state and API calls

## API Integration
- POST /api/auth/password-reset/request  { email }
- POST /api/auth/password-reset/confirm  { token, newPassword }

## Zod Schemas
\`\`\`typescript
const RequestSchema = z.object({ email: z.string().email() });
const ConfirmSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
  confirmPassword: z.string()
}).refine(d => d.newPassword === d.confirmPassword);
\`\`\`

## Auth
- GuestGuard on both pages (logged-in users redirected to dashboard)

## i18n keys
- auth.passwordReset.title, auth.passwordReset.emailLabel, auth.passwordReset.submit
`,

  backend: `# Backend Specification – Customer Self-Service Password Reset

## Domain
server/QuietWealth.Backend/domains/PasswordReset/

## Controller
PasswordResetController.cs
- POST /api/auth/password-reset/request
- POST /api/auth/password-reset/confirm

## Service
IPasswordResetService / PasswordResetService
- RequestPasswordReset(string email) → generates token, sends email
- ConfirmPasswordReset(string token, string newPassword) → validates token, updates hash

## Repository
IPasswordResetRepository / PasswordResetRepository
- StoreToken(Guid userId, string token, DateTime expiry)
- GetByToken(string token) → PasswordResetToken?
- InvalidateToken(string token)

## Models
- PasswordResetRequestDto { Email }
- PasswordResetConfirmDto { Token, NewPassword }
- PasswordResetToken { Id, UserId, Token, ExpiresAt, UsedAt }
`,

  data: `# Data Model Specification – Password Reset

## New Table
\`\`\`sql
CREATE TABLE password_reset_tokens (
  id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  user_id       UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  token         NVARCHAR(256) NOT NULL UNIQUE,
  expires_at    DATETIME2 NOT NULL,
  used_at       DATETIME2 NULL,
  created_at    DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
CREATE INDEX IX_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IX_password_reset_tokens_user_id ON password_reset_tokens(user_id);
\`\`\`
`,

  observability: `# Observability Specification – Password Reset

## Application Insights Events
- PasswordResetRequested { userId, email, timestamp }
- PasswordResetCompleted { userId, timestamp }
- PasswordResetTokenExpired { token, timestamp }

## Alerts
- Alert if PasswordResetRequested > 10/min per IP (brute force)
- Alert if PasswordResetCompleted failure rate > 20%

## Health Check
- Add token cleanup job health check
`,

  testing: `# Testing Specification – Password Reset

## Backend Unit Tests (xUnit)
- PasswordResetServiceTests
  - RequestPasswordReset_ValidEmail_StoresToken
  - RequestPasswordReset_UnknownEmail_ReturnsSuccess (security: no enumeration)
  - ConfirmPasswordReset_ValidToken_UpdatesPassword
  - ConfirmPasswordReset_ExpiredToken_ThrowsException
  - ConfirmPasswordReset_UsedToken_ThrowsException

## Frontend Unit Tests (Jest)
- PasswordResetRequestPage renders email input
- PasswordResetRequestPage submits form and shows confirmation
- usePasswordReset hook manages loading/error state

## E2E Tests (Playwright)
- User requests password reset → receives email → resets password → logs in
`,

  cicd: `# CI/CD Specification – Password Reset

## GitHub Actions
- No new workflows needed
- Existing ci-backend.yml and ci-frontend.yml cover this feature

## Quality Gates
- Unit test coverage ≥ 80% for PasswordResetService
- No hardcoded tokens or secrets
- Token expiry must be configurable via appsettings

## Environment Variables
- PasswordReset__TokenExpiryMinutes (default: 60)
- PasswordReset__EmailFrom
`
};

export const MOCK_IMPLEMENTATION = {
  frontend: {
    "app/src/components/pages/PasswordResetRequestPage.tsx": `import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePasswordReset } from '../hooks/usePasswordReset';

const schema = z.object({ email: z.string().email('Invalid email') });

export const PasswordResetRequestPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const { requestReset, isLoading, isSuccess } = usePasswordReset();

  if (isSuccess) return <div>Check your email for reset instructions.</div>;

  return (
    <form onSubmit={handleSubmit(d => requestReset(d.email))}>
      <h1>Reset Password</h1>
      <input {...register('email')} placeholder="Your email" type="email" />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </button>
    </form>
  );
};`,
    "app/src/components/hooks/usePasswordReset.ts": `import { useState } from 'react';
import { applicationFacade } from '../../facades/applicationFacade';

export function usePasswordReset() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestReset = async (email: string) => {
    setIsLoading(true);
    try {
      await applicationFacade.auth.requestPasswordReset(email);
      setIsSuccess(true);
    } catch (e) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { requestReset, isLoading, isSuccess, error };
}`
  },
  backend: {
    "server/QuietWealth.Backend/domains/PasswordReset/controllers/PasswordResetController.cs": `using Microsoft.AspNetCore.Mvc;
using QuietWealth.Backend.domains.PasswordReset.models;
using QuietWealth.Backend.domains.PasswordReset.services;

namespace QuietWealth.Backend.domains.PasswordReset.controllers;

[ApiController]
[Route("api/auth/password-reset")]
public class PasswordResetController : ControllerBase
{
    private readonly IPasswordResetService _service;
    public PasswordResetController(IPasswordResetService service) => _service = service;

    [HttpPost("request")]
    public async Task<IActionResult> Request([FromBody] PasswordResetRequestDto dto)
    {
        await _service.RequestPasswordResetAsync(dto.Email);
        return Ok(new { message = "If that email exists, a reset link has been sent." });
    }

    [HttpPost("confirm")]
    public async Task<IActionResult> Confirm([FromBody] PasswordResetConfirmDto dto)
    {
        await _service.ConfirmPasswordResetAsync(dto.Token, dto.NewPassword);
        return Ok(new { message = "Password updated successfully." });
    }
}`,
    "server/QuietWealth.Backend/domains/PasswordReset/services/IPasswordResetService.cs": `namespace QuietWealth.Backend.domains.PasswordReset.services;

public interface IPasswordResetService
{
    Task RequestPasswordResetAsync(string email);
    Task ConfirmPasswordResetAsync(string token, string newPassword);
}`
  },
  data: {
    "server/migrations/password-reset-tokens.sql": `-- Migration: Add password_reset_tokens table
CREATE TABLE password_reset_tokens (
    id          UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id     UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       NVARCHAR(256) NOT NULL UNIQUE,
    expires_at  DATETIME2 NOT NULL,
    used_at     DATETIME2 NULL,
    created_at  DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_prt_token   ON password_reset_tokens(token);
CREATE INDEX IX_prt_user_id ON password_reset_tokens(user_id);`
  }
};

export const MOCK_VALIDATION = {
  passed: true,
  score: 92,
  checks: {
    functional: { passed: true, notes: "All password reset flows covered" },
    architectural: { passed: true, notes: "Follows QuietWealth domain structure" },
    specification: { passed: true, notes: "Implementation matches spec" },
    security: { passed: true, notes: "No token enumeration, expiry enforced" },
    codingStandards: { passed: true, notes: "C# and TypeScript conventions followed" }
  },
  feedback: "",
  summary: "Implementation passes all checks with score 92/100"
};

export const MOCK_TESTS = {
  files: {
    "server/tests/PasswordResetServiceTests.cs": `using Xunit;
using Moq;
using QuietWealth.Backend.domains.PasswordReset.services;

public class PasswordResetServiceTests
{
    [Fact]
    public async Task RequestPasswordReset_ValidEmail_StoresToken()
    {
        // Arrange
        var repoMock = new Mock<IPasswordResetRepository>();
        var svc = new PasswordResetService(repoMock.Object);
        // Act
        await svc.RequestPasswordResetAsync("user@example.com");
        // Assert
        repoMock.Verify(r => r.StoreTokenAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<DateTime>()), Times.Once);
    }

    [Fact]
    public async Task ConfirmPasswordReset_ExpiredToken_ThrowsException()
    {
        var repoMock = new Mock<IPasswordResetRepository>();
        repoMock.Setup(r => r.GetByTokenAsync("expired")).ReturnsAsync(
            new PasswordResetToken { ExpiresAt = DateTime.UtcNow.AddMinutes(-1) });
        var svc = new PasswordResetService(repoMock.Object);
        await Assert.ThrowsAsync<AppException>(() => svc.ConfirmPasswordResetAsync("expired", "NewPass123!"));
    }
}`,
    "app/__tests__/unit/PasswordResetRequestPage.test.tsx": `import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordResetRequestPage } from '../../../src/components/pages/PasswordResetRequestPage';

describe('PasswordResetRequestPage', () => {
  it('renders email input', () => {
    render(<PasswordResetRequestPage />);
    expect(screen.getByPlaceholderText('Your email')).toBeInTheDocument();
  });

  it('shows error for invalid email', async () => {
    render(<PasswordResetRequestPage />);
    fireEvent.change(screen.getByPlaceholderText('Your email'), { target: { value: 'notanemail' } });
    fireEvent.submit(screen.getByRole('button'));
    expect(await screen.findByText('Invalid email')).toBeInTheDocument();
  });
});`
  },
  summary: "Generated 2 test files (xUnit + Jest)"
};