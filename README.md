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
      admin/teachers/page.tsx          # Admin teacher management
      parent/page.tsx                  # Parent portal and report export
      student/chat/page.tsx            # Student classroom chat
      student/progress/page.tsx        # Student analytics page
      teacher/enrollment/page.tsx      # Student enrollment + UID generation
      teacher/progress/page.tsx        # Marks upload flow
    login/page.tsx                     # Main login page
    register/page.tsx                  # Identity verification screen
    page.tsx                           # Landing page
  components/
    ProgressGraph.tsx
  lib/
    school-engine.ts                   # UID + progress insight helpers
    supabase.ts                        # Supabase client
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

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000`.

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

- Client-side login is handled through Supabase auth
- `src/middleware.ts` protects `/dashboard/*` routes and redirects unauthenticated users to `/login`

## AI / Analytics Logic

The lightweight analytics logic lives in [`src/lib/school-engine.ts`](/Users/likhiththejas/Documents/Nexus-ed%20mobile/src/lib/school-engine.ts). It currently:

- Generates student unique IDs
- Produces rule-based progress insights from assessment trends
- Returns status colors for score ranges

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Current State

This project is a functional prototype and several flows are still UI-first:

- Some dashboards use placeholder or minimal data handling
- The chat page UI is scaffolded but not fully implemented
- Role-based post-login routing is not yet differentiated
- Supabase credentials should be supplied through environment variables for deployment

## License

Private project.
