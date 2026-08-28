# SPCare — Production Roadmap

> **Positioning:** শেরপুরের verified public-service directory, local discovery, emergency access এবং community information platform।
>
> **Engineering goal:** একটি নিরাপদ, auditযোগ্য, mobile-first এবং scalable platform তৈরি করা—যেখানে public website, mobile app, backend API এবং আলাদা admin control plane একই versioned contract ব্যবহার করবে।

**Status:** Planning only · **Owner:** SPCare Engineering · **Target geography:** Sherpur, Bangladesh · **Initial release model:** Modular monolith with progressive scale-out

## ১. Product North Star

SPCare-এর প্রথম দায়িত্ব হলো ব্যবহারকারীকে দ্রুত সঠিক সেবার কাছে পৌঁছে দেওয়া। Homepage-এর সৌন্দর্য গুরুত্বপূর্ণ, কিন্তু production product-এর trust নির্ধারিত হবে তথ্যের freshness, verification status, emergency pathway, location accuracy এবং content source দিয়ে। তাই প্রতিটি listing, notice, image এবং post-এর lifecycle, owner এবং audit trail থাকবে।

প্রথম release-এ SPCare সব জেলার super-app হবে না। Sherpur-first directory, service search, notices, emergency pathways, community posting এবং admin-controlled content publishing হবে মূল boundary। Payments, full marketplace, live chat এবং multi-district expansion-এর জন্য extension point রাখা হবে, কিন্তু MVP-তে এগুলো architecture ভারী করার কারণ হবে না।

## ২. System Shape: চারটি Product Surface

| Surface | Route / package | Primary users | Responsibility |
|---|---|---|---|
| Public web | `apps/web` | visitor, registered user | search, browse, notices, service detail, community |
| Admin control plane | `apps/web/admin` or separate admin app | editor, moderator, verifier, admin | update content, images, publish, moderation, audit |
| Mobile app | `apps/mobile` | residents, visitors | quick access, save, report, post, notifications |
| Backend API | `apps/api` | web, mobile, admin | auth, domain rules, data, search, media, audit |

**Recommendation:** public এবং admin একই Next.js codebase-এ আলাদা route group দিয়ে শুরু করা যায়, কিন্তু security boundary স্পষ্ট রাখতে `/admin`-এর layout, middleware, permission guard, navigation এবং API client আলাদা থাকবে। ব্যবহারকারী সংখ্যা, team size বা compliance বাড়লে admin app আলাদা deployable package করা যাবে। Frontend route আলাদা হওয়া যথেষ্ট নয়; backend-এ প্রতিটি admin mutation server-side permission check ও audit event ছাড়া সফল হবে না।

## ৩. Proposed Repository Structure

```text
spcare/
├── apps/
│   ├── web/                         # Next.js public site + /admin control plane
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (public)/
│   │       │   │   ├── page.tsx
│   │       │   │   ├── search/page.tsx
│   │       │   │   ├── services/[slug]/page.tsx
│   │       │   │   ├── notices/[slug]/page.tsx
│   │       │   │   └── community/page.tsx
│   │       │   ├── (auth)/login/page.tsx
│   │       │   └── admin/
│   │       │       ├── layout.tsx
│   │       │       ├── page.tsx
│   │       │       ├── services/page.tsx
│   │       │       ├── services/[id]/edit/page.tsx
│   │       │       ├── categories/page.tsx
│   │       │       ├── locations/page.tsx
│   │       │       ├── notices/page.tsx
│   │       │       ├── featured/page.tsx
│   │       │       ├── media/page.tsx
│   │       │       ├── community/page.tsx
│   │       │       ├── verifications/page.tsx
│   │       │       ├── users-roles/page.tsx
│   │       │       ├── audit-log/page.tsx
│   │       │       └── settings/page.tsx
│   │       ├── features/{search,services,notices,community,admin}/
│   │       ├── components/{ui,layout,forms,data-table}/
│   │       ├── lib/{api,auth,permissions,query,validation}/
│   │       └── tests/{unit,e2e,accessibility}/
│   ├── mobile/                      # Flutter + Riverpod, Phase 3
│   └── api/                         # FastAPI modular monolith
│       ├── app/
│       │   ├── core/                # config, database, security, logging
│       │   ├── modules/
│       │   │   ├── identity/
│       │   │   ├── geography/
│       │   │   ├── directory/
│       │   │   ├── notices/
│       │   │   ├── discovery/
│       │   │   ├── community/
│       │   │   ├── media/
│       │   │   ├── verification/
│       │   │   ├── notifications/
│       │   │   └── audit/
│       │   └── shared/              # errors, pagination, idempotency, permissions
│       ├── migrations/
│       └── tests/{unit,integration,contract,e2e}
├── packages/
│   ├── api-contract/                # OpenAPI + generated TS/Dart clients
│   ├── domain-types/                # IDs, enums, lifecycle states
│   ├── design-tokens/
│   └── config/                      # lint, formatting, tsconfig
├── infra/                            # local compose, deployment, monitoring
├── docs/                             # ADR, ERD, threat model, runbooks
├── .github/workflows/
├── pnpm-workspace.yaml
├── turbo.json
├── docker-compose.yml
├── .env.example
└── SECURITY.md
```

