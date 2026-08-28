# SPCare Enterprise Grade Redesign Checklist

- [x] Replace the previous editorial palette with the specified green/gold/red/neutral design tokens.
- [x] Update typography to Hind Siliguri for Bengali and Inter for English/UI text.
- [x] Rework header, hero, category, service and footer composition toward a cleaner enterprise-grade layout.
- [x] Add stronger rounded-xl cards, shadow hierarchy, consistent 4px spacing rhythm, and accessible contrast.
- [x] Preserve and improve functional interactions: search, notice controls, category filtering, profile/notification menu, mobile navigation, and feedback toasts.
- [x] Add/retain local Sherpur imagery and branded visual cues without generic placeholder treatment.
- [x] Run typecheck/build and verify desktop and mobile screenshots.
- [x] Save a new checkpoint and deliver the revised preview version.


## Reference-Driven Mobile UI Upgrade

- [x] Recompose the homepage around the provided mobile reference: compact top bar, location selector, notification badge, profile avatar, and large search field.
- [x] Add a featured tourism/service carousel with polished local demo data and manual slide controls.
- [x] Add the eight reference-style service categories with icon, label, subtitle, and accessible selection states.
- [x] Add quick actions: জরুরি কল, নিকটস্থ সেবা, সহায়তা চাই, ঘোষণা, and শেয়ার করুন.
- [x] Add a demo social post card with official badge, timestamp, engagement controls, and event content.
- [x] Add weather, AQI, and date information cards with realistic demo values and clear status labels.
- [x] Add mobile bottom navigation and central floating “পোস্ট করুন” action with active states.
- [x] Add desktop/tablet responsive treatment while preserving the mobile reference’s visual priority.
- [x] Validate interactions, typecheck/build, and capture mobile plus desktop screenshots.
- [x] Save a new checkpoint and deliver the revised demo version.


## DeepSeek Review Refinement Pass

- [x] Increase visual hierarchy by making জরুরি সেবা and হাসপাতাল the primary pathways.
- [x] Consolidate accent colors around green and gold, using red only for urgent states.
- [x] Rename and redesign the quick-action area as “দ্রুত কর্ম” with larger action targets.
- [x] Increase section spacing and add clearer visual separation for mobile scanning.
- [x] Improve category/service card shadows, radius, hover, active, and press states.
- [x] Keep modern SVG iconography and strengthen practical demo content.
- [x] Validate 320–480px mobile and desktop layouts, typecheck/build, and save a new checkpoint.


## SPCare Full-Stack Master Plan

- [x] Define product boundaries, user roles, trust model, and phased release strategy.
- [x] Design the monorepo, frontend applications, backend modules, and shared contracts.
- [x] Define the domain model for locations, services, organizations, notices, posts, reports, and verification.
- [x] Define API versioning, pagination, filtering, search, error envelopes, and idempotency rules.
- [x] Define authentication, authorization, moderation, audit, privacy, and abuse-prevention controls.
- [x] Define database, cache, object storage, search, notifications, and background-job architecture.
- [x] Define frontend information architecture, state boundaries, accessibility, performance, and offline strategy.
- [x] Define CI/CD, environments, observability, backup/restore, migration, and rollback practices.
- [x] Define test strategy, acceptance criteria, KPIs, risks, and recommended implementation order.
- [x] Deliver the master plan as a Bengali Markdown document without starting implementation yet.


## Admin Panel + Public GitHub Roadmap

- [x] Define the separate `/admin` route, admin information architecture, roles, scopes, and approval workflow.
- [x] Define editable content domains: services, categories, locations, notices, featured slides, posts, media, weather settings, and site configuration.
- [x] Define media upload, image replacement, crop/alt text, versioning, moderation, and storage workflow.
- [x] Define backend APIs, database entities, audit logs, draft/publish/review states, and cache invalidation rules for admin changes.
- [x] Define admin security: MFA, RBAC/ABAC, session policy, rate limits, CSRF, upload validation, and auditability.
- [x] Write a senior-level step-by-step delivery roadmap with milestones, dependencies, acceptance criteria, and risks.
- [x] Create the public GitHub repository `SpCare` and commit `ROADMAP.md`.
- [x] Verify repository visibility, file contents, commit, and public URL before delivery.


