
import React from 'react';
import { Rocket, Package, BrainCircuit, CheckCircle } from 'lucide-react';

const Tech: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold">Tech & AI</h2>
        <p className="text-slate-400 italic">"Shipping over perfecting."</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <Rocket className="text-blue-500" />
            <h3 className="text-xl font-bold">Deep Seats v1</h3>
          </div>
          <span className="text-xs font-bold bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
            Q2 TARGET
          </span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {['Q1: Scope Lock', 'Q2: MVP Build', 'Q3: Public v1', 'Q4: Feedback'].map((phase, i) => (
              <div key={i} className={`p-4 rounded-xl border ${i === 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/30 border-slate-700'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-black uppercase ${i === 0 ? 'text-green-400' : 'text-slate-500'}`}>Phase 0{i+1}</span>
                  {i === 0 && <CheckCircle size={14} className="text-green-500" />}
                </div>
                <p className={`text-sm font-semibold ${i === 0 ? 'text-slate-100' : 'text-slate-500'}`}>{phase}</p>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
             <div className="flex justify-between items-center text-sm">
               <span className="text-slate-300">Core Feature Build Out</span>
               <span className="text-slate-500">45%</span>
             </div>
             <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 w-[45%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <Package className="text-indigo-400" />
            <h3 className="text-lg font-bold">Monthly Side App</h3>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl mb-4 border border-slate-700">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Current Sprint</p>
            <p className="text-md font-semibold text-slate-200">Writing Streak Visualizer</p>
          </div>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-center space-x-2">
               <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
               <span>≤ 30 days build time</span>
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
    </div>
  );
};

export default Tech;
