import React from 'react';
import { PenTool, Footprints, Cpu, PlaySquare, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { getTodayStatus, getStreakWarning } from '../services/storageService';

interface TodayFocusProps {
  onNavigate: (section: string) => void;
}

const TodayFocus: React.FC<TodayFocusProps> = ({ onNavigate }) => {
  const status = getTodayStatus();
  const streak = getStreakWarning();

  const items = [
    {
      done: status.wroteToday,
      label: status.wroteToday ? `${status.todayWords.toLocaleString()} words written` : 'Log a writing session',
      icon: PenTool,
      color: 'orange',
      section: 'Creative',
    },
    {
      done: status.loggedHealth,
      label: status.loggedHealth ? `${status.todaySteps.toLocaleString()} steps logged` : 'Log health data',
      icon: Footprints,
      color: 'blue',
      section: 'Health',
    },
    {
      done: status.loggedTech,
      label: status.loggedTech ? 'Tech work logged' : 'Log tech work',
      icon: Cpu,
      color: 'indigo',
      section: 'Tech',
    },
    {
      done: status.loggedMedia,
      label: status.loggedMedia ? 'Media logged' : 'Log a book, film, or album',
      icon: PlaySquare,
      color: 'emerald',
      section: 'Media',
    },
  ];

  const allDone = items.every(i => i.done);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
      {/* Streak Warning */}
      {streak.atRisk && (
        <div className="flex items-center gap-3 p-3 mb-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
          <AlertTriangle size={16} className="text-orange-400 shrink-0" />
          <span className="text-sm text-orange-300 font-medium">{streak.message}</span>
          <button
            onClick={() => onNavigate('Creative')}
            className="ml-auto text-xs font-bold bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-400 transition-colors"
          >
            Write Now
          </button>
        </div>
      )}
      {streak.daysWithout > 2 && streak.message && (
        <div className="flex items-center gap-3 p-3 mb-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <PenTool size={16} className="text-slate-500 shrink-0" />
          <span className="text-sm text-slate-400">{streak.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Today's Focus</h3>
        {allDone && (
          <span className="text-xs font-bold bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20">
            All logged!
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.section}
              onClick={() => !item.done && onNavigate(item.section)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                item.done
                  ? 'bg-slate-800/30 border-slate-700/50'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 cursor-pointer hover:bg-slate-800'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={item.done ? 'text-slate-600' : `text-${item.color}-400`} />
                {item.done && (
                  <CheckCircle2 size={12} className="text-green-400 absolute -top-1 -right-2" />
                )}
              </div>
              <span className={`text-xs text-center leading-tight ${item.done ? 'text-slate-500' : 'text-slate-300'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TodayFocus;
