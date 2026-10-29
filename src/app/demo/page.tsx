'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

type Role = 'student' | 'teacher' | 'parent' | 'admin';
type Learner = { name: string; className: string; id: string; scores: number[] };
type ChatMessage = { author: string; text: string; time: string };

const roles: { id: Role; label: string; icon: string; description: string }[] = [
  { id: 'student', label: 'Student', icon: '🎓', description: 'Learning progress and class chat' },
  { id: 'teacher', label: 'Teacher', icon: '📚', description: 'Enrollment and assessment tools' },
  { id: 'parent', label: 'Parent', icon: '🏡', description: 'A learner’s progress at a glance' },
  { id: 'admin', label: 'Admin', icon: '🛡️', description: 'School overview and staff' },
];

const initialLearners: Learner[] = [
  { name: 'Aarav Sharma', className: '10A', id: 'NX-10A-001', scores: [68, 74, 81, 86] },
  { name: 'Maya Patel', className: '10A', id: 'NX-10A-002', scores: [82, 79, 88, 92] },
  { name: 'Rohan Das', className: '10B', id: 'NX-10B-003', scores: [61, 70, 73, 78] },
];

const initialMessages: ChatMessage[] = [
  { author: 'Maya · 10A', text: 'The fractions practice helped a lot. Thanks!', time: '9:14 AM' },
  { author: 'Aarav · 10A', text: 'Is the next quiz on Thursday?', time: '9:21 AM' },
  { author: 'Ms. Rivera · Teacher', text: 'Yes — review chapters 4 and 5. You’ve got this!', time: '9:26 AM' },
];

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>{children}</section>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <Card><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-sm text-emerald-700">{note}</p></Card>;
}

