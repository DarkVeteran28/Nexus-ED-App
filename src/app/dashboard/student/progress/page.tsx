'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { analyzeProgress } from '@/lib/school-engine';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function StudentProgress() {
  const [data, setData] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProgressData = async () => {
      // 1. Get the current logged-in student's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 2. Fetch marks from assessments table
        const { data: scores, error } = await supabase
          .from('assessments')
          .select('score, timestamp, subject')
          .order('timestamp', { ascending: true });

        if (scores) {
          // Format data for the graph
          const chartData = scores.map((s, index) => ({
            unit: `Test ${index + 1}`,
            score: s.score
          }));
          setData(chartData);

          // 3. Generate AI Insight using your school-engine logic
          const insight = analyzeProgress(chartData);
          setAiInsight(insight);
        }
      }
      setLoading(false);
    };

    getProgressData();
  }, []);

  if (loading) return <p className="p-10 text-center">AI is analyzing your progress...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">My Learning Journey</h1>

      {/* Analytics Graph */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="unit" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#2563eb" 
              strokeWidth={4} 
              dot={{ r: 6, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI AI_Explainer Box */}
      <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            🤖 AI Progress Insight
          </h3>
          <p className="text-blue-50 opacity-90 leading-relaxed">
            {aiInsight}
          </p>
        </div>
        {/* Decorative background element */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500 rounded-full opacity-20" />
      </div>
    </div>
  );
}