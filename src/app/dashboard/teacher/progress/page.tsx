'use client';
import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export default function MarksUpload() {
  const [studentId, setStudentId] = useState('');
  const [score, setScore] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const numericScore = Number(score);
      if (!Number.isInteger(numericScore) || numericScore < 0 || numericScore > 100) {
        throw new Error('Enter a whole-number score from 0 to 100.');
      }
      const client = getSupabaseBrowserClient();
      const { data: student, error: studentError } = await client.from('students')
        .select('id').eq('unique_id', studentId.trim()).single();
      if (studentError || !student) throw new Error('Student ID was not found or is outside your assigned classes.');
      const { error } = await client.from('assessments')
        .insert({ student_id: student.id, score: numericScore, subject, timestamp: new Date().toISOString() });
      if (error) throw error;
      setMessage('Assessment saved.');
      setIsError(false);
      setStudentId('');
      setScore('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Assessment could not be saved.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Upload Unit Test Marks</h2>
      <form onSubmit={handleUpload} className="space-y-4 bg-white p-6 rounded-xl border shadow">
        <input 
          placeholder="Student Unique ID (e.g., NEXUS-2026-01-JD)" 
          className="w-full p-2 border rounded"
          onChange={(e) => setStudentId(e.target.value)}
          required
        />
        <label htmlFor="assessment-subject" className="sr-only">Subject</label>
        <select id="assessment-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full p-2 border rounded">
          <option>Mathematics</option><option>Science</option><option>English</option><option>Social Studies</option>
        </select>
        <input 
          aria-label="Score out of 100"
          type="number" 
          min="0"
          max="100"
          step="1"
          placeholder="Score (out of 100)" 
          className="w-full p-2 border rounded"
          onChange={(e) => setScore(e.target.value)}
          value={score}
          required
        />
        {message && <p role="status" className={isError ? 'text-sm text-red-700' : 'text-sm text-emerald-700'}>{message}</p>}
        <button disabled={loading} className="w-full bg-green-600 text-white p-2 rounded font-bold disabled:opacity-60">
          {loading ? 'Saving…' : 'Save Assessment'}
        </button>
      </form>
    </div>
  );
}
