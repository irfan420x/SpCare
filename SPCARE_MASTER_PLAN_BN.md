# SPCare — Advanced Full-Stack Master Plan

**প্রস্তাবিত সংস্করণ:** 1.0 · **ধরণ:** Production architecture ও delivery blueprint · **ভাষা:** বাংলা

> **মূল সিদ্ধান্ত:** SPCare-কে শুধু একটি সুন্দর homepage নয়, বরং শেরপুরের verified public-service directory, local discovery, emergency access এবং community information platform হিসেবে তৈরি করতে হবে। প্রথম release-এ দ্রুত, নির্ভরযোগ্য এবং auditযোগ্য একটি **modular monolith** তৈরি করা হবে; অপ্রয়োজনীয় microservice complexity শুরুতেই আনা হবে না।

## ১. Executive Direction

বর্তমান demo-এর সবচেয়ে মূল্যবান দিক হলো local identity, service categories, tourism discovery এবং community content। Production version-এ এই visual language থাকবে, কিন্তু তার নিচে একটি পরিষ্কার trust model বসাতে হবে: কোন তথ্য verified, কোনটি community-submitted, কোনটি pending, কখন সর্বশেষ update হয়েছে, এবং জরুরি তথ্যের source কী—ব্যবহারকারী যেন প্রতিটি গুরুত্বপূর্ণ সিদ্ধান্তের আগে তা বুঝতে পারেন।

DeepSeek-এর file structure ভালো starting point, কিন্তু সেটিকে সরাসরি implement করলে কয়েকটি সমস্যা হবে: web, mobile এবং backend-এর contract আলাদা হয়ে যেতে পারে; একই business rule একাধিক জায়গায় duplicate হতে পারে; Next.js API route ও FastAPI একসঙ্গে রেখে boundary অস্পষ্ট হতে পারে; এবং শুরুতেই Flutter, Turborepo, Redis, search engine, push notification—সব চালু করলে delivery ধীর হবে। তাই SPCare-এর জন্য নিচের architectureটি **contract-first, feature-based এবং progressive complexity** নীতিতে সাজানো হয়েছে।

| স্তর | Recommended choice | কেন |
|---|---|---|
| Web | Next.js App Router + TypeScript + Tailwind + TanStack Query | SEO, server rendering, route-level loading, typed client cache |
| Mobile | Flutter + Riverpod, Phase 2 | একই API ব্যবহার করবে; web MVP স্থিতিশীল হওয়ার পর শুরু হবে |
| Backend | FastAPI + Pydantic v2 + SQLAlchemy 2 + Alembic | পরিষ্কার typed API ও modular Python architecture |
| Primary database | PostgreSQL | relational data, geospatial extension, full-text/trigram search |
| Cache ও jobs | Redis | short-lived cache, rate-limit counter, background jobs |
| File storage | S3-compatible object storage | post image, service logo, verification documents |
| Search | PostgreSQL FTS + pg_trgm first; Meilisearch later | শুরুতে কম অপারেশনাল খরচ; data volume বাড়লে dedicated search |
| API contract | OpenAPI-generated TypeScript/Dart clients | web/mobile/backend drift কমানো |
| Deployment | Dev → staging → production | migration, monitoring ও rollback নিরাপদ রাখা |

## ২. Product Boundary ও User Roles

SPCare-এর public promise হবে: **“শেরপুরের দরকারি সেবা, স্থান ও তথ্য—বিশ্বাসযোগ্যভাবে এক জায়গায়।”** প্রথম release-এ সব জেলার platform, full marketplace, live chat, complex payments বা social-media clone বানানো হবে না। এগুলো পরবর্তী expansion-এর জন্য extension point হিসেবে রাখা হবে।

