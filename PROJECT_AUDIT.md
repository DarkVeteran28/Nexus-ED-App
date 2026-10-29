# Nexus-Ed repository audit

Audit date: 2026-10-29. Source was inspected against the README and the pasted classroom-demo brief. The current checkout builds and serves locally. No `.env.local` or Supabase credentials are present, so no database-backed workflow, live authentication, RLS behavior, or deployment could be validated.

## Feature inventory

The README/brief yields **15 requirements**. Current evidence: **2 PASS, 9 PARTIAL, 1 NOT IMPLEMENTED, and 3 BLOCKED**.

| Requirement | Status | Evidence and remaining work |
|---|---|---|
| Local application build and production server | PASS | `npm run build` completes and `npm run start` serves pages locally. Requires no DB for public pages. |
| Login and registration input visibility | PASS | Production HTML smoke check returned `/login` 200 with visible email/password inputs and `/register` 200 with email/roll fields. Actual browser style/mobile inspection remains unperformed. |
| Authentication for Student, Teacher, Parent, Admin | PARTIAL | Supabase email/password login checks trusted `app_metadata.role`; successful and rejected sign-in have not been tested with real accounts. |
| Protected routes and sign-out | PARTIAL | Next.js proxy checks user session and required role; dashboard has sign-out. Refresh, expiry, and cross-role behavior need a configured project and accounts. |
| School-code registration and activation | PARTIAL | API validates hashed, scoped, unused invitations; database RPC binds user/student/parent/teacher records. Migration and actual activation are unverified. |
| Teacher student enrollment | PARTIAL | Protected server route validates active teacher and class assignment, persists student, and generates hashed single-use activation codes. Requires migrated/configured Supabase. |
| Teacher assessment upload | PARTIAL | UI resolves school student ID to UUID and inserts a bounded score under RLS. Database path is unverified. |
| Student progress view | PARTIAL | Uses trusted student metadata and school-scoped assessment reads; no configured account/data to verify. |
| Parent-child report and PDF | PARTIAL | Student and assessment queries are constrained by parent-child RLS; report PDF is generated in the client. Relationship and PDF layout are not live-tested. |
| Class messaging | PARTIAL | Authenticated API validates role/class and persists messages. Realtime subscriptions and syllabus-grounded AI are absent. |
| Admin teacher management | PARTIAL | Protected API supports teacher invitations, assignment, listing, and revocation. Requires service key and migrated DB; no live admin was provisioned. |
| Database schema and RLS | BLOCKED | Migration now defines core tables, helper functions, trigger, and policies, but has not been applied or tested against a Supabase instance. |
| Demo Admin account | BLOCKED | Idempotent guarded script exists and creates a dedicated school/account. No credentials/project are configured, so no account was created or verified. |
| Deployed app and Vercel environment | BLOCKED | Supplied URL redirected to Vercel SSO. No authenticated browser session, deployment settings, or source revision was available. |
| Syllabus-grounded AI and realtime chat | NOT IMPLEMENTED | Current insights are deterministic rules; chat stores messages without realtime or syllabus retrieval. |

## Defects found and fixes in source

- The checkout had unresolved merge-conflict markers in package metadata and many app files. The working copies were resolved to the implementation side, and the Git index was updated so no unmerged paths remain. The files are syntactically clean and build successfully.
- Login source had invisible-field complaints in the original deployment, but no hiding CSS was found. The current login and registration components render accessible, styled email/password/name/roll/code fields. Production HTML confirms the fields exist; this does not prove the SSO-protected deployment serves this source revision.
- Login now uses Supabase email/password and trusted role metadata instead of a frontend-only mock.
- Account registration, teacher enrollment, and Admin teacher management now have server-side paths using a server-only service key. The service key is not imported into client modules.
- Data access uses school/student/class policies. Enrollment and invitation codes are stored only as SHA-256 hashes and one-time registration is consumed in a service-only transaction.
- Legacy `src/middleware.ts` was removed in favor of the Next.js 16 `src/proxy.ts` implementation.

## Security and deployment risks

1. **Migration not applied:** do not use actual student data until the migration is reviewed and RLS tested with separate synthetic accounts.
2. **No Supabase configuration:** `.env.local` now contains the project URL and blank key fields. API registration/admin/enrollment routes need `SUPABASE_SECRET_KEY`; browser auth also needs project URL and publishable key.
3. **No live account tests:** role checks, cookie refresh, logout, expiry, and cross-role denial are source-implemented but not verified against Auth.
4. **Vercel is SSO protected:** the live revision, environment variables, API connectivity, and UI could not be inspected. No deployment was attempted.
5. **Unfinished product scope:** realtime chat and actual syllabus-grounded AI are not implemented. Progress text is heuristic and should not be marketed as generative AI.
6. **Git metadata:** the repository index has unresolved entries and cannot be written in this environment. Before committing, resolve/stage the working files in a writable Git checkout and confirm `git status` is clean of unmerged paths.
7. **Supply-chain audit:** prior `npm install` reported 20 advisories; registry DNS blocked the production dependency audit. Re-run `npm audit` where registry access is available and assess updates before presenting publicly.

## Verification performed

- `npm run lint` — passed, no warnings.
- `npx tsc --noEmit` — passed.
- `npm test` — passed, **9 tests / 0 failures** (role routing and guarded demo-account helper behavior).
- `npm run build` — passed; Next.js generated the application routes and proxy.
- `npm run start -- --hostname 127.0.0.1 --port 3010` — server started.
- Local production HTTP smoke check: `/`, `/login`, `/register` each returned HTTP 200; login markup had email/password fields; registration markup had email/roll fields. The test used localhost with explicit sandbox approval.
- No automated browser test, mobile visual check, Supabase migration execution, API integration test, real account test, or live deployment verification was possible without the project/session.

## Completion checklist

### P0

- [x] Resolve conflict markers in the working copies and restore app buildability.
- [x] Add trusted-role authentication, route protection, and logout source paths.
- [x] Add registration, enrollment, Admin management, and RLS migration source.
- [ ] Apply/review migration in the intended Supabase project and verify RLS with synthetic accounts.
- [ ] Configure Vercel environment and verify production source revision and live role flows.

### P1

- [x] Replace sample-only Admin UI with invitation, assignment, listing, and revocation actions.
- [x] Provide a guarded, repeatable demo Admin provisioning/removal path.
- [ ] Provision and test the Admin account against the target project.
- [ ] Test enrollment → student/parent activation → assessment → student/parent report with synthetic data.

### P2/P3

- [ ] Add realtime class messages and syllabus-grounded responses if those README claims remain in scope.
- [ ] Run desktop/mobile browser verification and PDF visual review.
- [ ] Re-run dependency audit when registry access is available.
- [x] Clear the unmerged Git index entries; source changes remain uncommitted.

## Next exact action

Create a Supabase demo project, apply the migration, and add its project URL and publishable key to local `.env.local`. Keep the secret key private; it is needed locally for server APIs and demo provisioning. Then set unique demo Admin email/password values and run `npm run provision:demo-admin`. After that, run the synthetic end-to-end account workflows before considering the class demo ready.
