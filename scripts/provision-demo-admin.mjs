import './load-local-env.mjs';
import { createClient } from '@supabase/supabase-js';
import { findUserByEmail, isReusableDemoAdmin, normalizeEmail } from './demo-admin-helpers.mjs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
const email = normalizeEmail(process.env.DEMO_ADMIN_EMAIL);
const password = process.env.DEMO_ADMIN_PASSWORD;
const schoolName = process.env.DEMO_ADMIN_SCHOOL_NAME?.trim() || 'Nexus Ed Demo School';
const schoolCode = (process.env.DEMO_ADMIN_SCHOOL_CODE?.trim() || 'NEXUS-DEMO').toUpperCase();

if (!url || !serviceRoleKey || !email || !password) {
  throw new Error('Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY), DEMO_ADMIN_EMAIL, and DEMO_ADMIN_PASSWORD in your local shell.');
}
if (password.length < 12) throw new Error('DEMO_ADMIN_PASSWORD must contain at least 12 characters.');

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let page = 1;
let existingUser;
while (!existingUser) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) throw new Error(`Could not inspect Auth users: ${error.message}`);
  existingUser = findUserByEmail(data.users, email);
  if (existingUser || data.users.length < 1000) break;
  page += 1;
}

const { data: existingSchool, error: schoolLookupError } = await supabase.from('schools').select('id, name').eq('code', schoolCode).maybeSingle();
if (schoolLookupError) throw new Error(`Could not find the demo school. Apply the Nexus-Ed migration first: ${schoolLookupError.message}`);
let schoolId = existingSchool?.id;
if (!schoolId) {
  const { data: createdSchool, error: schoolCreateError } = await supabase.from('schools').insert({ name: schoolName, code: schoolCode }).select('id').single();
  if (schoolCreateError || !createdSchool) throw new Error(`Could not create the demo school: ${schoolCreateError?.message ?? 'unknown error'}`);
  schoolId = createdSchool.id;
}

if (existingUser) {
  if (isReusableDemoAdmin(existingUser) && existingUser.app_metadata.school_id === schoolId) {
    console.log(`Demo Admin already provisioned: ${email}. No account fields were changed.`);
    process.exit(0);
  }
  throw new Error('That email already belongs to an account that is not marked as this demo Admin. Nothing was changed. Choose a dedicated unused email.');
}

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  app_metadata: { role: 'admin', demo_account: true, school_id: schoolId },
});
if (error) throw new Error(`Could not create demo Admin: ${error.message}`);
console.log(`Created demo Admin ${data.user.email}. The password was not printed. Sign in with role Admin and then verify /dashboard/admin/teachers.`);
