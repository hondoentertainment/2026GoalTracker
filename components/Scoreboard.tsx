
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { CheckCircle2, Circle } from 'lucide-react';

const mockWeeklyData = [
  { week: 1, writing: 7, tech: 10, books: 2, media: 4 },
  { week: 2, writing: 6, tech: 15, books: 4, media: 8 },
  { week: 3, writing: 7, tech: 25, books: 6, media: 11 },
  { week: 4, writing: 5, tech: 30, books: 8, media: 15 },
  { week: 5, writing: 7, tech: 45, books: 10, media: 19 },
];

const Scoreboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold">The Scoreboard</h2>
        <p className="text-slate-400">Week 5 of 52 — Tracking the non-negotiables.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-semibold uppercase mb-4">Writing Consistency</h3>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-bold text-blue-400">7/7</span>
            <span className="text-slate-500 pb-1">days</span>
          </div>
          <p className="text-xs text-green-400 mt-2 font-medium">🔥 On track: Xavier Transport Act I</p>
        </div>
        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-semibold uppercase mb-4">Shipping Progress</h3>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-bold text-indigo-400">45%</span>
            <span className="text-slate-500 pb-1">complete</span>
          </div>
          <p className="text-xs text-blue-400 mt-2 font-medium">🚀 Deep Seats v1: Scope Locked</p>
        </div>
        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-semibold uppercase mb-4">Media Log</h3>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-bold text-emerald-400">19</span>
            <span className="text-slate-500 pb-1">items</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">10 Books, 4 Films, 5 Albums</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Execution Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockWeeklyData}>
                <defs>
                  <linearGradient id="colorWriting" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="week" stroke="#64748b" tickFormatter={(v) => `W${v}`} />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area type="monotone" dataKey="writing" stroke="#60a5fa" fillOpacity={1} fill="url(#colorWriting)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Tech Milestone Progress</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockWeeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="week" stroke="#64748b" tickFormatter={(v) => `W${v}`} />
                <YAxis stroke="#64748b" />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }}
                />
                <Bar dataKey="tech" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h3 className="text-lg font-semibold mb-4">Weekly Non-Negotiables</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
           {[
             "Finish 2 books (1 fiction / 1 non-fiction)",
             "2 Ebert Films + short reflections",
             "2 Rolling Stone Albums logged",
             "1 recipe documented for Schafer Cookbook",
             "Daily weigh-in + 8k steps average",
             "Lift 3x sessions complete",
             "Ship Deep Seats data ingestion logic",
             "Xavier Transport: 2,500 words added"
           ].map((item, i) => (
             <div key={i} className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
               <CheckCircle2 size={18} className="text-blue-400 shrink-0" />
               <span className="text-sm text-slate-300">{item}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
