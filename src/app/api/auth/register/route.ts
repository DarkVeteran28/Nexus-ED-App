import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

const supportedRoles = new Set(['student', 'teacher', 'parent']);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request must be valid JSON.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Registration details are required.' }, { status: 400 });

  const values = body as Record<string, unknown>;
  const role = values.role;
  const email = typeof values.email === 'string' ? values.email.trim().toLowerCase() : '';
  const password = typeof values.password === 'string' ? values.password : '';
  const fullName = typeof values.fullName === 'string' ? values.fullName.trim() : '';
  const code = typeof values.registrationCode === 'string' ? values.registrationCode.trim() : '';
  const rollNumber = Number(values.rollNumber);

  if (typeof role !== 'string' || !supportedRoles.has(role)) return NextResponse.json({ error: 'Choose a supported account role.' }, { status: 400 });
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  if (password.length < 12 || password.length > 128) return NextResponse.json({ error: 'Use a password between 12 and 128 characters.' }, { status: 400 });
  if (fullName.length < 2 || fullName.length > 160) return NextResponse.json({ error: 'Enter your full name.' }, { status: 400 });
  if (code.length < 20 || code.length > 100) return NextResponse.json({ error: 'Enter the complete school-issued registration code.' }, { status: 400 });
  if ((role === 'student' || role === 'parent') && (!Number.isSafeInteger(rollNumber) || rollNumber < 1)) {
    return NextResponse.json({ error: 'Enter the roll number on the school record.' }, { status: 400 });
  }

  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    admin = createSupabaseAdminClient();
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Registration service is not configured.' }, { status: 503 });
  }

  const codeHash = createHash('sha256').update(code, 'utf8').digest('hex');
  const { data: invitation, error: invitationError } = await admin
    .from('registration_codes')
    .select('id, school_id, role, linked_student_id, intended_email, class_id, subject, expires_at, max_uses, use_count, is_active')
    .eq('code_hash', codeHash)
    .eq('role', role)
    .maybeSingle();

  if (invitationError || !invitation || !invitation.is_active || new Date(invitation.expires_at).getTime() <= Date.now() || invitation.use_count >= invitation.max_uses) {
    return NextResponse.json({ error: 'That registration code is invalid, expired, or has already been used.' }, { status: 400 });
  }

  let studentId: string | null = null;
  let accountName = fullName;
  if (role === 'student' || role === 'parent') {
    if (!invitation.linked_student_id || !uuidPattern.test(invitation.linked_student_id)) {
      return NextResponse.json({ error: 'That code is not linked to a student record.' }, { status: 400 });
    }
    const { data: student, error } = await admin
      .from('students')
      .select('id, full_name, roll_number, auth_user_id, guardian_email')
      .eq('id', invitation.linked_student_id)
      .eq('school_id', invitation.school_id)
      .maybeSingle();
    if (error || !student || student.roll_number !== rollNumber) {
      return NextResponse.json({ error: 'The code and roll number do not match a school record.' }, { status: 400 });
    }
    if (role === 'student') {
      if (student.auth_user_id) return NextResponse.json({ error: 'This student record already has an activated account.' }, { status: 409 });
      if (student.full_name.trim().toLowerCase() !== fullName.toLowerCase()) {
        return NextResponse.json({ error: 'Enter the student name exactly as it appears in the school record.' }, { status: 400 });
      }
      accountName = student.full_name;
      studentId = student.id;
    } else {
      if (!student.guardian_email || student.guardian_email.toLowerCase() !== email) {
        return NextResponse.json({ error: 'Use the guardian email address recorded by the school.' }, { status: 400 });
      }
      studentId = student.id;
    }
  } else if (!invitation.intended_email || invitation.intended_email.toLowerCase() !== email) {
    return NextResponse.json({ error: 'Use the email address assigned to this teacher invitation.' }, { status: 400 });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: {
      role,
      school_id: invitation.school_id,
      ...(role === 'student' && studentId ? { student_id: studentId } : {}),
    },
    user_metadata: { full_name: accountName },
  });
  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? 'Account could not be created.' }, { status: 400 });
  }

  const { error: completionError } = await admin.rpc('complete_account_registration', {
    p_code_hash: codeHash,
    p_role: role,
    p_user_id: created.user.id,
    p_email: email,
    p_student_id: studentId,
  });
  if (completionError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: completionError.message.includes('Registration code') ? 'That registration code has already been used or expired.' : 'Account activation could not be completed. Ask the school administrator to check the enrollment record.' }, { status: 400 });
  }

  return NextResponse.json({ success: true, role, message: 'Account activated. You can now sign in.' }, { status: 201 });
}
