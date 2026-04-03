
import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { CheckCircle2, Circle } from 'lucide-react';
import {
  getCurrentWeekNumber,
  getWeekWritingDays,
  getWeekWordCount,
  getTotalMediaCount,
  loadData,
  getWeeklyChecklist,
  toggleChecklistItem,
  getTechLogEntries,
  getWeekDates,
} from '../services/storageService';
import { WeeklyChecklistItem } from '../types';

interface WeeklyChartPoint {
  week: number;
  writing: number;
  words: number;
  tech: number;
  media: number;
}

const Scoreboard: React.FC = () => {
  const [weekNumber, setWeekNumber] = useState(1);
  const [writingDays, setWritingDays] = useState(0);
  const [deepSeatsProgress, setDeepSeatsProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [mediaCounts, setMediaCounts] = useState({ books: 0, films: 0, albums: 0 });
  const [chartData, setChartData] = useState<WeeklyChartPoint[]>([]);
  const [checklist, setChecklist] = useState<WeeklyChecklistItem[]>([]);

  const refreshData = useCallback(() => {
    const week = getCurrentWeekNumber();
    setWeekNumber(week);
    setWritingDays(getWeekWritingDays(week));

    const data = loadData();
    setDeepSeatsProgress(data.tech.deepSeatsProgress);
    setCurrentPhase(data.tech.currentPhase);

    setMediaCounts(getTotalMediaCount());

    // Build chart data from weeks 1 through current week
    const points: WeeklyChartPoint[] = [];
    const year = new Date().getFullYear();
    for (let w = 1; w <= week; w++) {
      const weekDatesSet = new Set(getWeekDates(year, w));
      const techEntriesThisWeek = data.tech.logEntries.filter(e => weekDatesSet.has(e.date));
      const techHours = techEntriesThisWeek.reduce((sum, e) => sum + e.hoursSpent, 0);

      points.push({
        week: w,
        writing: getWeekWritingDays(w),
        words: getWeekWordCount(w),
        tech: Math.round(techHours),
        media: (() => {
          const mediaThisWeek = data.media.entries.filter(e => e.completed && weekDatesSet.has(e.date));
          return mediaThisWeek.length;
        })(),
      });
    }
    setChartData(points);

    setChecklist(getWeeklyChecklist(week));
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleToggleChecklist = (id: string) => {
    toggleChecklistItem(id);
    refreshData();
  };

  const totalMedia = mediaCounts.books + mediaCounts.films + mediaCounts.albums;

  const phaseLabels: Record<number, string> = {
    1: 'Discovery',
    2: 'Scope Locked',
    3: 'Build Sprint',
    4: 'Launch Prep',
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold">The Scoreboard</h2>
        <p className="text-slate-400">Week {weekNumber} of 52 — Tracking the non-negotiables.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-semibold uppercase mb-4">Writing Consistency</h3>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-bold text-blue-400">{writingDays}/7</span>
            <span className="text-slate-500 pb-1">days</span>
          </div>
          <p className={`text-xs mt-2 font-medium ${writingDays >= 5 ? 'text-green-400' : writingDays >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
            {writingDays >= 5 ? 'On track: Xavier Transport Act I' : writingDays >= 3 ? 'Decent week — push for more' : 'Behind pace — time to lock in'}
          </p>
        </div>
        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-semibold uppercase mb-4">Shipping Progress</h3>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-bold text-indigo-400">{deepSeatsProgress}%</span>
            <span className="text-slate-500 pb-1">complete</span>
          </div>
          <p className="text-xs text-blue-400 mt-2 font-medium">
            Deep Seats v1: Phase {currentPhase} — {phaseLabels[currentPhase] || 'In Progress'}
          </p>
        </div>
        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-semibold uppercase mb-4">Media Log</h3>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-bold text-emerald-400">{totalMedia}</span>
            <span className="text-slate-500 pb-1">items</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            {mediaCounts.books} Books, {mediaCounts.films} Films, {mediaCounts.albums} Albums
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Execution Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
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
                <Area type="monotone" dataKey="writing" stroke="#60a5fa" fillOpacity={1} fill="url(#colorWriting)" name="Writing Days" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Tech Milestone Progress</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="week" stroke="#64748b" tickFormatter={(v) => `W${v}`} />
                <YAxis stroke="#64748b" />
                <Tooltip
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }}
                />
                <Bar dataKey="tech" fill="#818cf8" radius={[4, 4, 0, 0]} name="Tech Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h3 className="text-lg font-semibold mb-4">Weekly Non-Negotiables</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
           {checklist.map((item) => (
             <div
               key={item.id}
               onClick={() => handleToggleChecklist(item.id)}
               className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer select-none"
             >
               {item.completed ? (
                 <CheckCircle2 size={18} className="text-blue-400 shrink-0" />
               ) : (
                 <Circle size={18} className="text-slate-600 shrink-0" />
               )}
               <span className={`text-sm ${item.completed ? 'text-slate-300 line-through' : 'text-slate-300'}`}>
                 {item.label}
               </span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
