'use client';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-blue-600 tracking-tighter">NEXUS ED</div>
        <Link href="/login" className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition">
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          AI-Powered <span className="text-blue-600">Syllabus Grounding</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mb-10">
          The all-in-one school ecosystem for students, parents, and teachers. 
          Driven by realistic AI analytics and classroom-first privacy.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {[
            { role: 'Student', desc: 'Class-only chat & AI progress tracking.', color: 'bg-blue-50' },
            { role: 'Teacher', desc: 'Generate Unique IDs & upload unit marks.', color: 'bg-indigo-50' },
            { role: 'Parent', desc: 'Monitor growth & download AI report cards.', color: 'bg-slate-50' }
          ].map((item) => (
            <div key={item.role} className={`${item.color} p-8 rounded-2xl border border-transparent hover:border-blue-200 transition text-left`}>
              <h3 className="text-xl font-bold mb-2">{item.role}</h3>
              <p className="text-sm text-slate-600 mb-6">{item.desc}</p>
              <Link href="/login" className="text-blue-600 font-semibold text-sm hover:underline italic">
                Enter {item.role} Portal →
              </Link>
            </div>
          ))}
        </div>
      </main>

      {/* Trust Banner */}
      <footer className="mt-20 border-t border-slate-100 py-10 text-center text-slate-400 text-xs">
        &copy; 2026 Nexus Ed Platform. Securely deployed via Vercel.
      </footer>
    </div>
  );
}