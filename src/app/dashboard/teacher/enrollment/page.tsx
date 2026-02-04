'use client'; // 1. Must be the first line

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { generateStudentUID } from '@/lib/school-engine';

export default function EnrollmentPage() {
  // All states inside the same component
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. The function is marked 'async', so 'await' is now valid
  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Logic for ID generation
      const uid = generateStudentUID(name, parseInt(roll), 'NEXUS');

      // 3. This 'await' will only work if handleEnroll is 'async'
      const { error } = await supabase
        .from('students')
        .insert([
          { 
            full_name: name, 
            roll_number: parseInt(roll), 
            unique_id: uid,
            class_id: '10A' 
          }
        ]);

      if (error) throw error;
      alert(`Success! Student Unique ID: ${uid}`);
      setName('');
      setRoll('');

    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Enroll New Student</h1>
      <form onSubmit={handleEnroll} className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
        <input 
          placeholder="Name" 
          className="border p-2 w-full rounded" 
          value={name}
          onChange={e => setName(e.target.value)} 
          required 
        />
        <input 
          placeholder="Roll No" 
          type="number"
          className="border p-2 w-full rounded" 
          value={roll}
          onChange={e => setRoll(e.target.value)} 
          required 
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : 'Save to Database'}
        </button>
      </form>
    </div>
  );
}