| Role | ক্ষমতা | Trust level |
|---|---|---|
| Visitor | search, browse, map, notices, weather, public posts | anonymous |
| Registered user | save, report, react, submit post/service correction | low until verified |
| Service owner | নিজের service profile claim, hours/contact update request | verified organisation required |
| Moderator | approve/reject, merge duplicate, hide harmful content | operational |
| Verifier | documents, location ও ownership যাচাই | elevated, audited |
| Editor | notices, homepage feature, official posts publish | editorial |
| Admin | role, policy, system configuration, audit review | tightly restricted |

**Trust policy:** user-generated ratings, reviews, testimonials বা engagement কখনো seed/mock করা যাবে না। Demo environment-এ যেকোনো sample content স্পষ্টভাবে `DEMO DATA` হিসেবে চিহ্নিত থাকবে। Production-এ প্রতিটি user-generated item-এর source, author, created time, moderation state ও report history থাকবে।

## ৩. Recommended Monorepo Structure

```text
spcare/
├── apps/
│   ├── web/                         # Next.js public + admin web app
│   ├── mobile/                      # Flutter app, Phase 2
│   └── api/                         # FastAPI modular monolith
├── packages/
│   ├── api-contract/                # OpenAPI, generated TS/Dart clients
│   ├── domain-types/                # shared enums, IDs, status vocabulary
│   ├── eslint-config/
│   ├── tsconfig/
│   └── design-tokens/               # colors, spacing, typography source
├── infra/
│   ├── docker/                      # local postgres/redis/mailhog
│   ├── terraform/                   # optional cloud infrastructure later
│   └── monitoring/
├── docs/
│   ├── product/                     # PRD, roles, content policy
│   ├── architecture/                # ADRs, diagrams, threat model
│   ├── api/                         # API usage and examples
│   └── operations/                  # runbooks, incident response
├── .github/workflows/
│   ├── ci.yml
│   ├── deploy-staging.yml
│   └── deploy-production.yml
├── pnpm-workspace.yaml
├── turbo.json
├── docker-compose.yml
├── .env.example
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md
```

### Web application boundary

`apps/web`-এ route group হবে `(public)`, `(auth)`, `(account)` এবং `(admin)`। Feature folder হবে `features/search`, `features/services`, `features/notices`, `features/community`, `features/location`, `features/profile`। Server state-এর জন্য TanStack Query ব্যবহার করা হবে; local UI state-এর জন্য ছোট scoped React state বা Zustand ব্যবহার করা যাবে, কিন্তু server data store হিসেবে Zustand ব্যবহার করা হবে না।

প্রতিটি public route-এ loading skeleton, empty state, error state, not-found state এবং mobile layout থাকবে। Homepage-এ server-rendered initial data থাকবে, client-side interactions শুধু search, carousel, filter, save, reaction ও drawer-এর মতো প্রয়োজনীয় জায়গায় hydration আনবে।

### Backend boundary

`apps/api/app/` feature-based হবে:

```text
app/
├── main.py
├── core/                 # config, logging, security, database
├── modules/
│   ├── identity/         # users, roles, sessions
│   ├── geography/        # divisions, upazilas, wards, coordinates
│   ├── directory/        # categories, organisations, service listings
│   ├── notices/          # official notices, urgency, publishing
│   ├── discovery/        # search, featured items, recommendations
│   ├── community/        # posts, reactions, reports, moderation
│   ├── weather/          # provider adapter, cached snapshots
│   ├── verification/     # claims, documents, review queue
│   ├── notifications/    # in-app and provider adapters
│   └── audit/            # immutable admin/security events
├── shared/               # pagination, errors, idempotency, permissions
└── tests/
    ├── unit/
    ├── integration/
    ├── contract/
    └── e2e/
```

এটি microservices নয়; এক deployable API-এর মধ্যে আলাদা domain module। প্রয়োজন হলে `notifications`, `search` বা `media` আলাদা worker/service করা যাবে, কিন্তু database ownership ও API boundary আগে থেকেই module হিসেবে পরিষ্কার থাকবে।

## ৪. Data Model ও Trust-aware Domain Design

