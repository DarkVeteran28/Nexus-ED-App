import { createHash, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  let userClient: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  try { userClient = await createSupabaseServerClient(); }
  catch { return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 }); }
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Sign in as a teacher to enroll a student.' }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Request must be valid JSON.' }, { status: 400 }); }
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Student details are required.' }, { status: 400 });
  const values = body as Record<string, unknown>;
  const fullName = typeof values.fullName === 'string' ? values.fullName.trim() : '';
  const classId = typeof values.classId === 'string' ? values.classId.trim() : '';
  const guardianEmail = typeof values.guardianEmail === 'string' ? values.guardianEmail.trim().toLowerCase() : '';
  const rollNumber = values.rollNumber;
  if (fullName.length < 2 || fullName.length > 160) return NextResponse.json({ error: 'Enter a student name between 2 and 160 characters.' }, { status: 400 });
  if (!Number.isSafeInteger(rollNumber) || Number(rollNumber) < 1) return NextResponse.json({ error: 'Enter a positive whole-number roll number.' }, { status: 400 });
  if (!classId || classId.length > 80) return NextResponse.json({ error: 'Enter a valid class.' }, { status: 400 });
  if (guardianEmail && (guardianEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guardianEmail))) return NextResponse.json({ error: 'Enter a valid guardian email address.' }, { status: 400 });

  const { data: member, error: memberError } = await userClient.from('school_members').select('school_id, role, is_active').eq('user_id', user.id).maybeSingle();
  if (memberError || !member || member.role !== 'teacher' || !member.is_active || user.app_metadata.role !== 'teacher') return NextResponse.json({ error: 'An active teacher account is required.' }, { status: 403 });
  const { data: assignment, error: assignmentError } = await userClient.from('teacher_classes').select('class_id').eq('teacher_id', user.id).eq('school_id', member.school_id).eq('class_id', classId).limit(1).maybeSingle();
  if (assignmentError || !assignment) return NextResponse.json({ error: 'You are not assigned to this class.' }, { status: 403 });

  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try { admin = createSupabaseAdminClient(); }
  catch { return NextResponse.json({ error: 'Student enrollment is not configured on this server.' }, { status: 503 }); }
  const { data: school, error: schoolError } = await admin.from('schools').select('code').eq('id', member.school_id).single();
  if (schoolError || !school) return NextResponse.json({ error: 'School record could not be loaded.' }, { status: 500 });
  const initials = fullName.split(/\s+/).map(part => part[0]).join('').toUpperCase();
  const uniqueId = `${school.code}-${new Date().getFullYear()}-${String(rollNumber).padStart(2, '0')}-${initials}`;
  const { data: student, error: insertError } = await admin.from('students').insert({
    school_id: member.school_id, full_name: fullName, roll_number: rollNumber, unique_id: uniqueId,
    class_id: classId, guardian_email: guardianEmail || null, created_by: user.id,
  }).select('id').single();
  if (insertError || !student) return NextResponse.json({ error: insertError?.code === '23505' ? 'That roll number or student ID already exists in this class.' : 'Student could not be enrolled.' }, { status: 400 });

  const studentCode = randomBytes(32).toString('base64url');
  const rows = [{ code_hash: createHash('sha256').update(studentCode).digest('hex'), school_id: member.school_id, role: 'student', linked_student_id: student.id, created_by: user.id }];
  let parentCode: string | undefined;
  if (guardianEmail) {
    parentCode = randomBytes(32).toString('base64url');
    rows.push({ code_hash: createHash('sha256').update(parentCode).digest('hex'), school_id: member.school_id, role: 'parent', linked_student_id: student.id, created_by: user.id });
  }
  const { error: codeError } = await admin.from('registration_codes').insert(rows);
  if (codeError) {
    await admin.from('students').delete().eq('id', student.id);
    return NextResponse.json({ error: 'Enrollment was rolled back because activation codes could not be created.' }, { status: 500 });
  }
  return NextResponse.json({ uniqueId, codes: { student: studentCode, ...(parentCode ? { parent: parentCode } : {}) } }, { status: 201 });
}
