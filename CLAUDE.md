# SpCare — AI Engineering Contract

**Project owner:** IRFAN  
**Repository:** `irfan420x/SpCare`  
**Product:** Sherpur-first verified public-service, discovery and community platform  
**Document role:** This file is the operating contract for Claude, Codex, Gemini, Manus, OpenHands, or any other AI coding agent working in this repository.

> **Non-negotiable rule:** Before changing code, read `README.md`, `ROADMAP.md`, and `PROGRESS.md`. After every meaningful task, update `PROGRESS.md` with what changed, what was verified, what remains, and the exact next task.

## 1. Product Context

SPCare means **“এক জেলা, এক প্ল্যাটফর্ম”**. The platform helps residents and visitors discover verified services, hospitals, blood banks, emergency support, government offices, tourism locations, hotels, notices and community information in Sherpur, Bangladesh.

The system has four planned surfaces:

| Surface | Purpose |
|---|---|
| Public web | Search-first service discovery, notices, service details, community feed |
| Admin panel | Separate `/admin` control plane for content, media, publishing, verification and moderation |
| Mobile app | Fast resident access, saved items, notifications and posts |
| Backend API | Shared source of truth, permissions, search, media, audit and integrations |

The admin panel is not a decorative dashboard. It is the operational control plane. Every content change must have an author, state, timestamp and audit trail.

## 2. Source of Truth and Planning Rules

`ROADMAP.md` is the long-term architecture and milestone plan. `PROGRESS.md` is the current execution ledger. Code, schemas and API contracts are authoritative only when they are committed and documented.

When a new requirement conflicts with an existing decision, do not silently rewrite the architecture. Record an Architecture Decision Record under `docs/architecture/adr-*.md`, update `ROADMAP.md` if the decision changes scope, and note the decision in `PROGRESS.md`.

Do not implement a new framework, database, provider or major dependency only because it is popular. First explain its job, operational cost, migration impact and rollback path.

## 3. Target Architecture

The recommended first production shape is a **modular monolith**, not a collection of premature microservices:

```text
                 ┌─────────────────────────────┐
                 │        Public Web            │
                 │   Next.js · mobile-first     │
                 └──────────────┬──────────────┘
                                │ generated client
┌───────────────┐     ┌─────────▼──────────┐     ┌────────────────┐
│ Flutter App   │────▶│  FastAPI API       │────▶│ PostgreSQL     │
│ Phase 3       │     │  domain modules    │     │ + PostGIS      │
└───────────────┘     └──────┬───────┬─────┘     └────────────────┘
                             │       │
                    ┌────────▼─┐ ┌──▼───────────┐
                    │ Redis     │ │ Object Store │
                    │ cache/jobs│ │ images/files │
                    └───────────┘ └──────────────┘
                             ▲
                 ┌───────────┴───────────┐
                 │ Admin /admin           │
                 │ editor · verifier     │
                 │ moderator · publisher │
                 └────────────────────────┘
```

Target technologies are Next.js + TypeScript for web/admin, FastAPI + Pydantic v2 + SQLAlchemy 2 for API, PostgreSQL + PostGIS for data, Redis for cache/jobs, S3-compatible storage for media, OpenAPI-generated clients for web/mobile, and Flutter + Riverpod for mobile.

Use the current Vite/React demo as a visual prototype and migration reference. Do not treat demo fixtures, visual ratings, review counts or generated copy as production truth.

## 4. Repository Shape

```text
apps/web       # public web and isolated /admin route group
apps/mobile    # Flutter app, later milestone
apps/api       # FastAPI modular monolith
packages/      # API contract, domain types, design tokens, configs
docs/          # ADRs, ERD, threat model, runbooks
infra/         # local compose, CI/CD and monitoring
ROADMAP.md     # product and engineering roadmap
PROGRESS.md    # living execution record
```

Feature ownership should be obvious. Prefer `modules/directory`, `modules/notices`, `modules/media`, `modules/verification` and `modules/audit` over giant generic files such as `utils.py`, `api.ts` or `components.tsx`.

## 5. Admin Panel Rules

The admin route must be separate: `/admin`. It must have its own layout, navigation, middleware and permission guard. The frontend may hide controls based on permission, but backend authorization is always authoritative.

Admin areas are Dashboard, Services, Categories, Locations, Notices, Featured Content, Media Library, Community Moderation, Verification Queue, Users & Roles, Audit Log and Settings.