Database design-এর কেন্দ্র হবে `ServiceListing` নয়, বরং **Place + Organisation + Offering** ধারণা। একটি হাসপাতাল একটি physical place; তার emergency desk, outpatient service ও blood bank আলাদা offering হতে পারে। এতে duplicate data কমে এবং search ফলাফল আরও নির্ভুল হয়।

| Entity | গুরুত্বপূর্ণ field | মূল rule |
|---|---|---|
| User | id, phone/email, display name, status | PII encrypted/limited exposure |
| RoleAssignment | user_id, role, scope, granted_by | every privilege audited |
| GeoArea | district, upazila, union/ward, centroid | hierarchical, indexed |
| Place | name, address, lat/lng, geo_area_id | map ও proximity search |
| Organisation | legal/display name, type, owner | organisation verification আলাদা |
| ServiceListing | organisation/place/category, hours, contacts, status | `draft/pending/verified/suspended` |
| ServiceOffering | listing_id, title, availability, fee_label | specific user need represent করে |
| Category | slug, Bengali name, icon key, priority | icon URL নয়, safe icon key |
| Notice | title, body, source, urgency, publish window | official publishing workflow |
| FeaturedItem | target type/id, rank, start/end | homepage editorial control |
| Post | author, body, media, visibility, moderation state | community content policy |
| Reaction | post_id, user_id, type | unique composite key |
| Report | reporter, target, reason, status | moderation queue |
| VerificationCase | subject, documents, decision, reviewer | immutable decision log |
| WeatherSnapshot | provider, location, values, captured_at | cacheable, provider-labelled |
| SavedItem | user_id, target_type/id | unique composite key |
| AuditEvent | actor, action, entity, diff, request_id | append-only, restricted |

### Status vocabulary

Status stringগুলো shared package-এ enum হিসেবে থাকবে: `active`, `draft`, `pending_review`, `verified`, `rejected`, `suspended`, `archived`। Bengali label frontend-এ map হবে; database-এ বাংলা text রাখা হবে না। প্রতিটি listing-এ `last_verified_at`, `verification_source`, `updated_by` ও `data_confidence` থাকবে।

### Database rules

PostgreSQL-এ UUID বা ULID identifier ব্যবহার করা হবে, soft-delete-এর জন্য `deleted_at` রাখা হবে, এবং destructive delete শুধু audited admin operation হবে। `created_at`, `updated_at` সব entity-তে UTC timestamp হবে। Contact, email বা verification document-এর মতো sensitive field access layer-এর মাধ্যমে expose হবে; public API-তে প্রয়োজনের অতিরিক্ত তথ্য যাবে না।

Geospatial proximity search-এর জন্য PostGIS ব্যবহার করা হবে। প্রথমে district/upazila filter ও bounding-box query যথেষ্ট; ব্যবহারকারী সংখ্যা বাড়লে distance ranking ও map clustering যোগ হবে। Full-text search-এর জন্য Bengali normalization, synonym dictionary, category alias, transliteration এবং typo-tolerant query strategy design phase-এই নির্ধারণ করতে হবে।

## ৫. API Contract Strategy

API হবে `/api/v1` দিয়ে versioned। Breaking change হলে `/api/v2` আসবে; পুরোনো version হঠাৎ বন্ধ হবে না। OpenAPI specification backend থেকে generated হবে এবং তার ভিত্তিতে TypeScript ও Dart client তৈরি হবে। Contract repository-তে endpoint description, error code, sample request/response এবং pagination rule versioned থাকবে।

### Core endpoint groups

| Group | Endpoint examples | Access |
|---|---|---|
| Identity | `POST /auth/request-otp`, `POST /auth/verify`, `GET /me` | public/auth |
| Geography | `GET /areas`, `GET /areas/{id}/children` | public |
| Directory | `GET /services`, `GET /services/{id}`, `GET /categories` | public |
| Search | `GET /search?q=&category=&area=&lat=&lng=` | public, rate limited |
| Notices | `GET /notices`, `GET /notices/{id}` | public |
| Featured | `GET /home/featured` | public |
| Community | `GET /posts`, `POST /posts`, `POST /posts/{id}/reactions` | mixed |
| Saved | `GET /saved`, `PUT /saved/{type}/{id}` | auth |
| Verification | `POST /claims`, `POST /claims/{id}/documents` | owner/auth |
| Admin | `/admin/moderation/*`, `/admin/verifications/*` | scoped admin |

