# Nexus Ed

Nexus Ed is a role-based school platform built with Next.js, React, and Supabase. It includes student, teacher, parent, and admin workflows for enrollment, classroom messages, academic progress, and downloadable report cards.

## What works in this checkout

- Role-aware Supabase email/password login with visible, validated fields.
- Cookie-backed dashboard access checks and sign-out.
- A server-side registration endpoint that verifies one-time school codes before activating student, parent, or teacher accounts.
- Teacher enrollment that creates a student record and one-time activation codes.
- Assessment entry by student ID, school-scoped progress reads, parent-child linked report views, and PDF export.
- Admin teacher invitations, class assignment, and revocation through protected server routes.
- A Supabase schema and Row Level Security migration for the supported workflows.
- A guarded demo-admin provisioning/removal script.

These workflows require a configured Supabase project and the migration below. They have not been exercised against an external project in this workspace.

## Stack and routes

- Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Supabase Auth, Postgres, and Row Level Security
- Recharts, jsPDF, and `jspdf-autotable`

Main routes: `/`, `/login`, `/register`, `/dashboard/student/chat`, `/dashboard/student/progress`, `/dashboard/teacher/enrollment`, `/dashboard/teacher/progress`, `/dashboard/parent`, and `/dashboard/admin/teachers`.

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project and apply [`supabase/migrations/202610290001_nexus_ed_core.sql`](supabase/migrations/202610290001_nexus_ed_core.sql) in the Supabase SQL editor. Use a new demo project or review the existing schema first; the migration is designed for this application schema and is not a production upgrade plan.

3. Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the Supabase project. Set the secret key locally only if using the server-side registration, enrollment, admin management, or demo provisioning features. Keep it private and never use a `NEXT_PUBLIC_` prefix.

4. Create a school (the demo-admin script creates its configured demo school if it does not exist), then start Next.js:

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000>.

The same `.env.local` file is loaded by the demo admin scripts. It is ignored by Git. No test/demo login credentials are committed.

## Demo Admin

Set `DEMO_ADMIN_EMAIL` and `DEMO_ADMIN_PASSWORD` to a dedicated unused account, and optionally set `DEMO_ADMIN_SCHOOL_NAME` and `DEMO_ADMIN_SCHOOL_CODE`. After applying the migration and setting `SUPABASE_SECRET_KEY`, run:

```bash
npm run provision:demo-admin
```

The script creates or reuses the configured school and creates an Admin account with trusted `app_metadata`. It refuses to change an existing account that is not already marked as the dedicated demo Admin. No password is printed. Sign in at `/login`, select **Admin**, and open `/dashboard/admin/teachers`.

After the presentation, remove the account with:

```bash
npm run remove:demo-admin -- demo-admin@example.edu
```

Use the same private URL and secret key. The removal script refuses accounts without both demo markers.

## Account workflows

- A teacher must be assigned a class by an Admin. On `/dashboard/teacher/enrollment`, enroll a student and optionally supply a guardian email. Share the generated student and parent activation codes privately with the matching users.
- Teachers register at `/register` using the invited email and one-time code. Students and parents use their school-issued activation code, exact enrolled name/roll as applicable, and the recorded guardian email.
- Registration codes are stored as hashes and consumed transactionally by a service-only database function.
- Access is scoped by the authenticated school membership and class/student relationships in RLS. Use synthetic data until those rules are independently validated in the target project.

## Checks

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
npm run start
```

## Known limits

- This workspace had no configured Supabase project at the time of verification; real account activation, persistence, and RLS behavior remain unverified.
- The chat supports saving and reading class messages, but not realtime subscriptions or syllabus-grounded AI responses.
- Progress recommendations are deterministic rules, not generated AI.
- A live deployment requires the same public Supabase settings and server-only `SUPABASE_SECRET_KEY` in its hosting environment. This workspace cannot verify or deploy the SSO-protected Vercel project.
