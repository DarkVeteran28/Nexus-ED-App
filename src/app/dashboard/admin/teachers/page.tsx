'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Plus, ShieldCheck, UserRoundX } from 'lucide-react';

type Assignment = { class_id: string; subject: string };
type Teacher = { user_id: string; email: string; display_name: string; is_active: boolean; teacher_classes: Assignment[] };

export default function AdminTeacherPortal() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [email, setEmail] = useState('');
  const [classId, setClassId] = useState('');
  const [subject, setSubject] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [assignmentFor, setAssignmentFor] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/teachers', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Teacher list could not be loaded.');
      setTeachers(result.teachers);
    } catch (cause) {
      setError(true);
      setMessage(cause instanceof Error ? cause.message : 'Teacher list could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadTeachers(); }, [loadTeachers]);

  async function submitAction(path: string, payload: Record<string, string>) {
    const response = await fetch(path, {
      method: path.endsWith('/teachers') ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'The request could not be completed.');
    return result;
  }

  async function inviteTeacher(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage(''); setInviteCode('');
    try {
      const result = await submitAction('/api/admin/teachers', { email, classId, subject });
      setInviteCode(result.code);
      setMessage(`Invitation created for ${result.email}. Copy the code now; it will only be shown once.`);
      setError(false); setEmail(''); setClassId(''); setSubject('');
      await loadTeachers();
    } catch (cause) {
      setError(true); setMessage(cause instanceof Error ? cause.message : 'Invitation could not be created.');
    } finally { setSaving(false); }
  }

  async function assignTeacher(event: FormEvent<HTMLFormElement>, userId: string) {
    event.preventDefault(); setSaving(true); setMessage('');
    try {
      await submitAction('/api/admin/teachers', { action: 'assign', userId, classId, subject });
      setMessage('Class assignment saved.'); setError(false); setAssignmentFor(''); setClassId(''); setSubject('');
      await loadTeachers();
    } catch (cause) {
      setError(true); setMessage(cause instanceof Error ? cause.message : 'Assignment could not be saved.');
    } finally { setSaving(false); }
  }

  async function revokeTeacher(teacher: Teacher) {
    if (!window.confirm(`Revoke ${teacher.display_name}'s access to this school?`)) return;
    setSaving(true); setMessage('');
    try {
      await submitAction('/api/admin/teachers', { action: 'revoke', userId: teacher.user_id });
      setMessage('Teacher access revoked.'); setError(false); await loadTeachers();
    } catch (cause) {
      setError(true); setMessage(cause instanceof Error ? cause.message : 'Access could not be revoked.');
    } finally { setSaving(false); }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6 sm:p-10">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><ShieldCheck className="text-blue-600" /> Admin: Teacher Management</h1>
        <p className="mt-2 text-sm text-slate-600">Invite teachers and manage access for your school.</p>
      </header>

      <form onSubmit={inviteTeacher} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <h2 className="sm:col-span-2 text-lg font-semibold">Invite a teacher</h2>
        <label className="grid gap-1 text-sm font-medium">Teacher email
          <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900" placeholder="teacher@school.edu" />
        </label>
        <label className="grid gap-1 text-sm font-medium">Class
          <input required maxLength={80} value={classId} onChange={e => setClassId(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900" placeholder="10A" />
        </label>
        <label className="grid gap-1 text-sm font-medium">Subject
          <input required maxLength={100} value={subject} onChange={e => setSubject(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900" placeholder="Mathematics" />
        </label>
        <button disabled={saving} className="flex items-center justify-center gap-2 self-end rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"><Plus size={18} /> {saving ? 'Saving…' : 'Create invitation'}</button>
        {inviteCode && <div className="sm:col-span-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4"><p className="text-sm font-medium text-emerald-900">One-time teacher registration code</p><code className="mt-2 block break-all rounded bg-white p-3 text-slate-900">{inviteCode}</code></div>}
      </form>

      {message && <p role={error ? 'alert' : 'status'} className={`rounded-lg p-3 text-sm ${error ? 'bg-red-50 text-red-800' : 'bg-slate-100 text-slate-800'}`}>{message}</p>}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">School teachers</h2>
        {loading ? <p role="status" className="text-sm text-slate-600">Loading teachers…</p> : teachers.length === 0 ? <p className="rounded-xl border border-dashed p-6 text-sm text-slate-600">No teacher accounts are registered yet. Create an invitation above.</p> : teachers.map(teacher => (
          <article key={teacher.user_id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><h3 className="font-semibold text-slate-900">{teacher.display_name}</h3><p className="text-sm text-slate-600">{teacher.email}</p>
                <p className="mt-2 text-sm text-slate-700">{teacher.teacher_classes.length ? teacher.teacher_classes.map(a => `${a.class_id} · ${a.subject}`).join(', ') : 'No class assignments'}</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setAssignmentFor(assignmentFor === teacher.user_id ? '' : teacher.user_id); setClassId(''); setSubject(''); }} className="text-sm font-medium text-blue-700 underline">Assign class</button>
                <button type="button" disabled={saving} onClick={() => void revokeTeacher(teacher)} className="inline-flex items-center gap-1 text-sm font-medium text-red-700 underline disabled:opacity-50"><UserRoundX size={16} /> Revoke</button>
              </div>
            </div>
            {assignmentFor === teacher.user_id && <form onSubmit={event => void assignTeacher(event, teacher.user_id)} className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-3">
              <label className="grid gap-1 text-sm">Class<input required maxLength={80} value={classId} onChange={e => setClassId(e.target.value)} className="rounded border px-3 py-2" /></label>
              <label className="grid gap-1 text-sm">Subject<input required maxLength={100} value={subject} onChange={e => setSubject(e.target.value)} className="rounded border px-3 py-2" /></label>
              <button disabled={saving} className="self-end rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60">Save assignment</button>
            </form>}
          </article>
        ))}
      </section>
    </main>
  );
}
