'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert("Login Error: " + error.message);
    } else {
      // If successful, go to the student chat
      router.push('/dashboard/student/chat');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-sans">
      <form onSubmit={handleLogin} className="p-8 border rounded-xl shadow-lg bg-white flex flex-col gap-4 w-80">
        <h2 className="text-xl font-bold text-center">Nexus Ed Login</h2>
        <input 
          type="email" 
          placeholder="Email" 
          className="p-2 border rounded"
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="p-2 border rounded"
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" className="bg-black text-white p-2 rounded font-bold hover:bg-gray-800">
          Login
        </button>
      </form>
    </div>
  );
}