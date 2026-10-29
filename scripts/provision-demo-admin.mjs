import { createClient } from '@supabase/supabase-js';
import { findUserByEmail, isReusableDemoAdmin, normalizeEmail } from './demo-admin-helpers.mjs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = normalizeEmail(process.env.DEMO_ADMIN_EMAIL);
const password = process.env.DEMO_ADMIN_PASSWORD;

if (!url || !serviceRoleKey || !email || !password) {
  throw new Error('Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DEMO_ADMIN_EMAIL, and DEMO_ADMIN_PASSWORD in your local shell.');
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

if (existingUser) {
  if (isReusableDemoAdmin(existingUser)) {
    console.log(`Demo Admin already provisioned: ${email}. No account fields were changed.`);
    process.exit(0);
  }
  throw new Error('That email already belongs to an account that is not marked as this demo Admin. Nothing was changed. Choose a dedicated unused email.');
}

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  app_metadata: { role: 'admin', demo_account: true },
});
if (error) throw new Error(`Could not create demo Admin: ${error.message}`);
console.log(`Created demo Admin ${data.user.email}. The password was not printed. Sign in with role Admin and then verify /dashboard/admin/teachers.`);
