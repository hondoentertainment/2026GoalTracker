import React, { useState, useEffect } from 'react';
import { BookMarked, PlayCircle, Music, Plus, Trash2, Star, Check, X } from 'lucide-react';
import { MediaEntry } from '../types';
import {
  getMediaEntries,
  addMediaEntry,
  updateMediaEntry,
  deleteMediaEntry,
  getCurrentWeekNumber,
  getTodayString,
} from '../services/storageService';

const TARGETS = { book: 104, film: 104, album: 100 } as const;
const PACE_PER_WEEK = { book: 2, film: 2, album: 2 } as const;

const TYPE_CONFIG = {
  book: { label: 'Books', icon: BookMarked, color: 'amber', creatorLabel: 'Author' },
  film: { label: 'Films', icon: PlayCircle, color: 'red', creatorLabel: 'Director' },
  album: { label: 'Albums', icon: Music, color: 'purple', creatorLabel: 'Artist' },
} as const;

type MediaType = 'book' | 'film' | 'album';

function renderStars(rating: number) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          className={n <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}
        />
      ))}
    </span>
  );
}

const Media: React.FC = () => {
  const [entries, setEntries] = useState<MediaEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<MediaType>('book');
  const [formTitle, setFormTitle] = useState('');
  const [formCreator, setFormCreator] = useState('');
  const [formRating, setFormRating] = useState<number>(5);
  const [formNotes, setFormNotes] = useState('');
  const [formCompleted, setFormCompleted] = useState(true);

  const reload = () => setEntries(getMediaEntries());

  useEffect(() => {
    reload();
  }, []);

  const weekNumber = getCurrentWeekNumber();

  const completedByType = (type: MediaType) =>
    entries.filter((e) => e.type === type && e.completed);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    addMediaEntry({
      date: getTodayString(),
      type: formType,
      title: formTitle.trim(),
      creator: formCreator.trim(),
      rating: formRating,
      notes: formNotes.trim(),
      completed: formCompleted,
    });
    setFormTitle('');
    setFormCreator('');
    setFormRating(5);
    setFormNotes('');
    setFormCompleted(true);
    setShowForm(false);
    reload();
  };

  const handleDelete = (id: string) => {
    deleteMediaEntry(id);
    reload();
  };

  const handleToggleComplete = (entry: MediaEntry) => {
    updateMediaEntry(entry.id, { completed: !entry.completed });
    reload();
  };

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const colorMap: Record<string, { text: string; bg: string; border: string; badge: string }> = {
    amber: { text: 'text-amber-400', bg: 'bg-amber-400', border: 'border-amber-400/20', badge: 'bg-amber-400/10 text-amber-400' },
    red: { text: 'text-red-400', bg: 'bg-red-400', border: 'border-red-400/20', badge: 'bg-red-400/10 text-red-400' },
    purple: { text: 'text-purple-400', bg: 'bg-purple-400', border: 'border-purple-400/20', badge: 'bg-purple-400/10 text-purple-400' },
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold">Intended Consumption</h2>
          <p className="text-slate-400">104 Books | Ebert&apos;s Great Movies | RS Top 500 Albums</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Log Media'}
        </button>
      </header>

      {/* Add Media Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
        >
          <h3 className="text-lg font-bold mb-2">Log New Media</h3>

          {/* Type selector */}
          <div className="flex gap-2">
            {(['book', 'film', 'album'] as MediaType[]).map((t) => {
              const cfg = TYPE_CONFIG[t];
              const colors = colorMap[cfg.color];
              const active = formType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormType(t)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                    active
                      ? `${colors.bg} text-slate-900 border-transparent`
                      : `bg-slate-800 ${colors.text} border-slate-700 hover:bg-slate-700`
                  }`}
                >
                  <cfg.icon size={16} />
                  {cfg.label.slice(0, -1)}
                </button>
              );
            })}
          </div>

          {/* Title */}
          <input
            type="text"
            placeholder="Title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-slate-500"
            required
          />

          {/* Creator */}
          <input
            type="text"
            placeholder={TYPE_CONFIG[formType].creatorLabel}
            value={formCreator}
            onChange={(e) => setFormCreator(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-slate-500"
          />

          {/* Rating */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFormRating(n)}
                  className="p-0.5"
                >
                  <Star
                    size={20}
                    className={
                      n <= formRating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-600 hover:text-slate-400'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <input
            type="text"
            placeholder="Notes (optional)"
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-slate-500"
          />

          {/* Completed checkbox */}
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={formCompleted}
              onChange={(e) => setFormCompleted(e.target.checked)}
              className="rounded border-slate-600 bg-slate-800 text-amber-400 focus:ring-0"
            />
            Completed
          </label>

          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm transition-colors"
          >
            Save Entry
          </button>
        </form>
      )}

      {/* Tracker Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['book', 'film', 'album'] as MediaType[]).map((type) => {
          const cfg = TYPE_CONFIG[type];
          const colors = colorMap[cfg.color];
          const Icon = cfg.icon;
          const completed = completedByType(type);
          const count = completed.length;
          const target = TARGETS[type];
          const pct = target > 0 ? Math.round((count / target) * 1000) / 10 : 0;

          const expected = weekNumber * PACE_PER_WEEK[type];
          const onPace = count >= expected;

          const recent = [...completed]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

          return (
            <div key={type} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Icon className={colors.text} />
                  <h3 className="text-lg font-bold">{cfg.label}</h3>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    onPace
                      ? 'bg-green-400/10 text-green-400'
                      : 'bg-red-400/10 text-red-400'
                  }`}
                >
                  {onPace ? 'On Pace' : 'Behind Pace'}
                </span>
              </div>

              <div className="flex justify-between items-end mb-4">
                <span className="text-3xl font-bold">
                  {count}/{target}
                </span>
                <span className="text-slate-500 text-sm">{pct}% Complete</span>
              </div>

              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors.bg} transition-all duration-500`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              <p className="text-[10px] text-slate-500 mt-2">
                Expected by week {weekNumber}: {expected} &middot; Actual: {count}
              </p>

              {recent.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  {recent.map((item, i) => (
                    <div key={item.id} className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="text-slate-600">{count - i}.</span>
                      <span className="line-through truncate">
                        {item.title}
                        {item.creator ? ` — ${item.creator}` : ''}
                      </span>
                      {item.rating != null && renderStars(item.rating)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Full Media Log */}
      {sortedEntries.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Full Media Log</h3>
          <div className="space-y-2">
            {sortedEntries.map((entry) => {
              const cfg = TYPE_CONFIG[entry.type];
              const colors = colorMap[cfg.color];
              const Icon = cfg.icon;

              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 ${
                    !entry.completed ? 'opacity-60' : ''
                  }`}
                >
                  <Icon size={16} className={colors.text} />
                  <span className="font-medium text-sm truncate flex-1">
                    {entry.title}
                  </span>
                  {entry.creator && (
                    <span className="text-xs text-slate-500 hidden sm:inline truncate max-w-[140px]">
                      {entry.creator}
                    </span>
                  )}
                  {entry.rating != null && (
                    <span className="hidden sm:inline">{renderStars(entry.rating)}</span>
                  )}
                  <span className="text-xs text-slate-600 whitespace-nowrap">{entry.date}</span>
                  <button
                    onClick={() => handleToggleComplete(entry)}
                    title={entry.completed ? 'Mark incomplete' : 'Mark complete'}
                    className={`p-1 rounded-lg transition-colors ${
                      entry.completed
                        ? 'text-green-400 hover:bg-green-400/10'
                        : 'text-slate-500 hover:bg-slate-700'
                    }`}
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    title="Delete entry"
                    className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Media;
