# Nexus-Ed classroom demo guide

Audit date: 2026-10-29. This is a reproducible runbook, but the hosted app and its Supabase project could not be verified from this checkout. Treat the demo as **not ready for a live class** until the P0 checks below pass.

## URLs and account

- Live app: <https://nexus-ed-h38dngt2w-likhith-thejas-projects.vercel.app/>
- Login: <https://nexus-ed-h38dngt2w-likhith-thejas-projects.vercel.app/login>
- Registration: <https://nexus-ed-h38dngt2w-likhith-thejas-projects.vercel.app/register>
- Demo Admin identifier: **not provisioned**. No database credentials or configured Supabase project were available to inspect or create an account.
- Demo password: **none created**. Do not use a real person's account or a password committed in source control.
- Login role: choose **Admin** after provisioning.
- Expected landing page after successful Admin sign-in: `/dashboard/admin/teachers`.

## Provision a dedicated Admin account

Use a Supabase project dedicated to the demo or otherwise approved for this purpose. Choose a new, dedicated email address and a unique password of at least 12 characters. Keep these values private.

In a trusted local terminal, set the project URL, Supabase service-role key, demo email, and password as environment variables; do not put the service-role key in a `NEXT_PUBLIC_*` variable. Then run:

```bash
npm install
npm run provision:demo-admin
```

The script uses Supabase Auth's admin API, sets trusted `app_metadata.role=admin` and `app_metadata.demo_account=true`, and never prints the password. It refuses to change an existing account with the same email. A rerun is safe for the already marked demo account and does not reset its password. This path has only had a syntax check here; it has **not** been run against the live database.

For live sign-in, verify Vercel uses the same Supabase project and has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured. Sign in at `/login`, select Admin, and confirm `/dashboard/admin/teachers` opens. The current teacher management screen is sample-only and must be introduced as a prototype page, not as functional persisted management.

Remove the dedicated account after the presentation by setting the same trusted URL/service-role key and running:

```bash
npm run remove:demo-admin -- demo-admin@example.edu
```

Replace the example email with the dedicated demo email. The removal script only deletes an account carrying both demo markers and refuses other accounts.

## Five-minute walkthrough

This flow is a presentation outline, not a claim that the external data paths have been verified. Use only synthetic records in a non-production school project.

1. **0:00–0:30 — Landing and roles.** Open the landing page and explain the intended student, teacher, parent, and admin areas. Clarify that some portal cards describe planned behavior.
2. **0:30–1:30 — Admin sign-in.** Sign in with the separately provisioned demo Admin and show the protected Admin route. Explain that teacher records are sample data and current management controls are disabled.
3. **1:30–2:30 — Teacher enrollment (only if Supabase schema/RLS has been validated).** Sign in with a dedicated synthetic teacher account and enroll a synthetic student such as “Jordan Demo”, roll `27`, class `10A`. The generated ID follows `NEXUS-<year>-27-JD`. Do not perform this step until database writes are tested.
4. **2:30–3:30 — Marks and student progress (only with verified row policies).** Add synthetic Mathematics scores such as `72`, `81`, and `88`, then sign in as the matching student and show the rule-based progress trend. `app_metadata.student_id` must match the `assessments.student_id` record key.
5. **3:30–4:30 — Parent report (only with a real parent-child authorization policy).** Use a dedicated synthetic parent account linked to Jordan Demo, show the progress page, and generate the PDF. Never demonstrate by entering a real learner's identifier.
6. **4:30–5:00 — Registration and limitations.** Show the registration fields if useful, but explain registration activation is not connected. Point out that chat history/realtime, Admin teacher persistence, and syllabus-grounded AI remain incomplete.

## Supported roles and current limits

- **Student:** auth role and dashboard routing are implemented in source; real account/session/data workflow unverified. Progress requires trusted `app_metadata.student_id`.
- **Teacher:** route role and forms exist; database schema, class assignment, and write policies are unverified. Class/school IDs are hardcoded.
- **Parent:** route role and lookup/report UI exist; child relationship authorization is unverified. Avoid real student data.
- **Admin:** protected route and provisioning procedure exist; no credential/account has been created here. Teacher management is sample-only.
- **Registration:** school code validation and activation are not implemented. Do not claim a new account can be activated.
- **Chat/AI:** chat UI/API are basic and not syllabus-grounded or realtime. Progress insight is deterministic rule logic, not generative AI.

## Common errors and recovery

- **“Supabase is not configured” / configuration redirect:** set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in local `.env.local` or the correct Vercel environment, then rebuild/redeploy through the authorized project workflow.
- **Role mismatch at login:** confirm the account has the intended trusted `app_metadata.role` in the same Supabase project. Do not set role in user-editable metadata.
- **Admin route redirects to login:** verify a valid session, `app_metadata.role=admin`, and that the deployed frontend points to the Supabase project where the account was provisioned.
- **Empty student progress:** verify a synthetic student record and trusted `app_metadata.student_id` mapping; then verify RLS permits only that student's assessment rows.
- **Enrollment/assessment/chat errors:** stop rather than retrying with real data. Check table names/columns and RLS in the demo database first.
- **Registration displays not configured:** this is expected until a server-side school-code verifier and activation workflow are implemented.

## Local fallback

1. Use a non-production Supabase project with reviewed schema and RLS policies, then copy `.env.example` to `.env.local` and fill only the public URL/anon-key settings needed by the app.
2. Run `npm install`, `npm run build`, then `npm run start` and open `http://localhost:3000`.
3. Provision a dedicated synthetic Admin using the instructions above against that same project.
4. If the local build or external database is unavailable, present the source walkthrough and this audit; do not imply live authentication or persistence succeeded.

## Final pre-presentation checklist

- [ ] Confirm the public deployment points to the intended repository revision and Supabase project.
- [ ] Complete a production build, lint, type-check, and browser test run on the final revision.
- [ ] Verify login, invalid credentials, role mismatch, refresh, logout, expired session, and direct cross-role route attempts.
- [ ] Verify strict Supabase RLS with synthetic Student, Teacher, Parent, and Admin accounts.
- [ ] Provision and sign in as the dedicated Admin; confirm the expected dashboard.
- [ ] Verify synthetic enrollment, marks, student progress, and PDF workflows before showing them.
- [ ] Check desktop and phone layouts for login and registration and confirm no browser console or API errors.
- [ ] Keep service-role keys/passwords out of browser code, screenshots, and source control.
- [ ] Remove the dedicated demo account after the presentation.

**Readiness verdict: NOT READY.** The live deployment, configured database, demo Admin, account workflows, and RLS behavior remain unverified. The source changes improve login handling and make missing configuration explicit, but they cannot substitute for the external Supabase and Vercel checks above.