## AI Guidance + Repository Documentation

- [x] Create `CLAUDE.md` with project context, architecture rules, coding standards, safety rules, and AI execution protocol.
- [x] Create `PROGRESS.md` with completed work, current status, next task, blockers, decisions, and update template.
- [x] Create an authored `README.md` for IRFAN with 3D-style visual branding, quick start, architecture, roadmap links, and contribution workflow.
- [x] Validate Markdown structure, internal links, author attribution, and progress protocol.
- [x] Commit and push the documentation update to the public SpCare GitHub repository.


## Full-Stack Foundation Implementation

- [x] Resolve full-stack upgrade conflicts and restore a clean typecheck/dev server.
- [x] Add SPCare directory schema for categories, locations, services, notices, featured items, and media metadata.
- [x] Generate and apply the database migration, then verify tables and indexes.
- [x] Add safe demo seed data with clear demo labeling and no fabricated user reviews/testimonials.
- [x] Add centralized public tRPC procedures for homepage, categories, services, notices, and featured content.
- [x] Create a separate `/admin` route using the provided DashboardLayout with admin-only guard and content overview.
- [x] Wire the public homepage to the centralized API layer with loading, error, empty, and fallback states.
- [x] Add public data adapters for weather/other external providers without hard dependency on unavailable credentials.
- [x] Write Vitest coverage for schema-facing queries, public procedures, and admin authorization.
- [x] Verify responsive UI, run typecheck/build/test, update PROGRESS.md, and save a checkpoint.


## Foundation Gap Remediation

- [x] Add a real frontend admin-only route guard in addition to backend `adminProcedure` protection.
- [x] Finish wiring featured content, notices, directory services, and remaining homepage data to the centralized `spcare` API with complete loading/error/empty/fallback states.
- [x] Add direct Vitest coverage for `server/db.ts` query helpers and schema-backed data access.
- [x] Save a new webdev checkpoint after gap remediation, then mark the related checklist items complete.


## Final Foundation Corrections

- [x] Wire featured carousel, notices, and service-directory surfaces in `Home.tsx` to `spcare` API data with section-level loading, error, empty, and fallback states.
- [x] Save a new webdev checkpoint after all remediation changes; only then close the checkpoint task.


## Homepage State Completeness

- [x] Add explicit loading, error, empty, and fallback UI states for the featured carousel section.
- [x] Add explicit loading, error, empty, and fallback UI states for the notices/post section.
- [x] Re-run typecheck/build/test and capture screenshots after completing the missing state handling.


## Admin S3 Media Library

- [x] Add media metadata schema with owner, storage key, URL, filename, MIME type, size, alt text, status, and timestamps.
- [x] Generate and apply a non-destructive media migration, then verify indexes and foreign keys.
- [x] Add admin-only media list, upload, update metadata, and archive/delete-reference procedures.
- [x] Enforce upload validation for image MIME types, file size, filename normalization, and safe storage keys.
- [x] Build an admin media library UI with drag/drop or file picker, preview, metadata editing, filters, and empty/loading/error states.
- [x] Add reusable media selection/update flow for service and featured content image URLs.
- [x] Add Vitest coverage for media authorization, validation, metadata updates, and storage failure handling.
- [x] Update PROGRESS.md, run typecheck/build/test, capture `/admin` screenshots, and save a checkpoint.


## Media Library Completion Corrections

- [x] Add an explicit filename column to `mediaAssets`, generate/review/apply its migration, and verify schema indexes.
- [x] Implement reusable media picker selection for service and featured image fields in `/admin`.
- [x] Add tests for metadata update success/validation and storage upload failure propagation.
- [x] Re-run migration, typecheck/build/test, update progress, capture screenshots, and save the final media checkpoint.


## GitHub Synchronization

- [x] Verify the current project remote and sensitive-file exclusions before publishing source.
- [x] Commit the current SPCare full-stack implementation and push it to public `SpCare`.
- [x] Verify the public branch, latest commit, and repository contents after push.
