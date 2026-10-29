'use client';

import { FormEvent, useState } from 'react';

export default function IdentityVerification() {
  const [message, setMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('Registration verification is not configured for this deployment. Ask your school administrator to activate your account.');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-slate-900">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <h1 className="mb-2 text-center text-xl font-bold text-slate-900">Verify Your Identity</h1>
        <p className="mb-6 text-center text-sm text-slate-600">Enter the details provided by your school to activate your account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="registration-code" className="mb-1 block text-sm font-medium text-slate-700">Institute Registration Code</label>
            <input
              id="registration-code"
              name="registrationCode"
              type="text"
              autoComplete="off"
              required
              placeholder="e.g. NEXUS-DEL-001"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label htmlFor="registration-roll-number" className="mb-1 block text-sm font-medium text-slate-700">Roll Number</label>
            <input
              id="registration-roll-number"
              name="rollNumber"
              type="text"
              inputMode="numeric"
              pattern="[0-9]+"
              autoComplete="off"
              required
              placeholder="Enter your school roll number"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          {message && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
          <button type="submit" className="w-full rounded-lg bg-slate-900 py-3 font-bold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">
            Verify &amp; Generate ID
          </button>
        </form>
      </section>
    </main>
  );
}