## ৪. Admin Panel Information Architecture

Admin panel-কে শুধু CRUD table হিসেবে বানানো যাবে না। এটি হবে একটি **content operations console**—যেখানে pending work, risk, content state এবং audit history একসঙ্গে দেখা যাবে। Dashboard-এ “কতটি service pending”, “কতটি listing stale”, “কতটি report unresolved”, “কতটি notice expiry-এর কাছাকাছি”—এই operational signals থাকবে।

| Admin area | Capabilities |
|---|---|
| Dashboard | pending queue, stale data, urgent notices, publish activity |
| Services | create/edit, hours, contacts, offerings, map location, verification state |
| Categories | Bengali/English label, icon key, ordering, visibility, priority |
| Locations | district/upazila/union/ward, aliases, map coordinates |
| Notices | draft, preview, schedule, publish, expiry, affected area, source |
| Featured content | homepage slides, rank, start/end date, CTA, fallback item |
| Media library | upload, replace, crop, focal point, alt text, caption, version history |
| Community | reports, hide/restore, moderation note, author restriction |
| Verification | claims, documents, decision, reviewer, rejection reason |
| Users & roles | invite, suspend, role scope, MFA status, session revoke |
| Audit log | who changed what, before/after, request ID, timestamp, export |
| Settings | brand, emergency numbers, provider settings, feature flags |

### Admin routes

`/admin` শুধু authenticated users-এর জন্য accessible হবে। Route middleware anonymous user-কে `/login?next=/admin`-এ পাঠাবে। Login-এর পরও server-side `requirePermission()` guard ছাড়া কোনো data query বা mutation চলবে না। Admin pages-এ browser cache বা local storage-এ sensitive data রাখা হবে না।

Admin UI-তে destructive action-এর জন্য confirmation dialog, reason field এবং permission-aware button থাকবে। “Save” এবং “Publish” আলাদা action হবে। Draft preview public URL-এ tokenized access দিয়ে দেখা যাবে, কিন্তু unpublished data search index বা public API-তে যাবে না।

## ৫. Admin Role ও Permission Model

RBAC-এর সঙ্গে resource scope ব্যবহার করা হবে। উদাহরণস্বরূপ, একজন `district_editor` Sherpur-এর content edit করতে পারলেও role assignment বা verification decision নিতে পারবেন না। Permission code frontend ও backend উভয় জায়গায় shared enum হিসেবে থাকবে, কিন্তু authoritative decision backend-এ থাকবে।

| Role | Key permissions |
|---|---|
| Content Editor | service/category/notice draft ও edit |
| Publisher | preview ও publish; urgent notice-এ second approval |
| Moderator | post review, report resolution, author restriction |
| Verifier | organisation/service claim approve/reject |
| Media Manager | upload, crop, alt text, replace, archive |
| District Admin | নির্দিষ্ট geography scope-এ সব operational action |
| Super Admin | role, policy, system settings; highly restricted |
| Auditor | read-only audit ও compliance export |

High-risk mutation—urgent notice publish, user suspension, role grant, verification approval, bulk archive—দুই ধাপের approval চাইবে। প্রতিটি admin mutation-এ actor, IP/device context যেখানে নীতিসম্মত, request ID, old value, new value, reason এবং timestamp audit হবে।

