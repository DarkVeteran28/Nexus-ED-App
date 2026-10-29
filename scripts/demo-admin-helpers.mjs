export function normalizeEmail(email) {
  return email?.trim().toLowerCase() ?? '';
}

export function findUserByEmail(users, email) {
  const normalizedEmail = normalizeEmail(email);
  return users.find((user) => normalizeEmail(user.email) === normalizedEmail);
}

export function isReusableDemoAdmin(user) {
  return user?.app_metadata?.role === 'admin' && user?.app_metadata?.demo_account === true;
}

export function isRemovableDemoAdmin(user) {
  return isReusableDemoAdmin(user);
}
