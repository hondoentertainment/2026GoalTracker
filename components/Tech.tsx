
import React, { useState, useEffect } from 'react';
import { Rocket, Package, BrainCircuit, CheckCircle, Plus, Trash2, X } from 'lucide-react';
import {
  loadData,
  addTechLogEntry,
  deleteTechLogEntry,
  updateDeepSeatsProgress,
  updateCurrentPhase,
  getCurrentWeekNumber,
  getWeekDates,
} from '../services/storageService';
import { TechLogEntry } from '../types';

const Tech: React.FC = () => {
  const [deepSeatsProgress, setDeepSeatsProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [sideAppName, setSideAppName] = useState('');
  const [sideAppDaysRemaining, setSideAppDaysRemaining] = useState(0);
  const [logEntries, setLogEntries] = useState<TechLogEntry[]>([]);

  // Form visibility
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);

  // Progress form state
  const [progressInput, setProgressInput] = useState(0);
  const [phaseInput, setPhaseInput] = useState(1);

  // Log form state
  const [logProject, setLogProject] = useState<'deep-seats' | 'side-app' | 'ai-learning'>('deep-seats');
  const [logTask, setLogTask] = useState('');
  const [logHours, setLogHours] = useState(0);
  const [logMilestone, setLogMilestone] = useState('');
  const [logCompleted, setLogCompleted] = useState(false);

  const refreshData = () => {
    const data = loadData();
    setDeepSeatsProgress(data.tech.deepSeatsProgress);
    setCurrentPhase(data.tech.currentPhase);
    setSideAppName(data.tech.sideAppName);
    setSideAppDaysRemaining(data.tech.sideAppDaysRemaining);
    setLogEntries(data.tech.logEntries);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeepSeatsProgress(progressInput);
    updateCurrentPhase(phaseInput);
    setShowProgressForm(false);
    refreshData();
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTechLogEntry({
      date: new Date().toISOString().split('T')[0],
      project: logProject,
      task: logTask,
      hoursSpent: logHours,
      milestone: logMilestone,
      completed: logCompleted,
    });
    setLogTask('');
    setLogHours(0);
    setLogMilestone('');
    setLogCompleted(false);
    setShowLogForm(false);
    refreshData();
  };

  const handleDeleteEntry = (id: string) => {
    deleteTechLogEntry(id);
    refreshData();
  };

  // Stats
  const weekNumber = getCurrentWeekNumber();
  const year = new Date().getFullYear();
  const weekDatesSet = new Set(getWeekDates(year, weekNumber));
  const weekEntries = logEntries.filter(e => weekDatesSet.has(e.date));
  const weekHours = weekEntries.reduce((sum, e) => sum + e.hoursSpent, 0);
  const totalCompleted = logEntries.filter(e => e.completed).length;

  const recentEntries = [...logEntries].reverse().slice(0, 5);

  const phases = ['Q1: Scope Lock', 'Q2: MVP Build', 'Q3: Public v1', 'Q4: Feedback'];

  const projectLabel = (p: string) => {
    switch (p) {
      case 'deep-seats': return 'Deep Seats';
      case 'side-app': return 'Side App';
      case 'ai-learning': return 'AI Learning';
      default: return p;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold">Tech & AI</h2>
        <p className="text-slate-400 italic">"Shipping over perfecting."</p>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Hours This Week</p>
          <p className="text-2xl font-bold text-blue-400">{weekHours.toFixed(1)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Completed Tasks</p>
          <p className="text-2xl font-bold text-emerald-400">{totalCompleted}</p>
        </div>
      </div>

      {/* Deep Seats Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <Rocket className="text-blue-500" />
            <h3 className="text-xl font-bold">Deep Seats v1</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setProgressInput(deepSeatsProgress);
                setPhaseInput(currentPhase);
                setShowProgressForm(!showProgressForm);
              }}
              className="text-xs font-semibold bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer"
            >
              Update Progress
            </button>
            <span className="text-xs font-bold bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
              Q2 TARGET
            </span>
          </div>
        </div>
        <div className="p-6">
          {/* Progress Update Form */}
          {showProgressForm && (
            <form onSubmit={handleProgressSubmit} className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-300">Update Deep Seats Progress</span>
                <button type="button" onClick={() => setShowProgressForm(false)} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Progress (0-100%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={progressInput}
                    onChange={e => setProgressInput(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Current Phase (1-4)</label>
                  <select
                    value={phaseInput}
                    onChange={e => setPhaseInput(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value={1}>Phase 1 - Q1: Scope Lock</option>
                    <option value={2}>Phase 2 - Q2: MVP Build</option>
                    <option value={3}>Phase 3 - Q3: Public v1</option>
                    <option value={4}>Phase 4 - Q4: Feedback</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Save
              </button>
            </form>
          )}

          {/* Phase Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {phases.map((phase, i) => {
              const phaseNum = i + 1;
              const isCompleted = phaseNum <= currentPhase;
              return (
                <div key={i} className={`p-4 rounded-xl border ${isCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/30 border-slate-700'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase ${isCompleted ? 'text-green-400' : 'text-slate-500'}`}>Phase 0{phaseNum}</span>
                    {isCompleted && <CheckCircle size={14} className="text-green-500" />}
                  </div>
                  <p className={`text-sm font-semibold ${isCompleted ? 'text-slate-100' : 'text-slate-500'}`}>{phase}</p>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300">Core Feature Build Out</span>
              <span className="text-slate-500">{deepSeatsProgress}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-500"
                style={{ width: `${deepSeatsProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Side App + AI Curriculum */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <Package className="text-indigo-400" />
            <h3 className="text-lg font-bold">Monthly Side App</h3>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl mb-4 border border-slate-700">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Current Sprint</p>
            <p className="text-md font-semibold text-slate-200">{sideAppName}</p>
          </div>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              <span>{sideAppDaysRemaining} days remaining</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              <span>≤ 3 core features</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <BrainCircuit className="text-emerald-400" />
            <h3 className="text-lg font-bold">AI Quarterly Curriculum</h3>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <span className="text-[10px] font-black uppercase text-emerald-400">Q1 Focus</span>
              <p className="text-sm font-semibold text-slate-200">AI Fundamentals & LLM Ops</p>
            </div>
            <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg">
              <span className="text-[10px] font-black uppercase text-slate-500">Q2 Focus</span>
              <p className="text-sm font-semibold text-slate-400">Applied Agents & Automation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Log Work Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-200">Tech Work Log</h3>
          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="flex items-center space-x-2 text-sm font-semibold bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-lg border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>Log Work</span>
          </button>
        </div>

        {/* Log Work Form */}
        {showLogForm && (
          <form onSubmit={handleLogSubmit} className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-300">New Work Entry</span>
              <button type="button" onClick={() => setShowLogForm(false)} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Project</label>
                <select
                  value={logProject}
                  onChange={e => setLogProject(e.target.value as 'deep-seats' | 'side-app' | 'ai-learning')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="deep-seats">Deep Seats</option>
                  <option value="side-app">Side App</option>
                  <option value="ai-learning">AI Learning</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Hours Spent</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={logHours}
                  onChange={e => setLogHours(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Task Description</label>
                <input
                  type="text"
                  value={logTask}
                  onChange={e => setLogTask(e.target.value)}
                  placeholder="What did you work on?"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Milestone</label>
                <input
                  type="text"
                  value={logMilestone}
                  onChange={e => setLogMilestone(e.target.value)}
                  placeholder="Related milestone"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center space-x-2 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={logCompleted}
                    onChange={e => setLogCompleted(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-slate-300">Task completed</span>
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Add Entry
            </button>
          </form>
        )}

        {/* Recent Entries */}
        {recentEntries.length > 0 ? (
          <div className="space-y-3">
            {recentEntries.map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center space-x-4 min-w-0">
                  <span className="text-xs text-slate-500 whitespace-nowrap">{entry.date}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                    entry.project === 'deep-seats' ? 'bg-blue-500/10 text-blue-400' :
                    entry.project === 'side-app' ? 'bg-indigo-500/10 text-indigo-400' :
                    'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {projectLabel(entry.project)}
                  </span>
                  <span className="text-sm text-slate-300 truncate">{entry.task}</span>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{entry.hoursSpent}h</span>
                  {entry.completed && <CheckCircle size={14} className="text-green-500 flex-shrink-0" />}
                </div>
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="text-slate-600 hover:text-red-400 transition-colors ml-3 flex-shrink-0 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600 text-center py-4">No work logged yet. Start tracking your progress!</p>
        )}
      </div>
    </div>
  );
};

export default Tech;
