import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

const data = [
  { day: 'Mon', cards: 45, correct: 80 },
  { day: 'Tue', cards: 52, correct: 85 },
  { day: 'Wed', cards: 38, correct: 75 },
  { day: 'Thu', cards: 65, correct: 90 },
  { day: 'Fri', cards: 48, correct: 82 },
  { day: 'Sat', cards: 20, correct: 88 },
  { day: 'Sun', cards: 15, correct: 95 },
];

const topicData = [
  { name: 'Funds', score: 65 },
  { name: 'MedSurg', score: 45 },
  { name: 'Pedia', score: 80 },
  { name: 'Psych', score: 70 },
  { name: 'OB', score: 30 },
];

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Performance Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention Chart */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="font-semibold mb-6">Review Activity (Last 7 Days)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-color)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Line type="monotone" dataKey="cards" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Mastery */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="font-semibold mb-6">Weak Areas Identified</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                 <XAxis type="number" stroke="var(--text-muted)" hide />
                 <YAxis dataKey="name" type="category" stroke="var(--text-muted)" width={60} tickLine={false} axisLine={false} />
                 <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-color)', borderRadius: '12px' }}/>
                 <Bar dataKey="score" fill="var(--accent)" radius={[0, 4, 4, 0]} barSize={20} background={{ fill: 'rgba(255,255,255,0.05)' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-red-500/10 rounded-xl border border-red-500/20 text-sm">
            <span className="font-bold text-red-500 block mb-1">Recommended Action:</span>
            Your OB mastery is low (30%). Consider creating a focused "OB Drill" deck or taking a 20-question OB practice test.
          </div>
        </div>
      </div>
      
      {/* Heatmap Placeholder (Visual only for now) */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="font-semibold mb-4">Study Consistency</h3>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 52 }).map((_, i) => (
             <div key={i} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, j) => {
                   const intensity = Math.random();
                   let bg = 'bg-gray-200 dark:bg-gray-800';
                   if (intensity > 0.8) bg = 'bg-primary';
                   else if (intensity > 0.5) bg = 'bg-primary/60';
                   else if (intensity > 0.2) bg = 'bg-primary/30';
                   
                   return <div key={j} className={`w-3 h-3 rounded-sm ${bg}`}></div>
                })}
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
