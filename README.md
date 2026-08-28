<div align="center">

# ◈ SpCare

### এক জেলা · এক প্ল্যাটফর্ম

**Sherpur-এর verified services, emergency access, local discovery এবং community information—একটি trustworthy digital layer-এ।**

[![Status](https://img.shields.io/badge/status-architecture%20foundation-0A6E4B?style=for-the-badge)](./PROGRESS.md)
[![Roadmap](https://img.shields.io/badge/roadmap-read%20the%20plan-E6A817?style=for-the-badge)](./ROADMAP.md)
[![License](https://img.shields.io/badge/license-to%20be%20decided-27323A?style=for-the-badge)](#license)

</div>

---

## The Idea

SpCare হলো শেরপুরের জন্য একটি service-first digital platform। একজন ব্যবহারকারী যেন হাসপাতাল, রক্তদান, জরুরি সেবা, সরকারি অফিস, পর্যটন স্থান, থাকার ব্যবস্থা, official notice এবং local community update এক জায়গা থেকে খুঁজে পান—এটাই এর মূল উদ্দেশ্য।

এটি শুধু একটি landing page নয়। এটি একটি **verified directory + emergency access layer + local discovery network + content operations system**। Public app যতটা গুরুত্বপূর্ণ, তার পেছনের admin control plane এবং data trust model ততটাই গুরুত্বপূর্ণ।

> **Brand promise:** সঠিক তথ্য খুঁজুন, প্রয়োজনীয় সেবা নিন, নিজের জেলার সঙ্গে যুক্ত থাকুন।

## 3D Design Foundation

SpCare-এর visual language একটি flat dashboard নয়; এটি একটি **soft-isometric civic interface**—যেখানে প্রতিটি surface আলাদা depth layer হিসেবে কাজ করে। White service surfaces হলো foreground panels, green হলো trust plane, gold হলো human warmth এবং red কেবল জরুরি priority নির্দেশ করে।

```text
                         ╭──────────────────────╮
                    ╭────┤   PUBLIC DISCOVERY   ├────╮
               ╭────┴────╰──────────────────────╯────┴────╮
          ╭────┤  SEARCH  ·  SERVICES  ·  NOTICES  ·  MAP  ├────╮
     ╭────┴────╰───────────────────────────────────────────╯────┴────╮
     │                 S P C A R E   C I V I C   C O R E              │
     │  ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────┐ │
     │  │ Directory  │   │ Emergency │   │ Community  │   │ Admin  │ │
     │  │ verified   │   │ priority  │   │ moderated  │   │ control│ │
     │  └────────────┘   └────────────┘   └────────────┘   └────────┘ │
     ╰─────────────────────────────────────────────────────────────────╯
                ╲       DATA · TRUST · ACCESS · CARE       ╱
                 ╲_______________________________________╱
```

### Visual tokens

| Token | Value | Role |
|---|---:|---|
| Forest Green | `#0A6E4B` | brand, trust, primary action |
| Warm Gold | `#E6A817` | status, warmth, local discovery |
| Emergency Red | `#D32F2F` | urgent notice, emergency action only |
| Ink | `#27323A` | readable content and headings |
| Mist | `#F5F7F6` | app canvas and separation |
| Surface | `#FFFFFF` | cards, panels and admin workspaces |

Depth comes from restrained shadow, soft 16–20px radius, deliberate whitespace, and motion that confirms an action instead of decorating the page. The interface must remain accessible, fast and calm even when the content is urgent.

## Product Surfaces

```text
┌─────────────────────────────────────────────────────────────┐
│ Public Web · Search-first service discovery                  │
├─────────────────────────────────────────────────────────────┤
│ /admin · Content operations, publishing, media and trust     │
├─────────────────────────────────────────────────────────────┤
│ Mobile · Fast resident access, saved items and notifications │
├─────────────────────────────────────────────────────────────┤
│ API · Shared source of truth and contract boundary           │
└─────────────────────────────────────────────────────────────┘
```

| Surface | Route / package | Core responsibility |
|---|---|---|
| Public web | `apps/web` | browse, search, service detail, notices, community |
| Admin panel | `apps/web/admin` | edit, image update, review, publish, moderate, audit |
| Mobile app | `apps/mobile` | quick access, saved items, notifications, posts |
| Backend | `apps/api` | auth, domain rules, data, search, media, permissions |

## Admin Control Plane

Admin is a first-class product surface with a separate route: **`/admin`**. It is not a hidden set of buttons inside the public homepage. It will have its own authentication middleware, responsive layout, navigation, permission guard, tables, forms, revision history and audit trail.

The first admin workspace will include Dashboard, Services, Categories, Locations, Notices, Featured Content, Media Library, Community Moderation, Verification Queue, Users & Roles, Audit Log and Settings. Editors save drafts; reviewers verify; publishers release public content. High-risk actions require explicit confirmation and a reason.

### Image update flow

```text
Upload → Validate → Scan → Crop/Focal Point → Add Alt Text
       → Create Revision → Review → Publish → Invalidate Cache
```

An image replacement must preserve the old published revision until the new one is safely attached. Public images may use CDN-backed URLs; private verification documents must use short-lived signed URLs. Failed or unscanned files never become visible production content.

## Architecture at a Glance

```text
 Public Web ───────┐
                   ├──▶ FastAPI /api/v1 ───▶ PostgreSQL + PostGIS
 Admin /admin ─────┤          │                  │
                   │          ├── Redis           ├── revisions
 Flutter Mobile ───┘          ├── Object Storage  ├── audit events
                              └── OpenAPI         └── search indexes
```

The first production shape is a modular monolith. Domain boundaries are explicit, but services are not split prematurely. Search starts with PostgreSQL full-text/trigram capability; a dedicated search engine is introduced only when usage and latency justify the operational cost.

## Repository Guide

```text
spcare/
├── apps/web/              # public Next.js web + isolated /admin route
├── apps/mobile/           # Flutter app, planned milestone
├── apps/api/              # FastAPI modular monolith
├── packages/              # API contract, types, design tokens, configs
├── docs/                  # ERD, ADRs, threat model, runbooks
├── infra/                 # local stack, CI/CD, monitoring
├── CLAUDE.md              # AI engineering contract
├── ROADMAP.md             # senior-level delivery plan
├── PROGRESS.md            # living handoff and progress ledger
└── README.md              # this overview
```

## Engineering Principles

**Trust before growth.** Every service should expose its verification state, source or owner, last verified time and a correction/report path.

**Contract before parallel coding.** Web, mobile, admin and backend share versioned OpenAPI contracts and domain enums. A database table is not an API contract.

**Admin actions are auditable.** Published content has revision history. Role changes, urgent notice publishing, verification decisions, media changes and moderation actions have actor, reason and timestamp.

**Demo is not production truth.** Demo data is visibly labelled. Fabricated reviews, ratings, testimonials, engagement counts or verification claims are never used as real content.

**Progress is part of the system.** Every AI or human contributor reads `CLAUDE.md`, `ROADMAP.md` and `PROGRESS.md` before starting, then updates `PROGRESS.md` after the task.

## Getting Started

The repository currently contains the architecture and operating documentation. Application scaffolding begins after M0 approval. The recommended first deliverables are the ERD, permission matrix, OpenAPI draft, content lifecycle policy, media policy and monorepo workspace skeleton.

```bash
# Clone
git clone https://github.com/irfan420x/SpCare.git
cd SpCare

# Read the operating contract first
cat CLAUDE.md
cat ROADMAP.md
cat PROGRESS.md
```

When application code is introduced, local development will use a reproducible compose stack for PostgreSQL, Redis and local object-storage emulation. Secrets will come from environment configuration and will never be committed.

## Delivery Milestones

| Milestone | Result |
|---|---|
| M0 | architecture decisions, contracts and operating rules |
| M1 | monorepo, CI, local stack and backend foundation |
| M2 | public directory, search, notices and service detail |
| M3 | separate `/admin`, auth, roles and dashboard |
| M4 | CMS for services, categories, notices, featured content and media |
| M5 | verification, moderation, audit and trust workflows |
| M6 | community, notifications and Flutter mobile foundation |
| M7 | search scale, observability, backup restore and production hardening |

Read the complete implementation order, acceptance criteria and risk register in [`ROADMAP.md`](./ROADMAP.md).

## Contribution Workflow

1. Read [`CLAUDE.md`](./CLAUDE.md), [`ROADMAP.md`](./ROADMAP.md) and [`PROGRESS.md`](./PROGRESS.md).
2. Select one concrete task that belongs to the active milestone.
3. Record assumptions and affected contracts before coding.
4. Implement the smallest coherent change.
5. Run the relevant format, lint, typecheck, test and build commands.
6. Validate loading, error, empty, permission and mobile states.
7. Update [`PROGRESS.md`](./PROGRESS.md) with completed work, evidence, limitations and the next task.
8. Open a focused pull request with migration, security, test and rollback notes.

## Documentation Map

| File | Purpose |
|---|---|
| [`CLAUDE.md`](./CLAUDE.md) | any AI agent-এর engineering contract |
| [`ROADMAP.md`](./ROADMAP.md) | full-stack architecture ও step-by-step plan |
| [`PROGRESS.md`](./PROGRESS.md) | living project state ও handoff |

## Author

<div align="center">

**IRFAN**  
_Product owner · SpCare_

</div>

## License

License selection is pending product-owner confirmation. Do not copy, redistribute or publish production implementation under a license that has not been approved by IRFAN.
