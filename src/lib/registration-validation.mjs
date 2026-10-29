const supportedRoles = new Set(['student', 'teacher', 'parent']);

export function validateRegistrationDetails(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, error: 'Registration details are required.' };
  const values = body;
  const role = values.role;
  const email = typeof values.email === 'string' ? values.email.trim().toLowerCase() : '';
  const password = typeof values.password === 'string' ? values.password : '';
  const fullName = typeof values.fullName === 'string' ? values.fullName.trim() : '';
  const code = typeof values.registrationCode === 'string' ? values.registrationCode.trim() : '';
  const rollNumber = Number(values.rollNumber);

  if (typeof role !== 'string' || !supportedRoles.has(role)) return { ok: false, error: 'Choose a supported account role.' };
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Enter a valid email address.' };
  if (password.length < 12 || password.length > 128) return { ok: false, error: 'Use a password between 12 and 128 characters.' };
  if (fullName.length < 2 || fullName.length > 160) return { ok: false, error: 'Enter your full name.' };
  if (code.length < 20 || code.length > 100) return { ok: false, error: 'Enter the complete school-issued registration code.' };
  if ((role === 'student' || role === 'parent') && (!Number.isSafeInteger(rollNumber) || rollNumber < 1)) {
    return { ok: false, error: 'Enter the roll number on the school record.' };
  }
  return { ok: true, value: { role, email, password, fullName, code, rollNumber } };
}
