# Nexus-Ed project audit

Audit date: 2026-10-29  
Repository: [`DarkVeteran28/Nexus-ED-App`](https://github.com/DarkVeteran28/Nexus-ED-App) matches this workspace's README, package manifest, and original login source. The workspace itself has no Git remote or commit history: branch `master` has no commits, and the supplied project files were untracked at audit start and have been preserved.

## Executive result

README scope items identified: **16**. Verified complete: **0**. Partial: **12**. Not implemented: **2**. Blocked on external configuration or missing schema: **2**. The production source build passes, but authentication and data workflows against Supabase have not been verified. These counts distinguish code paths that exist from workflows that have not been exercised against a configured database.

## README-to-code feature audit

| README requirement | Status | Evidence and limits |
|---|---|---|
| Landing page and portal navigation | PARTIAL | `src/app/page.tsx` provides the branded page and links. It also advertises AI, uptime, privacy, and role workflows that are not backed by corresponding services or verified measurements. |
| Student authentication and dashboard | PARTIAL | Login now calls Supabase password auth, checks trusted `app_metadata.role`, and routes students. No configured project or test account was available to exercise a successful sign-in. Student record linkage is not provisioned in this repo. |
| Teacher authentication and dashboard | PARTIAL | Teacher role is now available at login and teacher routes are guarded. Enrollment and marks UI write to expected Supabase tables, but schema, RLS, and successful writes are unavailable for verification. |
| Parent authentication and dashboard | PARTIAL | Parent role is now guarded. The portal performs lookup using student ID and roll number; a verified parent-child relationship and tested RLS policy are absent. |
| Admin authentication and dashboard routing | PARTIAL | Admin role route is guarded, and an explicit demo-account provisioning script is included. No admin account was created or tested. |
| Admin teacher management | NOT IMPLEMENTED | The current page contains sample data; Add/Edit/Remove controls are disabled and no persistence endpoint exists. |
| Role-specific post-login routing | PARTIAL | Login selects a dashboard from trusted role metadata; `src/proxy.ts` checks the role again on dashboard paths. Server/data authorization still depends on absent RLS policies. |
| Registration-code validation/account activation | NOT IMPLEMENTED | Code and roll-number fields now render, validate as required, and show an explicit “not configured” message. No registration-code store or trusted verifier exists; the code is not accepted as proof of identity. |
| Student classroom chat | PARTIAL | A basic class chat UI and authenticated API insert are implemented for class `10A`. Read/write access depends on the database RLS policy; the schema, history access, and live workflow were not tested. No realtime subscription is implemented. |
| Student progress graphs and insights | PARTIAL | Progress now queries scores filtered by `app_metadata.student_id` and shows loading/error/empty states. The claim-to-record mapping, data policy, and displayed results cannot be verified without the database. Insights are rule-based, not AI-generated. |
| Teacher student enrollment and generated IDs | PARTIAL | Existing UI writes a generated ID and student data. School code/class are hardcoded (`NEXUS`, `10A`), database behavior is unverified, and there is no collision/authorization test. |
| Teacher assessment upload | PARTIAL | Inputs, score validation, subject selection, persistence feedback, and loading state are present. Whether the schema and RLS allow the intended teacher-to-student relationship is unknown. |
| Parent progress and report-card PDF | PARTIAL | Parent portal queries student/assessment data and generates a jsPDF report. Authorization between parent and child is not established in this repository; layout and PDF output were not rendered or tested. |
| Supabase-backed data and authentication | PARTIAL | Cookie-aware Supabase browser auth and the Next.js proxy are in source. No `.env.local` exists; deployment env, database, tables, and connectivity were not inspected. |
| Secure data authorization (RLS) | BLOCKED | No SQL schema, migrations, or RLS policies exist in this checkout. The browser uses an anon key; policies must enforce access to student, assessment, and message rows. Frontend route checks alone do not secure database data. |
| Production deployment and live behavior | BLOCKED | The provided live URL responds with HTTP 302 to Vercel SSO, so its application page could not be inspected without an authenticated browser session. The checkout has no Git remote or commit history, so Vercel’s source branch and deployed revision cannot be identified here. No deployment was performed. |

## Authentication and input findings

- The original login and registration components already included input elements in the checked-out source. No CSS selector in `src/app/globals.css` hid those inputs. The reported invisible-input state therefore is **not reproduced by this source**; the deployed build could not be inspected to determine whether it is stale or built from different code.
- Login originally had no submit handler, rendered role-specific identity fields that Supabase password auth did not consume, and omitted the README-supported teacher role. It now uses visible, explicitly styled email/password inputs, required validation, accessible labels/focus states, Supabase password auth, trusted role metadata, and role-based redirect/error handling.
- Registration originally had no submit handler. It now has explicit code and roll-number fields with readable styles and required validation. The form clearly reports that server-side activation is unavailable rather than indicating successful verification.
- The original client Supabase module embedded a fallback project URL and anon key. These fallbacks were removed. Configuration is required through environment variables, and the service-role key is only used by explicit Node scripts.
- Next.js `src/proxy.ts` now checks session and trusted role metadata for role-specific dashboard paths. `src/app/dashboard/layout.tsx` includes sign-out. These checks do not replace database RLS policies.
- Chat API now requires a valid session, limits payload shape/size, checks student/teacher role, and returns appropriate HTTP errors. The database insert remains subject to RLS.

## Security and deployment risks

1. **High: no schema/RLS available.** Student and assessment queries could expose or modify other users' records if the Supabase project lacks strict policies. The parent identity lookup is not a substitute for a parent-child relationship.
2. **High: no deployment credentials/config evidence.** Supabase project URL/key, database access, Vercel environment, and deployment tracking branch were not available to this checkout.
3. **Role claims require trusted provisioning.** Login and middleware rely on Supabase `app_metadata.role`; student progress additionally requires `app_metadata.student_id`. User-editable metadata must not be used to grant roles.
4. **Feature claims exceed implementation.** “AI” insights are deterministic heuristics; the chat is not syllabus-grounded; admin teacher management is sample-only; and advertised realtime/uptime claims are not verified.
5. **Supply-chain audit incomplete.** `npm install` reported 20 advisories (1 low, 4 moderate, 13 high, 2 critical). `npm audit --omit=dev` could not reach `registry.npmjs.org`, so package-specific exposure and remediation were not verified.
6. **Deployment root ambiguity corrected locally.** Next.js initially inferred `/Users/likhiththejas` due another lockfile; `next.config.ts` now pins Turbopack root to this repository. No Vercel deployment config was present.
7. **Live URL is access-controlled.** A request to the provided `/login` URL returned HTTP 302 to Vercel SSO. The page and deployed source revision could not be inspected without an authenticated browser session.
8. **GitHub source identified.** `DarkVeteran28/Nexus-ED-App` on `main` has the same README, `package.json`, and original login component as this workspace. The workspace is not a clone with a configured origin, so no direct branch or revision relationship can be verified.

## Tests and checks

- `npm install`: passed; 431 packages installed. npm reported 20 advisories and warned that install scripts for `core-js`, `sharp`, and `unrs-resolver` were not approved by its install-script policy.
- `node --check scripts/provision-demo-admin.mjs && node --check scripts/remove-demo-admin.mjs`: passed.
- `npm run lint`: passed after the final proxy migration with zero errors and warnings. The legacy reveal animations were changed to render content immediately to resolve React ref-hook lint errors.
- `npm test`: passed, **6 tests / 0 failures**, covering demo-account email matching and create/remove marker guards plus role routing/access-path helpers.
- `npm run build`: passed after the `middleware.ts` to `proxy.ts` rename and role-helper integration. The package build script is pinned to Webpack for reproducibility. It compiled, ran TypeScript, generated all 12 static pages, and emitted all documented routes.
- `npx tsc --noEmit`: passed after the final build.
- `node --check scripts/provision-demo-admin.mjs && node --check scripts/remove-demo-admin.mjs`: passed.
- Static production HTML inspection confirmed login includes email/password inputs and registration includes registration-code and roll-number inputs with IDs and labels. This verifies source-rendered markup, not computed browser styles or mobile layout.
- Live deployment request: HTTP 302 to Vercel SSO; no browser session was available to inspect after redirect. API connectivity and real authentication were not run.
- `npm audit --omit=dev`: could not reach `registry.npmjs.org`; package-specific exposure and remediation were not verified.
- No end-to-end browser runner or real Supabase account/database was configured.

## Prioritized completion checklist

### P0 — security and runtime

- [ ] Configure Supabase project credentials in a trusted environment and verify `app_metadata.role` provisioning.
- [ ] Add/inspect schema and strict RLS policies for students, assessments, and messages, including student, teacher, and parent-child authorization.
- [x] Rerun production build, type check, and lint after the final Next.js proxy migration.
- [ ] Verify direct route access, role mismatch, logout, session refresh/expiry, and API denial against real test accounts.
- [ ] Inspect the live deployment and identify its actual source revision/environment.

### P1 — classroom demo features

- [ ] Connect and test registration-code verification and account activation while preserving school-issued codes.
- [ ] Provision a dedicated demo Admin in the correct Supabase project, then verify live sign-in and admin dashboard.
- [ ] Replace sample admin teacher data with authorized persisted management.
- [ ] Verify enrollment, assessment upload, student progress, and report PDF using synthetic database records.
- [ ] Confirm each dashboard only displays the authenticated user's authorized data.

### P2 — usability and workflow

- [ ] Add the missing realtime chat behavior and verify message history.
- [ ] Replace hardcoded class and school identifiers with authorized school/class selection.
- [ ] Run desktop/mobile browser checks for login, registration, dashboards, errors, and empty states.
- [ ] Add automated unit, API authorization, seed-script, and browser tests using the project’s selected test framework.

### P3 — claims and polish

- [ ] Remove or substantiate unsupported AI, realtime, uptime, and privacy marketing claims.
- [ ] Re-run dependency audit with registry access and update affected packages safely.
- [ ] Render and verify PDF layout and accessibility.
