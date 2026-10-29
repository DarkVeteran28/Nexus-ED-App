// src/lib/school-engine.ts

/** * Requirement 4: Generates a Unique ID for students 
 * Pattern: [SCHOOL_CODE]-[YEAR]-[ROLL_NO]-[INITIALS]
 */

export function generateStudentUID(name: string, roll: number, schoolCode: string) {
  const initials = name.trim().split(' ').map(n => n[0]).join('').toUpperCase();
  const year = new Date().getFullYear();
  return `${schoolCode.toUpperCase()}-${year}-${roll.toString().padStart(2, '0')}-${initials}`;
}

// src/lib/school-engine.ts

export function analyzeProgress(data: { unit: string; score: number }[]) {

  
  if (data.length < 2) return "Keep appearing for tests to generate deeper AI insights.";

  const lastScore = data[data.length - 1].score;
  const previousScore = data[data.length - 2].score;
  const trend = lastScore - previousScore;

  if (lastScore < 40) {
    return "Critical Alert: Your current mastery is below the required threshold. The AI recommends revisiting 'Foundational Concepts' before the next unit.";
  }

  if (trend > 10) {
    return "Excellent Improvement! Your score jumped by " + trend + " points. This shows strong Syllabus Grounding in the recent chapters.";
  }

  return "Steady performance maintained. To reach the next level, focus on the 'Advanced Analytics' section of your current curriculum.";
}
// Add this to your analyzeProgress logic
export function getAIStatusColor(score: number) {
  if (score >= 80) return "text-green-600"; // Mastery
  if (score >= 50) return "text-amber-600"; // Developing
  return "text-red-600"; // Critical Attention
}