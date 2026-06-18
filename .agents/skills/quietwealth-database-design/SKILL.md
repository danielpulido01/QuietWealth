---
name: quietwealth-database-design
description: Guide QuietWealth Azure SQL database design. Use when designing or reviewing tables, relationships, keys, indexes, queries, migrations, retention, archival, or Blob-export flows for financial and document-processing data.
---

# QuietWealth Database Design

## Overview

Design Azure SQL schemas for integrity first, then queryability, then retention. Keep large document binaries out of relational storage and reserve SQL for metadata, workflow state, audit linkage, permissions, and financial records that need transactional guarantees.

## Workflow

1. Identify the business entities, aggregate boundaries, and lifecycle states affected by the change.
2. Model the relational shape first:
   - primary tables
   - child tables
   - join tables
   - reference tables
3. Define primary keys, foreign keys, uniqueness rules, and required constraints before thinking about convenience queries.
4. Derive indexes from actual read and write patterns:
   - status lookups
   - tenant or user scoping
   - document tracking
   - archival jobs
   - audit queries
5. Decide which data belongs in Azure SQL and which belongs in Blob Storage. Store file content in blobs and keep durable metadata in SQL.
6. Plan audit, retention, and archival behavior at the same time as the base schema so later compliance changes do not require a redesign.
7. When proposing migrations, call out data backfill needs, lock risk, and rollout order.

## Rules

- Prefer normalized relational design unless a denormalization clearly removes a measured read bottleneck.
- Every table needs an explicit primary key and every relationship needs an explicit foreign key unless there is a documented exception.
- Use `NOT NULL`, `UNIQUE`, `CHECK`, and referential constraints to protect invariants in the database, not only in application code.
- Match indexes to access patterns. Do not add speculative indexes with no expected query path.
- Index foreign keys and common filter columns used in status, tenant, date-range, and retention queries.
- Avoid storing raw documents, extracted file payloads, or oversized blobs in Azure SQL.
- Minimize duplication of sensitive financial data. Keep only the fields required for workflow, reporting, or audit.
- Design auditability for important changes such as document status, user access, archival events, and financial record updates.
- Plan archival with Azure Functions and Blob export when data ages out of the primary hot path.
- Make retention and export processes reversible enough to investigate failures without breaking lineage.

## Required Output

When this skill is used, document:

- `Hallazgos y Correcciones sugeridas`
- `Correcciones aplicadas`

Call out:

- entity and relationship decisions
- integrity constraints
- index rationale
- sensitive-data handling
- archival or Blob-export implications

## Close-Out Checklist

- Confirm the schema matches the domain lifecycle, not just the current UI.
- Confirm every frequent query has a defensible indexing plan.
- Confirm constraints enforce the important invariants even if application code misbehaves.
- Confirm audit and retention requirements are represented in the design.
- Confirm blobs and SQL metadata are separated cleanly.
