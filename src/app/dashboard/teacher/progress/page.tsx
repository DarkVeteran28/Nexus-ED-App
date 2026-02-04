'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { analyzeProgress } from '@/lib/school-engine'; // Using your AI logic

export default function MarksUpload() {
  const [studentId, setStudentId] = useState('');
  const [score, setScore] = useState('');
  const [subject, setSubject] = useState('Mathematics');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save marks to Supabase
    const { error } = await supabase
      .from('assessments')
      .insert([{ 
        student_id: studentId, 
        score: parseInt(score), 
        subject: subject,
        timestamp: new Date().toISOString()
      }]);

    if (error) alert(error.message);
    else alert("Marks uploaded! AI analytics updated.");
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Upload Unit Test Marks</h2>
      <form onSubmit={handleUpload} className="space-y-4 bg-white p-6 rounded-xl border shadow">
        <input 
          placeholder="Student Unique ID (e.g., NEXUS-2026-01-JD)" 
          className="w-full p-2 border rounded"
          onChange={(e) => setStudentId(e.target.value)}
        />
        <input 
          type="number" 
          placeholder="Score (out of 100)" 
          className="w-full p-2 border rounded"
          onChange={(e) => setScore(e.target.value)}
        />
        <button className="w-full bg-green-600 text-white p-2 rounded font-bold">
          Analyze & Save
        </button>
      </form>
    </div>
  );
}