Editing and publishing are different actions. A content editor can save a draft. A publisher can publish only after required review. Urgent notices, user suspension, role changes, verification approval and bulk archive require explicit confirmation and an audit reason.

Admin-managed fields must support Bengali and English where needed, source attribution, visibility state, `last_verified_at`, updated-by metadata and revision history. Concurrent edits must result in a conflict or rebase prompt; never silently overwrite another admin's change.

## 6. Media Rules

All images use the media workflow: presigned upload → file validation → malware scan status → responsive variant generation → alt text/focal point → attach to a revision → publish. Image replacement does not hard-delete the previous asset if it is referenced by a published revision.

Public assets can be CDN-backed. Verification documents and private evidence must use private storage with short-lived signed URLs. Enforce file size, format, dimensions, content signature, EXIF stripping and alt-text policy. A failed asset must never appear as a broken or fake “successful” production image.

## 7. API and Data Rules

All API routes use `/api/v1`. Use OpenAPI as the contract and generate TypeScript/Dart clients. List endpoints use bounded cursor pagination, explicit filter/sort allowlists and consistent `data/meta/links` responses. Mutations use idempotency keys when retries could duplicate work.

Error responses use a machine-readable code and a request ID:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "তথ্য যাচাই করা যায়নি।",
    "request_id": "req_01...",
    "details": []
  }
}
```

Use shared lifecycle enums such as `draft`, `pending_review`, `verified`, `published`, `suspended`, `expired` and `archived`. Database timestamps are UTC. Public labels are localized in the frontend, not stored as the only canonical database value.

## 8. Trust, Security and Content Integrity

Never fabricate user reviews, ratings, testimonials, official announcements, engagement counts or verification claims. Demo data must be clearly labelled and must not enter production seeds accidentally.

Use least privilege, scoped RBAC/ABAC, MFA for admins, secure sessions, rate limits, input validation, CSRF protection where applicable, CORS allowlists, signed private media URLs, audit logs and dependency/security scanning. Do not place secrets in client code or commit `.env` files.

Every public service should show an understandable verification state, source or owner, last verified date and a way to report incorrect information. Sensitive personal data must be minimized and access-controlled.

## 9. Frontend Standards

Build mobile-first at 320px, 390px and 480px, then extend to tablet and desktop. Preserve SPCare's green care identity and gold warmth; use red only for urgent states. Use semantic HTML, visible focus, keyboard access, screen-reader labels, sufficient contrast, responsive images, loading/error/empty/offline states and reduced-motion support.

Server state belongs in the API/query layer. Local interaction state belongs close to the component. Avoid global stores for data that should be cached and invalidated by the server. Do not create a button that appears functional but has no success, error or placeholder feedback.

## 10. AI Task Execution Protocol

For every task, an AI agent must follow this sequence:

1. Read `README.md`, `ROADMAP.md`, `PROGRESS.md` and the files relevant to the requested feature.
2. Restate the requested outcome, assumptions, affected areas and risks in the task notes.
3. Check whether the work belongs to the current milestone. If not, update `ROADMAP.md` or record an ADR before coding.
4. Make the smallest coherent change that preserves existing contracts and style.
5. Run relevant format, lint, typecheck, unit, integration, contract and build checks.
6. Verify the user-facing flow, including loading, empty, error, permission and mobile states.
7. Update `PROGRESS.md` immediately. Never postpone the progress update.
8. Report completed work, validation evidence, known limitations and the exact next task.

If blocked, do not invent a workaround silently. Record the blocker, attempted solutions, affected files and the decision needed from IRFAN.

## 11. Progress Update Contract

After each meaningful task, update `PROGRESS.md` using this structure:

```markdown
## YYYY-MM-DD — Short task title

### Completed
- Concrete files/features changed.

### Validation
- Commands and results.

### Decisions
- New architecture or product decisions.

### Known limitations / blockers
- Honest unresolved items, or “None”.

### Next task
- One specific, actionable task for the next agent.
```

A progress entry is incomplete if it says only “done”. It must tell the next agent what to do next and how to verify it.

## 12. Commit and Pull Request Rules

Use small, descriptive commits such as `feat(admin): add service draft workflow`, `fix(media): reject invalid upload`, or `docs: update progress`. A pull request must describe scope, screenshots or API examples where relevant, migration impact, security impact, test evidence and rollback notes.

Do not use destructive git commands such as `git reset --hard` to solve uncertainty. Preserve work, create a branch, or use a documented rollback checkpoint.

**Maintainer:** IRFAN  
**Last contract review:** 2026-08-29
