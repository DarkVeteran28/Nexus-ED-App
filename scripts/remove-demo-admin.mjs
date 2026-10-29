import './load-local-env.mjs';
import { createClient } from '@supabase/supabase-js';
import { findUserByEmail, isRemovableDemoAdmin, normalizeEmail } from './demo-admin-helpers.mjs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
const email = normalizeEmail(process.argv[2]);

if (!url || !serviceRoleKey || !email) {
  throw new Error('Usage: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SECRET_KEY=... node scripts/remove-demo-admin.mjs demo-admin@example.edu');
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let page = 1;
let user;
while (!user) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) throw new Error(`Could not inspect Auth users: ${error.message}`);
  user = findUserByEmail(data.users, email);
  if (user || data.users.length < 1000) break;
  page += 1;
}

if (!user) {
  console.log('No matching account found; nothing was removed.');
  process.exit(0);
}
if (!isRemovableDemoAdmin(user)) {
  throw new Error('Refusing to remove this account because it is not marked as the dedicated demo Admin.');
}

const { error } = await supabase.auth.admin.deleteUser(user.id);
if (error) throw new Error(`Could not remove demo Admin: ${error.message}`);
console.log(`Removed dedicated demo Admin ${email}.`);
