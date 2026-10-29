export type RegistrationDetails = {
  role: 'student' | 'teacher' | 'parent';
  email: string;
  password: string;
  fullName: string;
  code: string;
  rollNumber: number;
};
export function validateRegistrationDetails(body: unknown): { ok: false; error: string } | { ok: true; value: RegistrationDetails };