## ৬. Content ও Image Update Workflow

### Text/content update

Admin editor content edit করবেন → draft save করবেন → preview করবেন → reviewer approval নেবেন → publisher publish করবেন → API cache ও search index invalidate হবে → public frontend নতুন version fetch করবে। Published content সরাসরি overwrite না করে revision তৈরি হবে। ভুল হলে previous revision restore করা যাবে।

### Image update

Admin Media Library থেকে file upload করবেন। Backend signed upload URL দেবে; client সরাসরি object storage-এ upload করবে। Upload complete হওয়ার পর backend file signature, MIME type, size, dimensions এবং malware scan status যাচাই করবে। তারপর admin crop, focal point, Bengali/English alt text এবং caption দিয়ে asset attach করবেন।

Image replace করলে পুরোনো asset সঙ্গে সঙ্গে delete হবে না; version history ও reference count রাখা হবে। কোনো asset active page-এ reference থাকলে hard delete নিষিদ্ধ থাকবে। Responsive variants—thumbnail, card, desktop, high-density—background worker তৈরি করবে। Public URL signed বা CDN-backed হবে; private verification document public bucket-এ রাখা যাবে না।

**Image acceptance rules:** maximum file size, allowed formats, dimension policy, EXIF stripping, alt text required, focal-point preview, failed upload retry এবং orphan asset cleanup। Decorative image হলে empty alt; informational image হলে meaningful alt বাধ্যতামূলক।

## ৭. Core Domain Model

প্রধান data model হবে `Place`, `Organisation`, `ServiceListing` এবং `ServiceOffering` আলাদা entity। একই organisation-এর একাধিক place বা offering থাকলে duplicate listing তৈরি হবে না। প্রতিটি public record-এ `status`, `last_verified_at`, `verification_source`, `updated_by`, `published_revision_id` এবং `data_confidence` থাকবে।

| Entity | Lifecycle |
|---|---|
| ServiceListing | draft → pending_review → verified → published → suspended/archived |
| Notice | draft → review → scheduled → published → expired/archived |
| MediaAsset | uploading → scanning → ready → attached → archived |
| Post | draft → submitted → visible → hidden/rejected → archived |
| VerificationCase | opened → evidence_requested → under_review → approved/rejected |
| FeaturedItem | draft → scheduled → active → expired |

User-generated reviews, ratings বা testimonials কখনো fabricated seed data হিসেবে ব্যবহার করা হবে না। Demo environment-এর fixture-এ স্পষ্ট `DEMO DATA` marker থাকবে এবং production UI-তে demo data accidentally visible হবে না।

## ৮. API ও Data Contract

API root হবে `/api/v1`। Public, authenticated এবং admin endpoint-এর OpenAPI tags আলাদা থাকবে। Collection response cursor pagination ব্যবহার করবে; admin table-এ filter, sort whitelist, bulk-action validation এবং export limit থাকবে। Mutation-এ idempotency key থাকবে, বিশেষত post submission, publish, media attach এবং notification send-এর ক্ষেত্রে।

Admin API examples:

```text
GET    /api/v1/admin/dashboard/summary
GET    /api/v1/admin/services?status=pending_review&area=sherpur
POST   /api/v1/admin/services
PATCH  /api/v1/admin/services/{id}
POST   /api/v1/admin/services/{id}/submit-review
POST   /api/v1/admin/services/{id}/publish
POST   /api/v1/admin/media/presign
POST   /api/v1/admin/media/{id}/complete
POST   /api/v1/admin/media/{id}/replace
PATCH  /api/v1/admin/featured/{id}/schedule
POST   /api/v1/admin/notices/{id}/publish
GET    /api/v1/admin/audit-log?entity_type=service
```

প্রতিটি response-এ `request_id` থাকবে। Error code machine-readable হবে, যেমন `FORBIDDEN`, `VALIDATION_FAILED`, `CONFLICT`, `STALE_REVISION`, `MEDIA_SCAN_FAILED`। Optimistic concurrency-এর জন্য `version` বা `updated_at` check থাকবে, যাতে দুই admin-এর edit silently overwrite না করে।

## ৯. Storage, Cache ও Search

