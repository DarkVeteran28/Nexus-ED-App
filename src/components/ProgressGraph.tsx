'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
  { unit: 'UT 1', score: 75 },
  { unit: 'UT 2', score: 82 },
  { unit: 'Term 1', score: 78 },
  { unit: 'UT 3', score: 90 },
];

export default function ProgressGraph() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-bold text-lg mb-4">Academic Progress (AI Analysis)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="unit" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
        <p className="text-sm text-blue-900 font-medium">🤖 AI Insight:</p>
        <p className="text-xs text-blue-700">Performance is improving. High mastery in "Unit 3" concepts. Focus on "Term 1" weak areas to maintain the upward trend.</p>
      </div>
    </div>
  );
}