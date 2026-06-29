---
name: database
description: Use when designing or reviewing Azure SQL tables, migrations, indexes, or Dapper queries in QuietWealth. Includes exact SQL and C# patterns from the real codebase.
---

# QuietWealth Database Skill

## Stack
- Azure SQL (SQL Server 2022)
- Dapper for queries (no EF Core)
- `IAzureSqlConnectionFactory` for connections
- Migrations as plain `.sql` files in `server/migrations/`

---

## Table Design – Exact Conventions

```sql
--  snake_case for tables and columns
--  UNIQUEIDENTIFIER PKs with DEFAULT NEWID()
--  DATETIME2 for all timestamps
--  DEFAULT GETUTCDATE() for created_at
--  NOT NULL unless explicitly optional
--  ON DELETE CASCADE for child tables

CREATE TABLE <table_name> (
    id              UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID()             PRIMARY KEY,
    user_id         UNIQUEIDENTIFIER    NOT NULL    REFERENCES users(id)        ON DELETE CASCADE,
    name            NVARCHAR(256)       NOT NULL,
    status          NVARCHAR(64)        NOT NULL    DEFAULT 'pending',
    amount          DECIMAL(18, 2)      NULL,
    notes           NVARCHAR(MAX)       NULL,
    created_at      DATETIME2           NOT NULL    DEFAULT GETUTCDATE(),
    updated_at      DATETIME2           NULL,
    deleted_at      DATETIME2           NULL
);
```

---

## Index Conventions

```sql
-- Always index foreign keys
CREATE INDEX IX_<table>_user_id ON <table>(user_id);

-- Index columns used in WHERE clauses
CREATE INDEX IX_<table>_status ON <table>(status);
CREATE INDEX IX_<table>_created_at ON <table>(created_at DESC);

-- Unique constraint
CREATE UNIQUE INDEX UX_<table>_<column> ON <table>(<column>)
    WHERE deleted_at IS NULL;  -- partial index for soft deletes
```

---

## Migration File Format

```
server/migrations/<feature-description>.sql
```

```sql
-- Migration: <description>
-- Feature: <feature-id>
-- Date: <YYYY-MM-DD>

-- ── Up ────────────────────────────────────────────────────────

CREATE TABLE password_reset_tokens (
    id          UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID()             PRIMARY KEY,
    user_id     UNIQUEIDENTIFIER    NOT NULL    REFERENCES users(id)        ON DELETE CASCADE,
    token       NVARCHAR(512)       NOT NULL,
    expires_at  DATETIME2           NOT NULL,
    used_at     DATETIME2           NULL,
    created_at  DATETIME2           NOT NULL    DEFAULT GETUTCDATE()
);

CREATE INDEX IX_password_reset_tokens_user_id
    ON password_reset_tokens(user_id);

CREATE UNIQUE INDEX UX_password_reset_tokens_token
    ON password_reset_tokens(token)
    WHERE used_at IS NULL;

-- ── Down (rollback) ───────────────────────────────────────────
-- DROP TABLE password_reset_tokens;
```

---

## Dapper Query Patterns

### SELECT single row
```csharp
return await connection.QueryFirstOrDefaultAsync<Entity>(
    "SELECT id, user_id, token, expires_at, created_at " +
    "FROM password_reset_tokens " +
    "WHERE token = @Token AND used_at IS NULL AND expires_at > GETUTCDATE()",
    new { Token = token });
```

### SELECT list
```csharp
return (await connection.QueryAsync<Entity>(
    "SELECT id, name, status, created_at " +
    "FROM <table> " +
    "WHERE user_id = @UserId AND deleted_at IS NULL " +
    "ORDER BY created_at DESC",
    new { UserId = userId })).AsList();
```

### INSERT
```csharp
await connection.ExecuteAsync(
    @"INSERT INTO <table> (id, user_id, name, status, created_at)
      VALUES (@Id, @UserId, @Name, @Status, GETUTCDATE())",
    new { Id = Guid.NewGuid(), UserId = userId, Name = name, Status = "pending" });
```

### UPDATE
```csharp
await connection.ExecuteAsync(
    "UPDATE <table> SET status = @Status, updated_at = GETUTCDATE() WHERE id = @Id",
    new { Id = id, Status = newStatus });
```

### Soft delete
```csharp
await connection.ExecuteAsync(
    "UPDATE <table> SET deleted_at = GETUTCDATE() WHERE id = @Id",
    new { Id = id });
```

**Rules:**
- Never use string interpolation in SQL — always named parameters `@ParamName`
- Always `await using var connection = new SqlConnection(connectionString)`
- Use `QueryFirstOrDefaultAsync<T>` for nullable single results
- Use `QuerySingleAsync<T>` only when you're sure the row exists
- Never store raw file content in SQL — use Blob Storage for files

---

## Type Mappings SQL → C#

| SQL Type | C# Type |
|---|---|
| `UNIQUEIDENTIFIER` | `Guid` |
| `NVARCHAR(n)` | `string` |
| `DATETIME2` | `DateTime` |
| `DECIMAL(18,2)` | `decimal` |
| `BIT` | `bool` |
| `INT` | `int` |
| nullable column | `T?` |

---

## What Goes in SQL vs Blob Storage

| Data | Store in |
|---|---|
| Metadata, status, workflow state | Azure SQL |
| File contents, PDFs, images | Azure Blob Storage |
| Audit logs, financial records | Azure SQL |
| Large text payloads (>1MB) | Azure Blob Storage |

## Close-Out Checklist

- [ ] Table uses `UNIQUEIDENTIFIER` PK with `DEFAULT NEWID()`
- [ ] All timestamps are `DATETIME2` with `DEFAULT GETUTCDATE()`
- [ ] Foreign keys have indexes
- [ ] WHERE clause columns have indexes
- [ ] No string interpolation in Dapper queries
- [ ] Migration includes rollback comment
- [ ] File content goes to Blob, not SQL
