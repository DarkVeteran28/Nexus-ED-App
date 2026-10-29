'use client';

import { FormEvent, useState } from 'react';
type GeneratedCodes = { student: string; parent?: string };

export default function EnrollmentPage() {
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [classId, setClassId] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [studentUid, setStudentUid] = useState('');
  const [codes, setCodes] = useState<GeneratedCodes | null>(null);

  async function handleEnroll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage(''); setStudentUid(''); setCodes(null);
    try {
      const response = await fetch('/api/teacher/enrollment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name.trim(), rollNumber: Number(roll), classId: classId.trim(), guardianEmail: guardianEmail.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Student enrollment failed.');
      const uniqueId = result.uniqueId as string;
      const generatedCodes = result.codes as GeneratedCodes;
      setStudentUid(uniqueId); setCodes(generatedCodes);
      setMessage('Student enrolled. Share each activation code privately with the matching account owner; codes are shown only once.');
      setIsError(false); setName(''); setRoll(''); setClassId(''); setGuardianEmail('');
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Student enrollment failed.'); setIsError(true);
    } finally { setLoading(false); }
  }

  return (
    <main className="mx-auto max-w-xl space-y-5 p-6 sm:p-10">
      <h1 className="text-2xl font-bold text-slate-900">Enroll a student</h1>
      <form onSubmit={handleEnroll} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="grid gap-1 text-sm font-medium text-slate-800">Student name<input value={name} onChange={e => setName(e.target.value)} minLength={2} maxLength={160} required autoComplete="name" className="rounded-lg border border-slate-300 px-3 py-3 text-base" /></label>
        <label className="grid gap-1 text-sm font-medium text-slate-800">Roll number<input value={roll} onChange={e => setRoll(e.target.value)} type="number" min="1" step="1" required className="rounded-lg border border-slate-300 px-3 py-3 text-base" /></label>
        <label className="grid gap-1 text-sm font-medium text-slate-800">Class<input value={classId} onChange={e => setClassId(e.target.value)} maxLength={80} required placeholder="10A" className="rounded-lg border border-slate-300 px-3 py-3 text-base" /></label>
        <label className="grid gap-1 text-sm font-medium text-slate-800">Parent or guardian email <span className="font-normal text-slate-500">(optional)</span><input value={guardianEmail} onChange={e => setGuardianEmail(e.target.value)} type="email" maxLength={254} autoComplete="email" className="rounded-lg border border-slate-300 px-3 py-3 text-base" /></label>
        {message && <p role={isError ? 'alert' : 'status'} className={`rounded-lg p-3 text-sm ${isError ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>{message}</p>}
        {studentUid && <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm"><p><strong>Student ID:</strong> <code>{studentUid}</code></p>{codes && <><p><strong>Student activation code:</strong></p><code className="block break-all rounded bg-white p-2">{codes.student}</code>{codes.parent && <><p><strong>Parent activation code:</strong></p><code className="block break-all rounded bg-white p-2">{codes.parent}</code></>}</>}</div>}
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-700 p-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{loading ? 'Saving…' : 'Enroll and generate activation codes'}</button>
      </form>
    </main>
  );
}
