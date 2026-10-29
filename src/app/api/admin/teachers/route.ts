import { createHash, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getAdminContext() {
  let userClient: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  try { userClient = await createSupabaseServerClient(); }
  catch { return { response: NextResponse.json({ error: 'Supabase authentication is not configured.' }, { status: 503 }) }; }
  const { data: { user }, error } = await userClient.auth.getUser();
  if (error || !user) return { response: NextResponse.json({ error: 'Sign in as an administrator.' }, { status: 401 }) };
  if (user.app_metadata.role !== 'admin') return { response: NextResponse.json({ error: 'Administrator access is required.' }, { status: 403 }) };
  const { data: membership, error: membershipError } = await userClient
    .from('school_members').select('school_id, role, is_active').eq('user_id', user.id).maybeSingle();
  if (membershipError || !membership || membership.role !== 'admin' || !membership.is_active) {
    return { response: NextResponse.json({ error: 'Administrator membership is inactive.' }, { status: 403 }) };
  }
  try {
    return { admin: createSupabaseAdminClient(), schoolId: membership.school_id as string, userId: user.id };
  } catch {
    return { response: NextResponse.json({ error: 'Admin management is not configured on this server.' }, { status: 503 }) };
  }
}

export async function GET() {
  const context = await getAdminContext();
  if (context.response) return context.response;
  const { data: members, error } = await context.admin.from('school_members')
    .select('user_id, email, display_name, is_active').eq('school_id', context.schoolId).eq('role', 'teacher').order('display_name');
  if (error) return NextResponse.json({ error: 'Teacher list could not be loaded.' }, { status: 500 });
  const teacherIds = (members ?? []).map((member) => member.user_id);
  const assignmentsResult = teacherIds.length
    ? await context.admin.from('teacher_classes').select('teacher_id, class_id, subject').eq('school_id', context.schoolId).in('teacher_id', teacherIds)
    : { data: [], error: null };
  if (assignmentsResult.error) return NextResponse.json({ error: 'Teacher assignments could not be loaded.' }, { status: 500 });
  const teachers = (members ?? []).map((member) => ({
    ...member,
    teacher_classes: (assignmentsResult.data ?? []).filter((assignment) => assignment.teacher_id === member.user_id),
  }));
  return NextResponse.json({ teachers });
}

export async function POST(request: Request) {
  const context = await getAdminContext();
  if (context.response) return context.response;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Request must be valid JSON.' }, { status: 400 }); }
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Teacher invitation details are required.' }, { status: 400 });
  const values = body as Record<string, unknown>;
  const email = typeof values.email === 'string' ? values.email.trim().toLowerCase() : '';
  const classId = typeof values.classId === 'string' ? values.classId.trim() : '';
  const subject = typeof values.subject === 'string' ? values.subject.trim() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return NextResponse.json({ error: 'Enter a valid teacher email address.' }, { status: 400 });
  if (!classId || classId.length > 80 || !subject || subject.length > 100) return NextResponse.json({ error: 'Enter a class and subject.' }, { status: 400 });

  const code = randomBytes(24).toString('base64url');
  const codeHash = createHash('sha256').update(code, 'utf8').digest('hex');
  const { error } = await context.admin.from('registration_codes').insert({
    code_hash: codeHash, school_id: context.schoolId, role: 'teacher', intended_email: email,
    class_id: classId, subject, created_by: context.userId, max_uses: 1,
  });
  if (error) return NextResponse.json({ error: 'Teacher invitation could not be created.' }, { status: 400 });
  return NextResponse.json({ code, email, message: 'Share this one-time code privately with the invited teacher.' }, { status: 201 });
}

export async function PATCH(request: Request) {
  const context = await getAdminContext();
  if (context.response) return context.response;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Request must be valid JSON.' }, { status: 400 }); }
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Teacher action is required.' }, { status: 400 });
  const values = body as Record<string, unknown>;
  const userId = typeof values.userId === 'string' ? values.userId : '';
  const action = values.action;
  if (!uuidPattern.test(userId)) return NextResponse.json({ error: 'Teacher account is invalid.' }, { status: 400 });
  const { data: teacher, error: teacherError } = await context.admin.from('school_members')
    .select('user_id, role, school_id, is_active').eq('user_id', userId).eq('school_id', context.schoolId)
    .eq('role', 'teacher').eq('is_active', true).maybeSingle();
  if (teacherError || !teacher) return NextResponse.json({ error: 'Active teacher account was not found in this school.' }, { status: 404 });

  if (action === 'assign') {
    const classId = typeof values.classId === 'string' ? values.classId.trim() : '';
    const subject = typeof values.subject === 'string' ? values.subject.trim() : '';
    if (!classId || classId.length > 80 || !subject || subject.length > 100) return NextResponse.json({ error: 'Enter a class and subject.' }, { status: 400 });
    const { error } = await context.admin.from('teacher_classes').upsert(
      { teacher_id: userId, school_id: context.schoolId, class_id: classId, subject },
      { onConflict: 'teacher_id,class_id,subject' },
    );
    if (error) return NextResponse.json({ error: 'Class assignment could not be saved.' }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (action === 'revoke') {
    const { data: authUser, error: authLookupError } = await context.admin.auth.admin.getUserById(userId);
    if (authLookupError || !authUser.user || authUser.user.app_metadata.school_id !== context.schoolId || authUser.user.app_metadata.demo_account === true) {
      return NextResponse.json({ error: 'This account cannot be revoked from this screen.' }, { status: 403 });
    }
    const { error: memberError } = await context.admin.from('school_members').update({ is_active: false }).eq('user_id', userId).eq('school_id', context.schoolId);
    if (memberError) return NextResponse.json({ error: 'Teacher access could not be revoked.' }, { status: 500 });
    const { error: authUpdateError } = await context.admin.auth.admin.updateUserById(userId, {
      app_metadata: { ...authUser.user.app_metadata, role: 'disabled' },
    });
    if (authUpdateError) {
      await context.admin.from('school_members').update({ is_active: true }).eq('user_id', userId).eq('school_id', context.schoolId);
      return NextResponse.json({ error: 'Teacher access could not be revoked.' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Unsupported teacher action.' }, { status: 400 });
}
