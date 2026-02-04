'use client';
export default function IdentityVerification() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold text-center mb-2">Verify Your Identity</h2>
        <p className="text-sm text-slate-500 text-center mb-6">Enter your details provided by the school to activate your account.</p>
        
        <form className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Institute Registration Code</label>
            <input type="text" placeholder="e.g. NEXUS-DEL-001" className="w-full p-3 mt-1 border rounded-lg bg-slate-50" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Roll Number</label>
            <input type="text" className="w-full p-3 mt-1 border rounded-lg" />
          </div>
          <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition">
            Verify & Generate ID
          </button>
        </form>
      </div>
    </div>
  );
}