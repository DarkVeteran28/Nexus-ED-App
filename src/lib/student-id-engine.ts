export function generateStudentUID(name: string, rollNumber: number, schoolCode: string) {
  const year = new Date().getFullYear();
  const nameSlug = name.trim().split(' ').map(n => n[0]).join('').toUpperCase();
  
  // Logic: [SCHOOL]-[YEAR]-[ROLL]-[INITIALS]
  // Example: NEXUS-2024-01-JD (John Doe)
  const uniqueId = `${schoolCode.toUpperCase()}-${year}-${rollNumber.toString().padStart(2, '0')}-${nameSlug}`;
  return uniqueId;
}