PostgreSQL primary source of truth হবে। Redis ব্যবহার হবে short-lived read cache, rate limit, lock এবং background job queue-এর জন্য। Homepage summary, categories, notices এবং weather response-এর cache key domain-based হবে। Admin publish event-এর পর নির্দিষ্ট key invalidate হবে; global cache flush করা যাবে না।

প্রথমে PostgreSQL full-text search ও `pg_trgm` যথেষ্ট। Bengali normalization, English alias, transliteration, category synonym এবং location alias index হবে। Result rank হবে exact match, verified status, intent/category, proximity ও freshness-এর সমন্বয়ে। Usage signal বাস্তব data থেকে আসবে; fabricated reviews দিয়ে ranking হবে না। Search volume ও latency trigger পূরণ করলে Meilisearch যোগ করা হবে।

## ১০. Security ও Privacy Baseline

Admin authentication-এ MFA, short-lived session, refresh rotation, session revoke এবং device/session list থাকবে। Cookies হলে HttpOnly, Secure, SameSite ব্যবহার হবে। CORS allowlist, CSRF protection, secure headers, input validation, SQL parameterization, upload validation এবং rate limiting বাধ্যতামূলক।

Least privilege, scoped permissions, separate admin audit stream, signed private media URLs, PII minimization, data retention policy এবং user deletion/export process থাকবে। Admin impersonation প্রয়োজন হলে time-bound, reason-required এবং highly audited হবে। Password/OTP brute force, object-level authorization failure, unrestricted resource consumption এবং broken function authorization-এর বিরুদ্ধে automated tests থাকবে।

## ১১. Delivery Steps

### Step 0 — Decisions ও contracts

ERD, permission matrix, content lifecycle, media policy, API error envelope, design tokens এবং ADR approve করতে হবে। এই step শেষ না করে parallel coding শুরু করা যাবে না।

### Step 1 — Monorepo foundation

Workspace, shared types, OpenAPI generation, lint/typecheck/test scripts, local Postgres/Redis compose, environment template, branch protection এবং CI তৈরি হবে। `apps/web` বর্তমান demo থেকে migrate হলেও initial production code আলাদা branch-এ হবে।

### Step 2 — Backend core

Identity, geography, directory, database migrations, seed/import pipeline, public service API এবং audit primitives তৈরি হবে। Seed data সবসময় source-labelled ও demo-labelled হবে।

### Step 3 — Public web production shell

Search-first homepage, search result, category filter, service detail, notice detail, map/call/directions CTA, loading/error/empty/offline states এবং SEO metadata তৈরি হবে। Existing SPCare visual identity রাখা হবে, কিন্তু data-driven component ব্যবহার হবে।

### Step 4 — Admin authentication ও shell

`/admin` route group, middleware, session guard, permission-aware navigation, dashboard summary, responsive data table, filters, skeleton, empty state এবং confirmation patterns তৈরি হবে। প্রথমে read-only dashboard চালিয়ে permission ভুল ধরতে হবে।

### Step 5 — Admin content CRUD

Services, categories, areas এবং site configuration edit করা যাবে। Draft save, field validation, conflict detection, preview এবং revision history থাকবে। Public API cache invalidation test করা হবে।

### Step 6 — Media management

Media library, signed upload, scan status, crop/focal point, alt text, responsive variants, replace/archive এবং reference safety implement হবে। Failed asset public UI-তে placeholder হিসেবে প্রকাশ করা যাবে না।

### Step 7 — Notices, featured content ও publish workflow

Notice composer, affected area, urgency, source, schedule, expiry, two-person approval, homepage featured rank এবং rollback implement হবে। Expired notice public feed-এ default hide হবে, কিন্তু audit-এ থাকবে।

### Step 8 — Verification ও moderation

Service claim, evidence upload, reviewer queue, rejection reason, report handling, post visibility, user restriction, audit view এবং moderator metrics তৈরি হবে।

### Step 9 — Community, notifications ও mobile

Post composer, in-app notification, provider abstraction, Flutter home/search/service detail, saved items এবং push permission flow তৈরি হবে। Web/mobile উভয়ই generated API client ব্যবহার করবে।

### Step 10 — Scale, analytics ও operational hardening

PostGIS proximity search, dedicated search trigger evaluation, cache tuning, background job retry/dead-letter, analytics, backup restore rehearsal, load test, disaster runbook এবং staged production rollout হবে।