### Response envelope

সফল collection response-এ `data`, `meta` এবং `links` থাকবে। `meta`-তে `page`, `page_size`, `total_estimate` বা cursor থাকবে। Error response হবে:

```json
{
  "error": {
    "code": "SERVICE_NOT_FOUND",
    "message": "সেবাটি পাওয়া যায়নি।",
    "request_id": "req_01...",
    "details": []
  }
}
```

Mutation endpoint-এ `Idempotency-Key` ব্যবহার করা হবে। Search ও list endpoint-এ default page size, maximum page size, sort whitelist এবং filter whitelist থাকবে। User-provided sort field সরাসরি SQL-এ যাবে না।

## ৬. Authentication, Authorization ও Security

Public browsing login ছাড়াই চলবে। Save, react, post, report ও claim-এর জন্য authentication প্রয়োজন হবে। User onboarding-এর জন্য phone OTP বা OIDC provider abstraction রাখা হবে, যেন provider বদলালে business logic না বদলায়। Admin account-এ MFA বাধ্যতামূলক, short-lived access token, refresh-token rotation এবং session revocation থাকতে হবে।

Authorization হবে RBAC-এর সঙ্গে resource scope মিশিয়ে: একজন `editor` homepage notice publish করতে পারবে, কিন্তু verification decision নিতে পারবে না; একজন `verifier` নির্দিষ্ট district বা category scope-এ কাজ করতে পারবে। Backend permission check ছাড়া frontend-এ কোনো button hide করা security হিসেবে গণ্য হবে না।

Security baseline হিসেবে OWASP API Security Top 10-এর object-level authorization, broken authentication, unrestricted resource consumption, SSRF ও improper inventory management ঝুঁকি address করা হবে [1]। Input validation Pydantic schema-তে, rate limiting Redis-এ, file upload MIME/size/signature validation-এ, এবং secret frontend bundle-এ কখনো যাবে না।

অতিরিক্ত controls হবে: CORS allowlist, CSRF protection যেখানে cookie auth ব্যবহৃত হবে, secure headers, structured audit log, login abuse detection, report spam throttling, document access signed URL, dependency scanning এবং regular backup restore drill।

## ৭. Search ও Discovery Engine

Search SPCare-এর core product feature। প্রথম release-এ PostgreSQL FTS + `pg_trgm` ব্যবহার করা হবে। Search index field হবে name, Bengali normalized name, English alias, address, category, organisation, service offering এবং common synonyms। Bengali text cleaning-এর মধ্যে Unicode normalization, punctuation removal, whitespace normalization, common spelling variant এবং transliteration alias থাকবে।

Ranking হবে: exact name match → category/intent match → verified status → geographic proximity → popularity signal। Popularity signal ব্যবহার করলে তা বাস্তব usage data থেকে আসবে; fake rating বা fake review দিয়ে ranking প্রভাবিত করা যাবে না। ৫০,০০০-এর বেশি active listing, complex typo tolerance বা sub-200ms search requirement হলে Meilisearch/managed search যোগ করার trigger রাখা হবে।

Search result-এ শুধু নাম নয়, category badge, verified state, distance, hours, emergency availability এবং last verified date দেখানো হবে। Empty search-এ category fallback, nearby fallback এবং spelling suggestion থাকবে।

## ৮. Frontend Information Architecture

