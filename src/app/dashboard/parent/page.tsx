'use client';
import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { analyzeProgress } from '@/lib/school-engine';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
export const dynamic = 'force-dynamic';

type Student = { full_name: string; unique_id: string; class_id: string };
type Mark = { unit: string; score: number };

export default function ParentDashboard() {

const downloadReportCard = () => {
  if (!childData) return;
  const doc = new jsPDF();

  // 1. Header & Branding
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235); // Nexus Blue
  doc.text('NEXUS ED: ACADEMIC REPORT', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  // 2. Student Info Section
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Student Name: ${childData.full_name}`, 14, 45);
  doc.text(`Unique ID: ${childData.unique_id}`, 14, 52);
  doc.text(`Class: ${childData.class_id}`, 14, 59);

  // 3. Marks Table
  autoTable(doc, {
    startY: 70,
    head: [['Assessment Unit', 'Score / 100']],
    body: marks.map(m => [m.unit, m.score]),
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] }
  });

  // 4. AI Insights Section
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('🤖 AI Academic Analysis', 14, finalY);
  
  doc.setFontSize(11);
  doc.setTextColor(60);
  // Split text so it doesn't run off the page
  const splitInsight = doc.splitTextToSize(analyzeProgress(marks), 180);
  doc.text(splitInsight, 14, finalY + 10);

  // 5. Save the File
  doc.save(`${childData.full_name}_Report_Card.pdf`);
};

  const [childId, setChildId] = useState('');
  const [childRoll, setChildRoll] = useState('');
  const [childData, setChildData] = useState<Student | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchChildProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data: student, error: studentError } = await getSupabaseBrowserClient()
        .from('students')
        .select('full_name, unique_id, class_id')
        .eq('unique_id', childId.trim())
        .eq('roll_number', parseInt(childRoll, 10))
        .single();

      if (studentError) throw studentError;
      setChildData(student);
      const { data: scores, error: scoresError } = await getSupabaseBrowserClient()
        .from('assessments')
        .select('score, timestamp')
        .eq('student_id', childId.trim())
        .order('timestamp', { ascending: true });
      if (scoresError) throw scoresError;
      setMarks(scores?.map((score, index) => ({ unit: `Test ${index + 1}`, score: score.score })) ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Child profile could not be found. Check the ID and roll number.');
      setChildData(null);
      setMarks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900">Parent Portal</h1>
        <p className="text-slate-500">Monitor your child&apos;s academic growth and progress.</p>
      </header>

      {!childData ? (
        <form onSubmit={fetchChildProgress} className="bg-white p-8 rounded-2xl shadow-sm border space-y-4 max-w-md">
          <h2 className="font-bold text-lg">Connect to Student Profile</h2>
          <input 
            placeholder="Child's Unique ID" 
            className="w-full p-3 border rounded-xl"
            onChange={(e) => setChildId(e.target.value)}
            required
          />
          <input 
            placeholder="Roll Number" 
            type="number"
            className="w-full p-3 border rounded-xl"
            onChange={(e) => setChildRoll(e.target.value)}
            required
          />
          <button className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition">
            {loading ? "Verifying..." : "View Progress"}
          </button>
          {message && <p role="alert" className="text-sm text-red-700">{message}</p>}
        </form>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Child Info Card */}
          <div className="md:col-span-1 bg-white p-6 rounded-2xl border shadow-sm">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mb-4">
              {childData.full_name[0]}
            </div>
            <h2 className="text-xl font-bold">{childData.full_name}</h2>
            <p className="text-sm text-slate-500">Class: {childData.class_id}</p>
            <p className="text-xs text-slate-400 mt-1">ID: {childData.unique_id}</p>
          </div>

          {/* Progress Chart */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border shadow-sm h-64">
             <h3 className="font-bold mb-4 text-slate-700">Performance Trend</h3>
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marks}>
                  <XAxis dataKey="unit" hide />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} />
                </LineChart>
             </ResponsiveContainer>
          </div>
          <button onClick={downloadReportCard}
            className="mb-4 flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition shadow-sm font-semibold"
            >
            📥 Download Official AI Report
            </button>

          {/* AI Guidance Box */}
          <div className="md:col-span-3 bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-2xl">
            <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-2">
              🤖 AI Recommendation for Parents
            </h3>
            <p className="text-indigo-800">
              {analyzeProgress(marks)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
