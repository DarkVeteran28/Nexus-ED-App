# Nexus-Ed classroom demo guide

Audit date: 2026-10-29. The app currently builds and serves locally, but database-backed flows and the hosted deployment have not been verified. The readiness verdict is **READY WITH LIMITATIONS for a local UI walkthrough; NOT READY for a live authenticated classroom demo** until Supabase is configured and tested.

## URLs and account state

- Live app: <https://nexus-ed-h38dngt2w-likhith-thejas-projects.vercel.app/>
- Login: <https://nexus-ed-h38dngt2w-likhith-thejas-projects.vercel.app/login>
- Registration: <https://nexus-ed-h38dngt2w-likhith-thejas-projects.vercel.app/register>
- Demo Admin email: **not provisioned**.
- Demo Admin password: **not created**.
- Login role: **Admin** after provisioning.
- Expected landing page: `/dashboard/admin/teachers`.
- Live deployment status: **unverified**; the provided URL redirected to Vercel SSO.

## Prepare a Supabase demo project

1. Create a Supabase project intended for synthetic demo data. Review the schema before using an existing project.
2. Apply `supabase/migrations/202610290001_nexus_ed_core.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and set the Supabase URL, publishable key, and secret key. Keep the secret key private and server-side.
4. Set a unique unused `DEMO_ADMIN_EMAIL`, a unique password of at least 12 characters, and optionally a demo school name/code.
5. Run:

   ```bash
   npm install
   npm run provision:demo-admin
   ```

The script creates or reuses a school, refuses to take over an account that is not already marked as the dedicated demo Admin, and does not print the password. It has not been run against a real Supabase project yet. Sign in at `/login`, select Admin, and verify `/dashboard/admin/teachers` before the presentation. Remove the account afterward with `npm run remove:demo-admin -- <demo-email>`.

## Five-minute walkthrough (after backend verification)

1. **0:00–0:30 — Home and roles:** show the portal entry points. Explain that login uses school accounts and permissions.
2. **0:30–1:30 — Admin:** sign in with the provisioned Admin; invite a synthetic teacher with a class/subject; copy the one-time code; show teacher listing and assignment controls.
3. **1:30–2:30 — Teacher:** register the invited teacher; enroll “Jordan Demo”, roll `27`, class `10A`, guardian `parent.demo@example.edu`; show the generated student ID and privately delivered student/parent activation codes.
4. **2:30–3:30 — Student:** register with the student code; show the student progress page; as the teacher, enter synthetic Mathematics score `82` for the generated student ID; refresh progress and show the result.
5. **3:30–4:30 — Parent:** register the exact recorded guardian email using the parent code; enter the student's generated ID and roll `27`; show the linked progress and download the PDF report.
6. **4:30–5:00 — Limits:** explain that the chat currently stores class messages but has no realtime subscription, and progress commentary is deterministic rather than generative AI.

Use only synthetic data and verify each step in the demo project before class. Do not display registration codes after sharing them with their intended account owner.

## Local fallback

With Supabase configured, run:

```bash
npm run build
npm run start
```

Then open <http://localhost:3000>. If you only need to show the public UI without backend configuration, `npm run dev` starts the site, but login-protected flows cannot work until the Supabase values, migration, and accounts are ready. Do not present an authentication or persistence flow as successful unless you verified it end to end.

## Common recovery steps

- **Configuration error on login:** check the public URL and publishable key in `.env.local` and restart the server.
- **Registration/API unavailable:** verify the secret key is local/server-side and the migration was applied.
- **Role mismatch or dashboard denial:** verify `app_metadata.role`, school membership, and active status in the same Supabase project.
- **Teacher cannot enroll:** have the Admin assign the teacher to the class; confirm the teacher uses the same class label.
- **Parent cannot find the student:** confirm the guardian email in the school record matches the parent's login and the account was registered with the linked parent code.
- **Empty progress:** verify a synthetic assessment exists for the student's database ID and that student/parent relationship is authorized by RLS.
- **Hosted app shows SSO:** authenticate to the Vercel team or use the local fallback; the public deployment cannot currently be verified from this workspace.

## Final pre-presentation checklist

- [ ] Migration reviewed and applied to the intended demo project.
- [ ] Local and Vercel public settings point to the same intended Supabase project; service key exists only server-side.
- [ ] Dedicated Admin provisioned; Admin login and teacher-management dashboard verified.
- [ ] Teacher invitation, student enrollment, student activation, parent activation, assessments, progress, and PDF tested with synthetic records.
- [ ] Cross-role route/API denial and logout verified.
- [ ] Desktop and phone login/registration layouts checked in a browser.
- [ ] Current live deployment revision verified; no SSO/config/API errors during walkthrough.
- [ ] Demo account removal command and recovery path are available.

**Readiness verdict: NOT READY for a live authenticated demo.** Source build and local page rendering pass. A Supabase project, migration execution, service configuration, demo account, end-to-end data test, and Vercel access remain outstanding.