Homepage হবে service desk, marketing landing page নয়। Above-the-fold hierarchy হবে: location context → search → urgent/hospital pathways → featured local item → all categories। Mobile bottom navigation থাকবে `হোম`, `সেবা`, central `পোস্ট`, `বার্তা`, `প্রোফাইল` হিসেবে। Desktop-এ একই information architecture wider layout-এ যাবে, কিন্তু card density বাড়িয়ে mobile clarity নষ্ট করা যাবে না।

### Key screens

| Screen | Primary job | Required states |
|---|---|---|
| Home | দ্রুত প্রয়োজনীয় পথ খুঁজে দেওয়া | loading, offline, empty, content stale |
| Search results | নির্ভুল service discovery | filter, sort, map/list, no result |
| Service detail | call, directions, hours, verification বোঝানো | closed/open, unavailable, report |
| Notice detail | official তথ্য পড়া ও share করা | urgent, expired, source |
| Community feed | local post দেখা ও report করা | moderation, pagination |
| Post composer | photo/text post submit | draft, upload, failed, pending |
| Saved | পরে ফিরে আসা | empty, remove, sync conflict |
| Profile | privacy, preference, submissions | logout, delete request |
| Admin | verification, moderation, editorial publish | audit, bulk action, confirmation |

Accessibility লক্ষ্য হবে WCAG 2.2 AA-র সঙ্গে সামঞ্জস্যপূর্ণ keyboard navigation, focus visibility, semantic headings, screen-reader labels, reduced motion, color-independent status এবং touch target sizing [2]। Bengali content-এর জন্য line-height, fallback font, truncation এবং mixed Bangla-English rendering আলাদা করে test করতে হবে।

Performance budget হিসেবে initial mobile route-এ low-JS server-rendered shell, responsive images, lazy media, cacheable API response এবং route-level code splitting থাকবে। Core user action যেন slow 3G-তেও perceived progress দেখায়; প্রতিটি async action-এ skeleton বা optimistic state থাকবে, কিন্তু destructive mutation-এ optimistic UI ব্যবহার করা হবে না।

Offline strategy হবে selective: cached categories, last successful home snapshot এবং emergency numbers local cache-এ থাকবে; stale data-তে timestamp ও “সর্বশেষ আপডেট” label থাকবে। Offline অবস্থায় নতুন post বা verification submit করা Phase 2-এর আগে নয়।

## ৯. Admin, Verification ও Moderation

SPCare-এর credibility admin workflow-এর উপর নির্ভর করবে। Service listing approve হওয়ার আগে duplicate check, phone verification, location plausibility, category validation এবং source document review থাকবে। Verification case-এ reviewer, decision reason, evidence reference এবং timestamp বাধ্যতামূলক।

Community post moderation হবে risk-based: spam, harassment, misinformation, dangerous instruction, personal data leak এবং duplicate report আলাদা reason code পাবে। জরুরি notice publish করার সময় source, expiry, severity, affected area এবং approver দুই ধাপে confirm করা হবে। Admin dashboard-এ কোনো content silently edit না করে revision history রাখা হবে।

## ১০. Notifications, Weather ও Background Jobs

Notification abstraction থাকবে—প্রথমে in-app notification, পরে push/SMS/email provider adapter। User preference হবে category ও urgency ভিত্তিক; জরুরি official notice default enabled হলেও opt-out policy স্পষ্ট থাকবে। Duplicate notification ঠেকাতে event key ও deduplication window ব্যবহার করা হবে।

Weather provider response frontend-এ সরাসরি যাবে না। Backend provider adapter response normalize করে location-based cache-এ রাখবে। Weather unavailable হলে last known timestamp এবং fallback copy দেখানো হবে। Background job দিয়ে weather refresh, search index update, image processing, notification delivery, stale listing reminder এবং scheduled notice publish করা যাবে।

Realtime chat এখনই প্রয়োজন নয়। জরুরি notice-এর জন্য প্রথমে short polling বা Server-Sent Events যথেষ্ট; দুই-way realtime messaging সত্যিই product requirement হলে পরে WebSocket যোগ হবে।

## ১১. CI/CD, Environments ও Operations

