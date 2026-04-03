
import React, { useState, useEffect } from 'react';
import {
  Footprints,
  Weight,
  Dumbbell,
  Pizza,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  addHealthEntry,
  getHealthEntries,
  deleteHealthEntry,
  getWeekHealthAvg,
  getCurrentWeekNumber,
  getTodayString,
} from '../services/storageService';
import { HealthEntry } from '../types';

const Health: React.FC = () => {
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState(getTodayString());
  const [formSteps, setFormSteps] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formLifting, setFormLifting] = useState(false);
  const [formFreeMeal, setFormFreeMeal] = useState(false);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  const currentWeek = getCurrentWeekNumber();

  const reload = () => {
    setEntries(getHealthEntries());
  };

  useEffect(() => {
    reload();
  }, []);

  // --- Metric data ---
  const thisWeek = getWeekHealthAvg(currentWeek);
  const lastWeek = getWeekHealthAvg(currentWeek - 1);

  // Free meals count this week (getWeekHealthAvg doesn't return it, compute manually)
  const year = new Date().getFullYear();
  // We'll compute free meal count from entries filtered by week
  // Reuse the same week-date logic as storageService
  const getWeekDatesLocal = (yr: number, weekNumber: number): Set<string> => {
    const jan1 = new Date(yr, 0, 1);
    const dayOfWeek = jan1.getDay();
    const startOffset = (weekNumber - 1) * 7 - dayOfWeek + 1;
    const dates = new Set<string>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(yr, 0, startOffset + i + 1);
      dates.add(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const thisWeekDates = getWeekDatesLocal(year, currentWeek);
  const freeMealsThisWeek = entries.filter(
    (e) => thisWeekDates.has(e.date) && e.freeMealUsed
  ).length;

  // Weight trend
  let weightTrendText = 'No data';
  let weightTrendColor = 'text-slate-500';
  let WeightTrendIcon: React.FC<{ size?: number; className?: string }> | null = null;
  if (thisWeek.avgWeight !== null && lastWeek.avgWeight !== null) {
    const diff = Math.round((thisWeek.avgWeight - lastWeek.avgWeight) * 10) / 10;
    if (diff < 0) {
      weightTrendText = `Down ${Math.abs(diff)}lb`;
      weightTrendColor = 'text-green-400';
      WeightTrendIcon = TrendingDown;
    } else if (diff > 0) {
      weightTrendText = `Up ${diff}lb`;
      weightTrendColor = 'text-red-400';
      WeightTrendIcon = TrendingUp;
    } else {
      weightTrendText = 'Stable';
      weightTrendColor = 'text-slate-400';
    }
  } else if (thisWeek.avgWeight !== null) {
    weightTrendText = `${thisWeek.avgWeight}lb`;
    weightTrendColor = 'text-slate-300';
  }

  // --- Form submit ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const steps = parseInt(formSteps, 10);
    if (isNaN(steps) || steps < 0) {
      setFormError('Steps must be a valid non-negative number.');
      return;
    }
    const weight = formWeight ? parseFloat(formWeight) : undefined;
    if (formWeight && (isNaN(weight!) || weight! <= 0)) {
      setFormError('Weight must be a valid positive number.');
      return;
    }
    setFormError('');

    addHealthEntry({
      date: formDate,
      steps,
      weight,
      liftingSession: formLifting,
      freeMealUsed: formFreeMeal,
      notes: formNotes,
    });

    // Reset form
    setFormSteps('');
    setFormWeight('');
    setFormLifting(false);
    setFormFreeMeal(false);
    setFormNotes('');
    setFormDate(getTodayString());
    setShowForm(false);
    reload();
  };

  const handleDelete = (id: string) => {
    deleteHealthEntry(id);
    reload();
  };

  // --- Recent entries (last 7) ---
  const recentEntries = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  // --- Weekly trend (last 4 weeks) ---
  const weeklyTrend = [];
  for (let w = currentWeek; w > currentWeek - 4 && w > 0; w--) {
    const avg = getWeekHealthAvg(w);
    const weekDates = getWeekDatesLocal(year, w);
    const freeMeals = entries.filter(
      (e) => weekDates.has(e.date) && e.freeMealUsed
    ).length;
    weeklyTrend.push({ week: w, ...avg, freeMeals });
  }

  // Max steps for bar sizing
  const maxSteps = Math.max(...weeklyTrend.map((w) => w.avgSteps), 1);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Health &amp; Stability</h2>
          <p className="text-slate-400 italic">
            &quot;Stability, not fluctuation.&quot;
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
        >
          <Plus size={18} />
          <span>Log Today</span>
        </button>
      </header>

      {/* Daily Log Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4"
        >
          <h3 className="text-lg font-bold mb-2">New Health Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Date</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Steps</label>
              <input
                type="number"
                placeholder="8000"
                value={formSteps}
                onChange={(e) => setFormSteps(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min={0}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Weight (lbs, optional)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="—"
                value={formWeight}
                onChange={(e) => setFormWeight(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formLifting}
                onChange={(e) => setFormLifting(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-300">Lifting session</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formFreeMeal}
                onChange={(e) => setFormFreeMeal(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-slate-300">Free meal used</span>
            </label>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Notes</label>
              <input
                type="text"
                placeholder="Optional notes..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {formError && (
            <p className="text-red-400 text-xs font-medium">{formError}</p>
          )}
          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors"
            >
              Save Entry
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Four Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Steps */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <Footprints size={20} className="text-blue-400 mb-2" />
          <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">
            Steps (Daily Avg)
          </h4>
          <p className="text-2xl font-bold">
            {thisWeek.avgSteps > 0
              ? thisWeek.avgSteps.toLocaleString()
              : '—'}
          </p>
          <p
            className={`text-[10px] mt-1 ${
              thisWeek.avgSteps >= 8000 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {thisWeek.avgSteps >= 8000
              ? 'Goal: 8k met'
              : thisWeek.avgSteps > 0
              ? 'Below 8k target'
              : 'No entries yet'}
          </p>
        </div>

        {/* Weight Trend */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <Weight size={20} className="text-indigo-400 mb-2" />
          <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">
            Weight Trend
          </h4>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold">{weightTrendText}</p>
            {WeightTrendIcon && (
              <WeightTrendIcon size={18} className={weightTrendColor} />
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Weekly Average</p>
        </div>

        {/* Lifting */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <Dumbbell size={20} className="text-emerald-400 mb-2" />
          <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">
            Lifting
          </h4>
          <p className="text-2xl font-bold">{thisWeek.liftSessions}/3</p>
          <p
            className={`text-[10px] mt-1 ${
              thisWeek.liftSessions >= 3 ? 'text-green-400' : 'text-slate-500'
            }`}
          >
            {thisWeek.liftSessions >= 3
              ? 'Weekly complete'
              : `${3 - thisWeek.liftSessions} more to go`}
          </p>
        </div>

        {/* Free Meals */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <Pizza size={20} className="text-orange-400 mb-2" />
          <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">
            Free Meals
          </h4>
          <p className="text-2xl font-bold">{freeMealsThisWeek}/1</p>
          <p
            className={`text-[10px] mt-1 ${
              freeMealsThisWeek <= 1 ? 'text-orange-400' : 'text-red-400'
            }`}
          >
            {freeMealsThisWeek === 0
              ? 'Available this week'
              : freeMealsThisWeek === 1
              ? 'Planned & used'
              : 'Over budget'}
          </p>
        </div>
      </div>

      {/* Weekly Trend (Last 4 Weeks) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h3 className="text-lg font-bold mb-4">Weekly Trend</h3>
        <div className="space-y-3">
          {weeklyTrend.map((w) => {
            const barWidth =
              maxSteps > 0
                ? Math.max((w.avgSteps / maxSteps) * 100, 2)
                : 2;

            // Weight direction compared to next older week
            let weightDir = '';
            const olderWeek = getWeekHealthAvg(w.week - 1);
            if (w.avgWeight !== null && olderWeek.avgWeight !== null) {
              const diff =
                Math.round((w.avgWeight - olderWeek.avgWeight) * 10) / 10;
              if (diff < 0) weightDir = `${Math.abs(diff)}lb`;
              else if (diff > 0) weightDir = `+${diff}lb`;
              else weightDir = '0lb';
            } else if (w.avgWeight !== null) {
              weightDir = `${w.avgWeight}lb`;
            } else {
              weightDir = '—';
            }

            return (
              <div key={w.week} className="flex items-center space-x-4">
                <span className="text-xs text-slate-500 w-16 shrink-0">
                  Wk {w.week}
                </span>
                {/* Steps bar */}
                <div className="flex-1 h-5 bg-slate-800 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full ${
                      w.avgSteps >= 8000 ? 'bg-blue-500' : 'bg-blue-900'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                  <span className="absolute inset-0 flex items-center px-2 text-[10px] text-white font-medium">
                    {w.avgSteps > 0
                      ? `${w.avgSteps.toLocaleString()} steps`
                      : 'No data'}
                  </span>
                </div>
                {/* Lift count */}
                <span
                  className={`text-xs w-10 text-center ${
                    w.liftSessions >= 3
                      ? 'text-emerald-400'
                      : 'text-slate-500'
                  }`}
                >
                  <Dumbbell size={12} className="inline mr-0.5" />
                  {w.liftSessions}
                </span>
                {/* Weight */}
                <span className="text-xs text-slate-400 w-16 text-right">
                  {weightDir}
                </span>
              </div>
            );
          })}
        </div>
        {weeklyTrend.every((w) => w.avgSteps === 0) && (
          <p className="text-slate-600 text-sm mt-4 text-center">
            No health data logged yet. Use the &quot;Log Today&quot; button to start tracking.
          </p>
        )}
      </div>

      {/* Recent Entries */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h3 className="text-lg font-bold mb-4">Recent Entries</h3>
        {recentEntries.length === 0 ? (
          <p className="text-slate-600 text-sm">No entries yet.</p>
        ) : (
          <div className="space-y-2">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <span className="text-xs text-slate-500 w-20 shrink-0">
                    {entry.date}
                  </span>
                  <span className="text-sm font-medium text-blue-400 w-20 shrink-0">
                    <Footprints size={12} className="inline mr-1" />
                    {entry.steps.toLocaleString()}
                  </span>
                  <span className="text-sm text-indigo-400 w-16 shrink-0">
                    {entry.weight != null ? `${entry.weight}lb` : '—'}
                  </span>
                  {entry.liftingSession && (
                    <Dumbbell size={14} className="text-emerald-400 shrink-0" />
                  )}
                  {entry.freeMealUsed && (
                    <Pizza size={14} className="text-orange-400 shrink-0" />
                  )}
                  {entry.notes && (
                    <span className="text-xs text-slate-500 truncate">
                      {entry.notes}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-slate-600 hover:text-red-400 transition-colors ml-2 shrink-0"
                  title="Delete entry"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Health;
