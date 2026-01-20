
import React from 'react';
import { PenTool, MessageSquare, BookOpen, Flame } from 'lucide-react';

const Creative: React.FC = () => {
  const projects = [
    {
      title: "Xavier Transport",
      type: "SF Thriller",
      goal: "300 words daily / 2500 weekly",
      progress: "Act I + Worldbuilding",
      status: "On Track",
      color: "blue"
    },
    {
      title: "Which Direction Home",
      type: "Dramatic Play",
      goal: "2 focused sessions / week",
      progress: "Dialogue Pass",
      status: "Waiting",
      color: "indigo"
    },
    {
      title: "Schafer Cookbook",
      type: "Family History",
      goal: "1 recipe fully documented",
      progress: "5/30 Recipes",
      status: "On Track",
      color: "emerald"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold">Creative Work</h2>
          <p className="text-slate-400 italic">"Finish what you start."</p>
        </div>
        <div className="bg-orange-500/10 text-orange-400 px-4 py-2 rounded-full border border-orange-500/30 flex items-center space-x-2">
          <Flame size={18} />
          <span className="font-bold">14 Day Writing Streak</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((p, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl group hover:border-slate-700 transition-all">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-${p.color}-500/20 text-${p.color}-400`}>
               {p.title.includes("Xavier") ? <BookOpen /> : p.title.includes("Play") ? <MessageSquare /> : <PenTool />}
            </div>
            <h3 className="text-xl font-bold text-slate-100">{p.title}</h3>
            <p className="text-sm text-slate-500 mb-4">{p.type}</p>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">System</label>
                <p className="text-sm text-slate-300">{p.goal}</p>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Current Milestone</label>
                <p className="text-sm text-slate-300">{p.progress}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-800">
              <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'On Track' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/40 p-8 rounded-2xl border border-slate-700/50">
        <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
          <span>Writing Streak Tracker</span>
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className={`h-10 rounded-md flex items-center justify-center text-xs font-bold transition-all ${i < 14 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-800 text-slate-600 border border-slate-700'}`}>
              {i + 1}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500 text-center uppercase tracking-widest font-bold">📌 Never miss twice rule enabled.</p>
      </div>
    </div>
  );
};

export default Creative;