তিনটি environment থাকবে: `local`, `staging`, `production`। প্রত্যেক environment-এর database, object storage bucket, OAuth credential এবং notification provider আলাদা হবে। Production migration deploy-এর আগে staging-এ restore test ও migration test হবে। Migration কখনো application startup-এর অন্ধকারে auto-run করা হবে না।

CI pipeline-এ lint, typecheck, unit test, API contract test, build, dependency audit, secret scan এবং migration validation থাকবে। Pull request-এ required checks ছাড়া merge হবে না। Production deploy হবে tagged release থেকে; rollback হবে previous immutable image/commit-এ। Database rollback সবসময় code rollback-এর মতো সহজ নয়, তাই backward-compatible migration pattern ব্যবহার করা হবে: expand → migrate → contract।

Observability minimum হবে structured JSON logs, request ID, error tracking, latency/error metrics, background job metrics, audit log এবং uptime health endpoint। Alert thresholds user-facing impact অনুযায়ী হবে—শুধু CPU alert নয়। Incident runbook-এ API outage, database connection exhaustion, notification backlog, bad migration, leaked document URL এবং content abuse-এর আলাদা playbook থাকবে।

Backup strategy: encrypted daily backup, point-in-time recovery যেখানে provider সমর্থন করে, object storage versioning, এবং মাসিক restore drill। Backup সফল হয়েছে মানেই restore সফল হয়েছে নয়—restore rehearsal acceptance criterion হতে হবে।

## ১২. Testing Strategy

Testing pyramid হবে unit-heavy, contract-driven এবং user-flow-focused। Backend service/domain logic-এর unit test, database query ও permission-এর integration test, OpenAPI compatibility test, frontend component/accessibility test এবং Playwright end-to-end test থাকবে। Mobile app API contract ও critical flow-তে আলাদা test suite চালাবে।

Critical E2E flows হলো: anonymous search → service detail → call/directions; login → save → refresh; user report → moderator decision; service claim → verifier approval; editor notice draft → publish → expiry; offline cached home → reconnect sync। প্রতিটি release-এ 320px, 390px, 768px এবং desktop viewport test হবে।

Quality gates হিসেবে নতুন endpoint-এর contract, permission test, error path, observability event, documentation এবং migration review ছাড়া merge হবে না। Performance check-এ homepage payload, search latency, API p95, image weight এবং error rate track করা হবে।

## ১৩. Phased Delivery Roadmap

### Phase 0 — Discovery ও foundations, 1–2 সপ্তাহ

Product scope, user roles, trust policy, content moderation policy, design tokens, naming convention, API error vocabulary, ADR এবং initial database ERD final হবে। Existing demo data-কে production data হিসেবে ধরে নেওয়া যাবে না; সব fixture-এ `is_demo` বা equivalent metadata থাকবে।

### Phase 1 — Public directory MVP, 3–5 সপ্তাহ

Next.js public shell, FastAPI modular monolith, PostgreSQL schema, categories, areas, service listing, search, service detail, notices, homepage API এবং admin seed/import workflow তৈরি হবে। Existing frontend demo থেকে visual system reuse করা যাবে, কিন্তু data-fetching layer contract-based হবে।

### Phase 2 — Trust ও operations, 3–4 সপ্তাহ

Authentication, saved items, report flow, service claim, verification queue, moderation dashboard, audit log, object storage এবং observability যুক্ত হবে। এই phase শেষে public content production-like workflow-এ পরিচালনা করা যাবে।

### Phase 3 — Community ও mobile, 4–6 সপ্তাহ

Community post composer, moderation-aware feed, reactions, push notification foundation এবং Flutter mobile app-এর home/search/service detail flow তৈরি হবে। Web ও mobile একই generated API client ব্যবহার করবে।

### Phase 4 — Discovery scale ও intelligent operations, 4–8 সপ্তাহ

