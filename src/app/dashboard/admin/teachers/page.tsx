'use client';
import { useState } from 'react';
import { Plus, ShieldCheck } from 'lucide-react';

export default function AdminTeacherPortal() {
  const [teachers, setTeachers] = useState([
    { id: 1, name: "Dr. Vikram Seth", subject: "Physics", classAssigned: "12-B" }
  ]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="text-blue-600" /> Admin: Teacher Management
        </h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={18} /> Add New Teacher
        </button>
      </div>

      <div className="grid gap-4">
        {teachers.map((t) => (
          <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
            <div>
              <h3 className="font-bold text-slate-800">{t.name}</h3>
              <p className="text-sm text-slate-500">{t.subject} • Class Teacher of {t.classAssigned}</p>
            </div>
            <div className="flex gap-2">
              <button className="text-sm text-blue-600 hover:underline">Edit Access</button>
              <button className="text-sm text-red-500 hover:underline">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}