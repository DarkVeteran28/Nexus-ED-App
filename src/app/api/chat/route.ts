import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: 'Chat service is not configured.' }, { status: 503 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Sign in to send a class message.' }, { status: 401 });
  if (!['student', 'teacher'].includes(user.app_metadata.role)) {
    return NextResponse.json({ error: 'Your account cannot send class messages.' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || !('text' in body) || !('classId' in body)) {
    return NextResponse.json({ error: 'Message text and class ID are required.' }, { status: 400 });
  }
  const { text, classId } = body as { text: unknown; classId: unknown };
  if (typeof text !== 'string' || !text.trim() || text.trim().length > 2000 || typeof classId !== 'string' || !classId.trim() || classId.length > 80) {
    return NextResponse.json({ error: 'Provide a message (up to 2,000 characters) and a valid class ID.' }, { status: 400 });
  }

  const { data, error } = await supabase.from('messages').insert({ text: text.trim(), class_id: classId.trim() }).select().single();
  if (error) return NextResponse.json({ error: 'Message could not be saved.' }, { status: 400 });
  return NextResponse.json({ success: true, data }, { status: 201 });
}
