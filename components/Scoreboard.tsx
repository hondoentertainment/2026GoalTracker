
import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { CheckCircle2, Circle, Download, Plus, Trash2, Pencil, X } from 'lucide-react';
import {
  getCurrentWeekNumber,
  getWeekWritingDays,
  getWeekWordCount,
  getTotalMediaCount,
  loadData,
  getWeeklyChecklist,
  toggleChecklistItem,
  addCustomChecklistItem,
  deleteChecklistItem,
  updateChecklistItemLabel,
  getTechLogEntries,
  getWeekDates,
  getMonthlyRollup,
  getQuarterlyRollup,
  exportDataAsJSON,
  exportDataAsCSV,
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
  const [rollupView, setRollupView] = useState<'monthly' | 'quarterly'>('monthly');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');

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

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    addCustomChecklistItem(weekNumber, newChecklistItem.trim());
    setNewChecklistItem('');
    refreshData();
  };

  const handleDeleteChecklistItem = (id: string) => {
    deleteChecklistItem(id);
    refreshData();
  };

  const handleStartEdit = (item: WeeklyChecklistItem) => {
    setEditingItemId(item.id);
    setEditingLabel(item.label);
  };

  const handleSaveEdit = () => {
    if (editingItemId && editingLabel.trim()) {
      updateChecklistItemLabel(editingItemId, editingLabel.trim());
      setEditingItemId(null);
      setEditingLabel('');
      refreshData();
    }
  };

  const handleExport = (format: 'json' | 'csv') => {
    const content = format === 'json' ? exportDataAsJSON() : exportDataAsCSV();
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2026-blueprint-backup-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalMedia = mediaCounts.books + mediaCounts.films + mediaCounts.albums;
  const monthlyData = getMonthlyRollup();
  const quarterlyData = getQuarterlyRollup();

  const phaseLabels: Record<number, string> = {
    1: 'Discovery',
    2: 'Scope Locked',
    3: 'Build Sprint',
    4: 'Launch Prep',
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold">The Scoreboard</h2>
          <p className="text-slate-400">Week {weekNumber} of 52 — Tracking the non-negotiables.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('json')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            title="Export as JSON"
          >
            <Download size={14} />
            JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            title="Export as CSV"
          >
            <Download size={14} />
            CSV
          </button>
        </div>
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

      {/* Monthly / Quarterly Rollup */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Performance Rollup</h3>
          <div className="flex bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setRollupView('monthly')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                rollupView === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setRollupView('quarterly')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                rollupView === 'quarterly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Quarterly
            </button>
          </div>
        </div>

        {rollupView === 'monthly' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs uppercase border-b border-slate-800">
                  <th className="text-left py-2 px-2">Month</th>
                  <th className="text-right py-2 px-2">Sessions</th>
                  <th className="text-right py-2 px-2">Words</th>
                  <th className="text-right py-2 px-2">Tech Hrs</th>
                  <th className="text-right py-2 px-2">Media</th>
                  <th className="text-right py-2 px-2">Avg Steps</th>
                  <th className="text-right py-2 px-2">Lifts</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map(m => (
                  <tr key={m.month} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="py-2 px-2 font-medium text-slate-300">{m.monthName}</td>
                    <td className="py-2 px-2 text-right text-slate-400">{m.writingSessions}</td>
                    <td className="py-2 px-2 text-right text-blue-400">{m.totalWords.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-indigo-400">{m.techHours}</td>
                    <td className="py-2 px-2 text-right text-emerald-400">{m.mediaCompleted}</td>
                    <td className="py-2 px-2 text-right text-slate-400">{m.avgSteps > 0 ? m.avgSteps.toLocaleString() : '—'}</td>
                    <td className="py-2 px-2 text-right text-slate-400">{m.liftSessions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {quarterlyData.map(q => (
              <div key={q.quarter} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Q{q.quarter}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Words</span>
                    <span className="text-blue-400 font-medium">{q.totalWords.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Tech Hours</span>
                    <span className="text-indigo-400 font-medium">{q.techHours}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Media</span>
                    <span className="text-emerald-400 font-medium">{q.mediaCompleted}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Avg Steps</span>
                    <span className="text-slate-300 font-medium">{q.avgSteps > 0 ? q.avgSteps.toLocaleString() : '—'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Non-Negotiables (Configurable) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h3 className="text-lg font-semibold mb-4">Weekly Non-Negotiables</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
           {checklist.map((item) => (
             <div
               key={item.id}
               className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors group"
             >
               {editingItemId === item.id ? (
                 <div className="flex items-center gap-2 flex-1">
                   <input
                     type="text"
                     value={editingLabel}
                     onChange={(e) => setEditingLabel(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                     className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                     autoFocus
                   />
                   <button onClick={handleSaveEdit} className="text-green-400 hover:text-green-300 p-1">
                     <CheckCircle2 size={16} />
                   </button>
                   <button onClick={() => setEditingItemId(null)} className="text-slate-500 hover:text-slate-300 p-1">
                     <X size={16} />
                   </button>
                 </div>
               ) : (
                 <>
                   <button onClick={() => handleToggleChecklist(item.id)} className="flex items-center space-x-3 flex-1 select-none cursor-pointer">
                     {item.completed ? (
                       <CheckCircle2 size={18} className="text-blue-400 shrink-0" />
                     ) : (
                       <Circle size={18} className="text-slate-600 shrink-0" />
                     )}
                     <span className={`text-sm ${item.completed ? 'text-slate-300 line-through' : 'text-slate-300'}`}>
                       {item.label}
                     </span>
                   </button>
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                       onClick={() => handleStartEdit(item)}
                       className="text-slate-600 hover:text-blue-400 p-1 transition-colors"
                       title="Edit item"
                     >
                       <Pencil size={12} />
                     </button>
                     <button
                       onClick={() => handleDeleteChecklistItem(item.id)}
                       className="text-slate-600 hover:text-red-400 p-1 transition-colors"
                       title="Delete item"
                     >
                       <Trash2 size={12} />
                     </button>
                   </div>
                 </>
               )}
             </div>
           ))}
        </div>
        {/* Add custom item */}
        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={newChecklistItem}
            onChange={(e) => setNewChecklistItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
            placeholder="Add a custom checklist item..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
          />
          <button
            onClick={handleAddChecklistItem}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
