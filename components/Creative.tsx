
import React, { useState, useEffect, useCallback } from 'react';
import { PenTool, MessageSquare, BookOpen, Flame, Plus, X, Trash2 } from 'lucide-react';
import { WritingEntry } from '../types';
import {
  loadData,
  addWritingEntry,
  getWritingEntries,
  deleteWritingEntry,
  getTodayString,
} from '../services/storageService';

const PROJECT_OPTIONS: { value: WritingEntry['project']; label: string }[] = [
  { value: 'xavier-transport', label: 'Xavier Transport' },
  { value: 'which-direction-home', label: 'Which Direction Home' },
  { value: 'schafer-cookbook', label: 'Schafer Cookbook' },
];

const PROJECT_META: Record<WritingEntry['project'], { type: string; goal: string; color: string; icon: 'book' | 'message' | 'pen' }> = {
  'xavier-transport': { type: 'SF Thriller', goal: '300 words daily / 2500 weekly', color: 'blue', icon: 'book' },
  'which-direction-home': { type: 'Dramatic Play', goal: '2 focused sessions / week', color: 'indigo', icon: 'message' },
  'schafer-cookbook': { type: 'Family History', goal: '1 recipe fully documented', color: 'emerald', icon: 'pen' },
};

function getLast28Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const Creative: React.FC = () => {
  const [entries, setEntries] = useState<WritingEntry[]>([]);
  const [streakDays, setStreakDays] = useState(0);
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [formProject, setFormProject] = useState<WritingEntry['project']>('xavier-transport');
  const [formWordCount, setFormWordCount] = useState('');
  const [formMinutes, setFormMinutes] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formDate, setFormDate] = useState(getTodayString());

  const refreshData = useCallback(() => {
    const data = loadData();
    setEntries(data.creative.writingEntries);
    setStreakDays(data.creative.streakDays);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wordCount = parseInt(formWordCount, 10);
    const sessionMinutes = parseInt(formMinutes, 10);
    if (!wordCount || !sessionMinutes) return;

    addWritingEntry({
      date: formDate,
      project: formProject,
      wordCount,
      sessionMinutes,
      notes: formNotes,
    });

    // Reset form
    setFormWordCount('');
    setFormMinutes('');
    setFormNotes('');
    setFormDate(getTodayString());
    setFormProject('xavier-transport');
    setShowForm(false);
    refreshData();
  };

  const handleDelete = (id: string) => {
    deleteWritingEntry(id);
    refreshData();
  };

  // Compute per-project stats
  const projectStats = (project: WritingEntry['project']) => {
    const filtered = entries.filter(e => e.project === project);
    const totalWords = filtered.reduce((sum, e) => sum + e.wordCount, 0);
    const totalSessions = filtered.length;
    return { totalWords, totalSessions };
  };

  // Streak grid data
  const last28 = getLast28Days();
  const entryDatesSet = new Set(entries.map(e => e.date));

  // Recent entries (most recent 5)
  const recentEntries = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .slice(0, 5);

  const projectLabel = (key: WritingEntry['project']) =>
    PROJECT_OPTIONS.find(p => p.value === key)?.label ?? key;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold">Creative Work</h2>
          <p className="text-slate-400 italic">"Finish what you start."</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-orange-500/10 text-orange-400 px-4 py-2 rounded-full border border-orange-500/30 flex items-center space-x-2">
            <Flame size={18} />
            <span className="font-bold">{streakDays} Day Writing Streak</span>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 transition-colors font-bold text-sm"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            <span>{showForm ? 'Cancel' : 'Log Session'}</span>
          </button>
        </div>
      </header>

      {/* Log Writing Session Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4"
        >
          <h3 className="text-lg font-bold text-slate-100">Log Writing Session</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">Project</label>
              <select
                value={formProject}
                onChange={e => setFormProject(e.target.value as WritingEntry['project'])}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
              >
                {PROJECT_OPTIONS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">Date</label>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">Word Count</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 500"
                value={formWordCount}
                onChange={e => setFormWordCount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 45"
                value={formMinutes}
                onChange={e => setFormMinutes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">Notes</label>
            <input
              type="text"
              placeholder="What did you work on?"
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors"
            >
              Save Entry
            </button>
          </div>
        </form>
      )}

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PROJECT_OPTIONS.map((p) => {
          const meta = PROJECT_META[p.value];
          const stats = projectStats(p.value);
          const IconComponent = meta.icon === 'book' ? BookOpen : meta.icon === 'message' ? MessageSquare : PenTool;
          return (
            <div key={p.value} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl group hover:border-slate-700 transition-all">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-${meta.color}-500/20 text-${meta.color}-400`}>
                <IconComponent />
              </div>
              <h3 className="text-xl font-bold text-slate-100">{p.label}</h3>
              <p className="text-sm text-slate-500 mb-4">{meta.type}</p>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">System</label>
                  <p className="text-sm text-slate-300">{meta.goal}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Words</label>
                  <p className="text-sm text-slate-300">{stats.totalWords.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sessions</label>
                  <p className="text-sm text-slate-300">{stats.totalSessions}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Writing Streak Tracker */}
      <div className="bg-slate-800/40 p-8 rounded-2xl border border-slate-700/50">
        <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
          <span>Writing Streak Tracker</span>
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {last28.map((day, i) => {
            const hasEntry = entryDatesSet.has(day);
            const dayNum = new Date(day + 'T00:00:00').getDate();
            return (
              <div
                key={day}
                title={day}
                className={`h-10 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                  hasEntry
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-slate-800 text-slate-600 border border-slate-700'
                }`}
              >
                {dayNum}
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-slate-500 text-center uppercase tracking-widest font-bold">Never miss twice rule enabled.</p>
      </div>

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <div className="bg-slate-800/40 p-8 rounded-2xl border border-slate-700/50">
          <h3 className="text-lg font-bold mb-4">Recent Entries</h3>
          <div className="space-y-3">
            {recentEntries.map(entry => (
              <div
                key={entry.id}
                className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-3"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-slate-500 w-20">{formatDateShort(entry.date)}</span>
                  <span className="text-sm font-semibold text-slate-300">{projectLabel(entry.project)}</span>
                  <span className="text-sm text-orange-400 font-bold">{entry.wordCount.toLocaleString()} words</span>
                  {entry.notes && (
                    <span className="text-xs text-slate-500 truncate max-w-[200px]">{entry.notes}</span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-slate-600 hover:text-red-400 transition-colors p-1"
                  title="Delete entry"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Creative;
