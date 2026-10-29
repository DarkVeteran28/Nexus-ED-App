// src/lib/id-generator.ts
export function generateStudentUID(name: string, rollNumber: number, schoolCode: string) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const year = new Date().getFullYear();
  // Realistic ID: SCHOOL-YEAR-ROLL-INITIALS (e.g., SCH-2026-05-JD)
  return `${schoolCode}-${year}-${rollNumber.toString().padStart(2, '0')}-${initials}`;
}