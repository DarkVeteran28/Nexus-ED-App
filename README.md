# Nexus Ed

Nexus Ed is a role-based school platform built with Next.js, React, and Supabase. It includes student, teacher, parent, and admin flows centered around enrollment, classroom chat, academic progress tracking, and downloadable report cards.

## Highlights

- Student login and dashboard flows
- Teacher enrollment with generated student IDs
- Teacher marks upload for assessment tracking
- Student progress charts with lightweight AI-style insights
- Parent portal with child lookup and PDF report card export
- Admin teacher management UI
- Supabase-backed authentication and database access

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Recharts
- jsPDF + `jspdf-autotable`
- Lucide React

## Project Structure

```text
src/
  app/
    api/chat/route.ts                  # Chat message API
    dashboard/
      admin/teachers/page.tsx          # Admin teacher management (prototype UI)
      parent/page.tsx                  # Parent portal and report export
      student/chat/page.tsx            # Student classroom chat
      student/progress/page.tsx        # Student analytics page
      teacher/enrollment/page.tsx      # Student enrollment + UID generation
      teacher/progress/page.tsx        # Marks upload flow
    (auth)/login/page.tsx              # Supabase email/password login
    (auth)/register/page.tsx           # Registration-code screen (verification pending)
    page.tsx                           # Landing page
  components/
    ProgressGraph.tsx
  lib/
    school-engine.ts                   # UID + rule-based progress insight helpers
    supabase.ts                        # Browser Supabase client
scripts/
  provision-demo-admin.mjs             # Explicit, guarded demo admin provisioning
  remove-demo-admin.mjs                # Removes only a marked demo admin
```

## Main Routes

- `/` - Landing page
- `/login` - User login
- `/register` - Identity verification / onboarding
- `/dashboard/student/chat` - Student chat view
- `/dashboard/student/progress` - Student performance analytics
- `/dashboard/teacher/enrollment` - Teacher enrollment flow
- `/dashboard/teacher/progress` - Teacher marks upload
- `/dashboard/parent` - Parent dashboard and PDF report
- `/dashboard/admin/teachers` - Admin teacher management

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and set the public Supabase project values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000`.

The service-role key shown in `.env.example` is for the explicit admin provisioning/removal scripts only. Keep it in a trusted terminal environment and never expose it to the browser or commit it.

## Supabase Notes

The app currently expects these tables:

- `students`
- `assessments`
- `messages`

Example usage in the codebase:

- `students` stores enrolled student details including `full_name`, `roll_number`, `unique_id`, and `class_id`
- `assessments` stores marks with fields like `student_id`, `score`, `subject`, and `timestamp`
- `messages` stores classroom chat messages with fields like `text` and `class_id`

## Authentication and Route Protection

- Login uses Supabase Auth email/password. An administrator must assign the user's role in trusted `app_metadata`; roles in user-editable metadata are not accepted.
- `src/proxy.ts` checks the Supabase session and the role required for student, teacher, parent, and admin dashboard routes.
- Data authorization still depends on correct Supabase Row Level Security policies for the actual database schema. No schema or RLS migrations are included in this repository, so do not expose real student data until policies are reviewed and tested.
- Registration-code validation and account activation are not connected to a registration-code table or server-side verifier yet.

## AI / Analytics Logic

The lightweight analytics logic lives in [`src/lib/school-engine.ts`](src/lib/school-engine.ts). It currently:

- Generates student unique IDs
- Produces rule-based progress insights from assessment trends
- Returns status colors for score ranges

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
```

## Current State

This project remains a prototype. Teacher enrollment and marks upload call Supabase directly, but schema constraints and RLS are not included here. Student progress filters on the trusted `app_metadata.student_id` claim, which must be provisioned to match the database record. The parent portal's lookup is not a secure parent-child relationship. Admin teacher management is sample data, and chat has a basic send/read flow without realtime behavior. These flows should not be presented as fully verified or used with real student information.

### Demo Admin provisioning

Use a dedicated, unused account in the intended Supabase project. Set `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DEMO_ADMIN_EMAIL`, and `DEMO_ADMIN_PASSWORD` in a private local shell, then run `npm run provision:demo-admin`. The script creates the account with trusted `app_metadata.role=admin` and `app_metadata.demo_account=true`, will not overwrite an existing account, and does not print the password. Sign in at `/login`, choose **Admin**, and expect `/dashboard/admin/teachers`. This process only provisions Supabase Auth; live access still depends on the deployed app using the same project and required environment variables.

To remove the dedicated account after the demo, run `npm run remove:demo-admin -- demo-admin@example.edu` with the same server-only URL/key in the shell. The script refuses to delete accounts without both demo markers. No production account is created automatically on deploy.

## License

Private project.