PostGIS proximity search, improved Bengali search, dedicated search engine trigger, recommendations based on transparent signals, scheduled content, analytics dashboard এবং provider failover যোগ হবে। AI-based categorization বা summarization থাকলে human review বাধ্যতামূলক থাকবে।

## ১৪. Definition of Done

একটি feature “complete” হবে তখনই যখন তার UI, API contract, permission, database migration, loading/error/empty states, accessibility, analytics event, tests, documentation এবং rollback consideration সম্পন্ন হবে। শুধু screenshot সুন্দর হওয়া production readiness নয়।

| Area | Initial acceptance target |
|---|---|
| Availability | staging ও production health checks এবং rollback runbook |
| API | versioned OpenAPI, typed clients, consistent error envelope |
| Security | role tests, rate limits, upload validation, audit events |
| Data | migration, seed/import validation, verified timestamps |
| UX | 320–480px mobile plus desktop responsive pass |
| Accessibility | keyboard, focus, labels, reduced motion, contrast review |
| Performance | server-rendered shell, responsive image, no blocking failed asset |
| Trust | no fabricated review/testimonial; demo content visibly labelled |
| Operations | logs, request IDs, error tracking, backup restore drill |

## ১৫. KPI ও Product Metrics

Metrics privacy-conscious হবে এবং user trust নষ্ট করে এমন dark pattern থাকবে না। প্রথম release-এ লক্ষ্য হবে search success rate, service detail open rate, call/directions click-through, notice read completion, report resolution time, verification turnaround, stale listing rate এবং API error rate। Fake engagement দিয়ে product health দেখানো যাবে না।

North-star metric হতে পারে: **একটি প্রয়োজনীয় সেবা খুঁজে ব্যবহারকারীর সফল action সম্পন্ন করার হার**। তার supporting metrics হবে median time-to-service, zero-result search rate, verified listing coverage এবং emergency pathway completion।

## ১৬. প্রধান ঝুঁকি ও সিদ্ধান্ত

| ঝুঁকি | প্রভাব | প্রতিরোধ |
|---|---|---|
| ভুল বা stale service information | trust ও safety ক্ষতি | verified timestamp, owner claim, expiry reminder |
| শুরুতেই বেশি platform complexity | delivery delay | modular monolith, staged mobile/search |
| Bengali search দুর্বল | discovery failure | normalization, alias, trigram, query analytics |
| fake reviews/ratings | policy ও trust breach | user-generated data ছাড়া rating দেখানো নয় |
| admin abuse বা privilege creep | data manipulation | least privilege, MFA, audit, scoped roles |
| image/file abuse | cost ও security risk | signed upload, MIME scan, size limit, moderation |
| bad migration | downtime/data loss | expand-contract, staging restore, backup drill |
| provider outage | weather/notification failure | adapter, cache, stale-state UI, retry/backoff |

## ১৭. Final Recommendation

SPCare-এর জন্য DeepSeek-এর monorepo ধারণা রাখা উচিত, কিন্তু implementation order বদলাতে হবে। প্রথমে **contract-first FastAPI + PostgreSQL + Next.js public directory** বানাতে হবে; একই সঙ্গে design system ও trust policy স্থির করতে হবে। Flutter, Redis-heavy workflows, dedicated search এবং advanced community features product usage প্রমাণ হওয়ার পরে যোগ হবে। এতে বর্তমান সুন্দর demo দ্রুত production foundation-এ রূপ নেবে, কিন্তু architecture অকারণে ভারী হবে না।

প্রথম coding milestone-এর আগে তিনটি artifact approve করা আবশ্যক: একটি ERD, একটি OpenAPI contract এবং একটি role/permission matrix। এগুলো ছাড়া frontend ও backend parallel-এ শুরু করলে পরবর্তীতে duplicate logic, breaking API এবং inconsistent data state তৈরি হওয়ার ঝুঁকি বেশি।

### References

[1] [OWASP API Security Top 10 — 2023](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)

[2] [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)

[3] [OpenAPI Initiative](https://www.openapis.org/)
