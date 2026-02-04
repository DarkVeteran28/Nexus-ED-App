'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [role, setRole] = useState<'student' | 'admin' | 'parent'>('student');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-6">Nexus Ed Portal</h1>
        
        {/* Toggle between roles */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
          {(['student', 'admin', 'parent'] as const).map((r) => (
            <button key={r} onClick={() => setRole(r)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${role === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {r}
            </button>
          ))}
        </div>

        <form className="space-y-4">
          {role === 'student' && (
            <>
              <input type="text" placeholder="Unique ID (e.g. SCH-2024-01-JD)" className="w-full p-3 border rounded-lg" required />
              <input type="number" placeholder="Class Roll Number" className="w-full p-3 border rounded-lg" required />
              <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg" required />
            </>
          )}

          {role === 'admin' && (
            <input type="text" placeholder="School Registration Code" className="w-full p-3 border rounded-lg" required />
          )}

          {role === 'parent' && (
            <>
              <input type="text" placeholder="Child's Full Name" className="w-full p-3 border rounded-lg" required />
              <input type="number" placeholder="Child's Roll Number" className="w-full p-3 border rounded-lg" required />
            </>
          )}

          <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg" required />
          
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
            Login as {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        </form>
      </div>
    </div>
  );
}