export default function DemoPage() {
  const [role, setRole] = useState<Role>('student');
  const [learners, setLearners] = useState(initialLearners);
  const [messages, setMessages] = useState(initialMessages);
  const [chatText, setChatText] = useState('');
  const [notice, setNotice] = useState('');

  function enroll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const className = String(form.get('className') ?? '').trim().toUpperCase();
    if (!name || !className) return;
    const learner: Learner = { name, className, id: `NX-${className}-${String(learners.length + 1).padStart(3, '0')}`, scores: [] };
    setLearners(current => [learner, ...current]);
    setNotice(`${name} was added to the sample class roster.`);
    event.currentTarget.reset();
  }

  function addAssessment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const learnerId = String(form.get('learnerId'));
    const score = Number(form.get('score'));
    if (!Number.isInteger(score) || score < 0 || score > 100) return;
    setLearners(current => current.map(learner => learner.id === learnerId ? { ...learner, scores: [...learner.scores, score] } : learner));
    setNotice('Assessment added to the sample data.');
    event.currentTarget.reset();
  }

  function sendChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanText = chatText.trim();
    if (!cleanText) return;
    setMessages(current => [...current, { author: 'You · Demo student', text: cleanText, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }]);
    setChatText('');
  }

  const demoLearner = learners[0];
  const average = demoLearner.scores.length ? Math.round(demoLearner.scores.reduce((sum, score) => sum + score, 0) / demoLearner.scores.length) : 0;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-slate-950">Nexus<span className="text-blue-700">Ed</span> <span className="ml-1 rounded-full bg-blue-50 px-2 py-1 align-middle text-xs font-semibold text-blue-700">LIVE DEMO</span></Link>
          <Link href="/login" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">School sign in</Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-8 sm:py-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Explore the portal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">A school day, from every side.</h1>
          <p className="mt-3 text-slate-600">Choose a role to explore Nexus-Ed. This interactive preview uses fictional sample data and does not require an account.</p>
        </div>

        <nav aria-label="Choose demo role" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {roles.map(item => <button key={item.id} type="button" aria-pressed={role === item.id} onClick={() => { setRole(item.id); setNotice(''); }} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${role === item.id ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white'}`}>
            <span className="text-2xl" aria-hidden="true">{item.icon}</span><span className="mt-2 block font-bold">{item.label} view</span><span className="mt-1 block text-sm text-slate-600">{item.description}</span>
          </button>)}
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <span><strong>Demo workspace</strong> · Changes are temporary and reset when the page reloads.</span><span className="rounded-full bg-white px-3 py-1 font-medium">Fictional sample records</span>
        </div>
        {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">{notice}</p>}

        {role === 'student' && <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-slate-500">Good morning,</p><h2 className="text-2xl font-bold">Aarav Sharma <span className="text-base font-medium text-slate-500">· Class 10A</span></h2></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">On track</span></div>
          <div className="grid gap-4 sm:grid-cols-3"><Metric label="Overall average" value={`${average}%`} note="↑ 8 points this term"/><Metric label="Assessments" value={`${demoLearner.scores.length}`} note="Across 4 subjects"/><Metric label="Class rank" value="#4" note="Out of 28 students"/></div>
          <div className="grid gap-5 lg:grid-cols-2"><Card><h3 className="font-bold">Learning progress</h3><p className="mt-1 text-sm text-slate-500">Recent mathematics assessments</p><div className="mt-6 flex h-44 items-end gap-4 border-b border-l border-slate-200 px-3">{demoLearner.scores.map((score, i) => <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-semibold text-slate-600">{score}%</span><div className="w-full max-w-14 rounded-t-lg bg-blue-600" style={{ height: `${score}%` }} /><span className="mb-2 text-xs text-slate-500">Test {i + 1}</span></div>)}</div><p className="mt-4 text-sm text-slate-600">Steady progress: keep practicing multi-step problems to build on this momentum.</p></Card>
            <Card><div className="flex items-center justify-between"><div><h3 className="font-bold">Class 10A chat</h3><p className="text-sm text-slate-500">A friendly place to learn together</p></div><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">● Live demo</span></div><div className="mt-4 max-h-56 space-y-3 overflow-y-auto">{messages.map((message, i) => <article key={i} className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold text-blue-800">{message.author} <span className="font-normal text-slate-400">· {message.time}</span></p><p className="mt-1 text-sm">{message.text}</p></article>)}</div><form onSubmit={sendChat} className="mt-4 flex gap-2"><label htmlFor="demo-chat" className="sr-only">Write a message</label><input id="demo-chat" value={chatText} onChange={e => setChatText(e.target.value)} maxLength={300} placeholder="Write a message…" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"/><button className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Send</button></form></Card></div>
        </div>}

        {role === 'teacher' && <div className="space-y-5"><div><p className="text-sm text-slate-500">Teacher workspace</p><h2 className="text-2xl font-bold">Classroom overview</h2></div><div className="grid gap-4 sm:grid-cols-3"><Metric label="My learners" value={`${learners.length}`} note="Across sample classes"/><Metric label="Classes" value="2" note="10A and 10B"/><Metric label="Class average" value="79%" note="↑ 5% this term"/></div><div className="grid gap-5 lg:grid-cols-2"><Card><h3 className="font-bold">Enroll a learner</h3><p className="mt-1 text-sm text-slate-500">Try the workflow with a fictional record.</p><form onSubmit={enroll} className="mt-4 space-y-3"><label className="block text-sm font-medium">Student name<input name="name" required minLength={2} placeholder="e.g. Sam Lee" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"/></label><label className="block text-sm font-medium">Class<input name="className" required placeholder="10A" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"/></label><button className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white">Add to demo roster</button></form></Card><Card><h3 className="font-bold">Record an assessment</h3><p className="mt-1 text-sm text-slate-500">Scores update the student progress preview.</p><form onSubmit={addAssessment} className="mt-4 space-y-3"><label className="block text-sm font-medium">Student<select name="learnerId" required className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2">{learners.map(learner => <option key={learner.id} value={learner.id}>{learner.name} · {learner.id}</option>)}</select></label><label className="block text-sm font-medium">Score out of 100<input name="score" type="number" min="0" max="100" required placeholder="85" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"/></label><button className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white">Save sample score</button></form></Card></div><Card><h3 className="font-bold">Class roster</h3><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[500px] text-left text-sm"><thead className="border-b text-slate-500"><tr><th className="pb-3">Learner</th><th className="pb-3">Class</th><th className="pb-3">Demo ID</th><th className="pb-3">Latest score</th></tr></thead><tbody>{learners.map(learner => <tr key={learner.id} className="border-b last:border-0"><td className="py-3 font-medium">{learner.name}</td><td>{learner.className}</td><td className="font-mono text-xs">{learner.id}</td><td>{learner.scores.at(-1) ?? '—'}{learner.scores.length ? '%' : ''}</td></tr>)}</tbody></table></div></Card></div>}

        {role === 'parent' && <div className="space-y-5"><div><p className="text-sm text-slate-500">Family portal</p><h2 className="text-2xl font-bold">Your learner is growing every day.</h2></div><div className="grid gap-5 lg:grid-cols-[1fr_2fr]"><Card><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl">👧</div><h3 className="mt-4 text-xl font-bold">Maya Patel</h3><p className="mt-1 text-sm text-slate-500">Class 10A · Demo learner</p><p className="mt-4 text-sm"><span className="font-medium">Class teacher</span><br/>Ms. Rivera</p><button onClick={() => window.print()} className="mt-5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white print:hidden">Print progress summary</button></Card><Card><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">Academic progress</h3><p className="mt-1 text-sm text-slate-500">Mathematics · Term 1</p></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">Doing well</span></div><div className="mt-6 space-y-4">{[82,79,88,92].map((score,i)=><div key={i}><div className="mb-1 flex justify-between text-sm"><span>Assessment {i+1}</span><strong>{score}%</strong></div><div className="h-2.5 rounded-full bg-slate-100"><div className="h-2.5 rounded-full bg-blue-600" style={{width:`${score}%`}}/></div></div>)}</div><div className="mt-6 rounded-xl bg-indigo-50 p-4"><h4 className="font-semibold text-indigo-950">A note for families</h4><p className="mt-1 text-sm leading-relaxed text-indigo-900">Maya is showing consistent progress and strong effort. A short daily review will help maintain this momentum.</p></div></Card></div></div>}

        {role === 'admin' && <div className="space-y-5"><div><p className="text-sm text-slate-500">School administration</p><h2 className="text-2xl font-bold">Nexus Demo School</h2><p className="mt-1 text-sm text-slate-500">A quick view of a fictional school workspace.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Learners" value={`${learners.length}`} note="Sample school roster"/><Metric label="Teachers" value="8" note="6 active today"/><Metric label="Classes" value="12" note="Across 3 grade levels"/><Metric label="Attendance" value="96%" note="↑ 2% this week"/></div><div className="grid gap-5 lg:grid-cols-2"><Card><div className="flex items-center justify-between"><h3 className="font-bold">Teaching team</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">Sample data</span></div><div className="mt-4 divide-y">{[['MR','Ms. Elena Rivera','Mathematics · 10A'],['DK','Mr. Daniel Kim','Science · 10A, 10B'],['AP','Ms. Anika Patel','English · 9A, 10A']].map(([initials,name,details])=><div key={initials} className="flex items-center gap-3 py-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">{initials}</div><div><p className="font-semibold">{name}</p><p className="text-sm text-slate-500">{details}</p></div><span className="ml-auto rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">Active</span></div>)}</div></Card><Card><h3 className="font-bold">School snapshot</h3><p className="mt-1 text-sm text-slate-500">Engagement by grade this week</p><div className="mt-6 space-y-5">{[['Grade 8',74],['Grade 9',86],['Grade 10',92]].map(([grade,value])=><div key={grade}><div className="mb-1 flex justify-between text-sm"><span>{grade}</span><strong>{value}%</strong></div><div className="h-2.5 rounded-full bg-slate-100"><div className="h-2.5 rounded-full bg-violet-600" style={{width:`${value}%`}}/></div></div>)}</div><div className="mt-7 rounded-xl bg-blue-50 p-4"><p className="text-sm font-semibold text-blue-950">Everything looks on track</p><p className="mt-1 text-sm text-blue-900">Attendance and learner engagement are above the school target this week.</p></div></Card></div></div>}

        <footer className="border-t border-slate-200 pt-5 text-center text-sm text-slate-500">Nexus-Ed preview · Fictional sample data · <Link className="font-medium text-blue-700 underline" href="/">Back to home</Link></footer>
      </div>
    </main>
  );
}