## ১২. CI/CD ও Environments

`local`, `staging` এবং `production` environment আলাদা হবে। CI-তে format, lint, TypeScript/Python checks, unit/integration/contract tests, build, dependency audit, secret scan, migration validation এবং accessibility smoke test থাকবে। Staging deploy-এর পরে Playwright critical flows চলবে। Production deploy tagged release থেকে হবে।

Database migration expand–migrate–contract pattern অনুসরণ করবে। Application rollback এবং database rollback আলাদা runbook হবে। Object storage versioning, encrypted backup, point-in-time recovery এবং quarterly restore drill থাকবে। Admin publish বা media replace-এর পর cache/index update ব্যর্থ হলে retryable outbox event রাখা হবে, যাতে public state ও admin state permanently diverge না করে।

## ১৩. Testing ও Acceptance Criteria

Admin panel “done” হবে যখন একজন authorised editor draft content update করতে পারবেন, unauthorised user `/admin` access করতে পারবেন না, publish না করা content public endpoint-এ দেখা যাবে না, image replace করলে old revision recover করা যাবে, audit log-এ before/after দেখা যাবে, এবং concurrent edit conflict silently overwrite হবে না।

Critical automated flows:

1. Visitor search করে verified service detail-এ পৌঁছাবে এবং call/directions action দেখতে পাবে।
2. Editor service edit করে draft save করবে; publisher ছাড়া publish করতে পারবে না।
3. Media manager valid image upload করবে; invalid/oversized/scanned-failed file reject হবে।
4. Publisher notice schedule করবে; affected area ও expiry public API-তে প্রতিফলিত হবে।
5. Moderator report resolve করবে; action এবং reason audit log-এ থাকবে।
6. Verifier claim approve করলে listing status update হবে এবং cache invalidation হবে।
7. Mobile এবং web একই OpenAPI contract থেকে compatible response পাবে।

Target checks হবে 320px, 390px, 480px, 768px এবং desktop widths-এ; keyboard/focus, reduced motion, semantic label, mixed Bengali-English text এবং slow-network loading state আলাদা করে পরীক্ষা হবে।

## ১৪. Milestone Definition

| Milestone | Outcome | Exit condition |
|---|---|---|
| M0 | Approved architecture | ERD + permission matrix + OpenAPI draft |
| M1 | Foundation | CI green, local stack reproducible |
| M2 | Public directory | browse/search/detail production-like |
| M3 | Admin shell | separate `/admin`, auth, scoped roles |
| M4 | CMS | service/category/notice/media update workflow |
| M5 | Trust operations | verification, moderation, audit |
| M6 | Mobile/community | shared API, posts, notifications |
| M7 | Production hardening | load, restore, security and rollout evidence |

## ১৫. Non-negotiable Engineering Rules

প্রথমত, frontend-এ কোনো secret বা authoritative permission রাখা যাবে না। দ্বিতীয়ত, public API ও admin API একই database ব্যবহার করলেও response schema ও permission boundary আলাদা থাকবে। তৃতীয়ত, published content revision ছাড়া overwrite করা যাবে না। চতুর্থত, image update মানেই শুধু URL বদলানো নয়—scan, alt text, variant, reference এবং rollback সম্পন্ন করতে হবে। পঞ্চমত, fake review, fake rating, fake testimonial বা fabricated user-generated engagement production বা demo-তে real হিসেবে দেখানো যাবে না। ষষ্ঠত, “microservices later” নীতি অনুসরণ করে প্রথমে modular monolith-এর domain boundary শক্ত করতে হবে।

## ১৬. Recommended First Sprint

প্রথম sprint-এর output code volume দিয়ে নয়, decision quality দিয়ে মাপা হবে। Sprint শেষে repository-তে `docs/architecture/erd.md`, `docs/architecture/permissions.md`, `docs/api/openapi.yaml`, `docs/content-lifecycle.md`, `docs/media-policy.md`, `packages/domain-types` এবং CI skeleton থাকবে। এরপরই production implementation শুরু করা নিরাপদ।

### References

[1] [OWASP API Security Top 10 — 2023](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)

[2] [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)

[3] [OpenAPI Initiative](https://www.openapis.org/)
