
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Scoreboard from './components/Scoreboard';
import Creative from './components/Creative';
import Tech from './components/Tech';
import Coach from './components/Coach';
import { Category } from './types';
import { PlayCircle, BookMarked, Music, Footprints, Weight, Dumbbell, Pizza } from 'lucide-react';

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>(Category.SCOREBOARD);

  const renderContent = () => {
    switch (activeCategory) {
      case Category.SCOREBOARD:
        return <Scoreboard />;
      case Category.CREATIVE:
        return <Creative />;
      case Category.TECH:
        return <Tech />;
      case Category.MEDIA:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
              <h2 className="text-3xl font-bold">Intended Consumption</h2>
              <p className="text-slate-400">104 Books | Ebert's Great Movies | RS Top 500 Albums</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                 <div className="flex items-center space-x-3 mb-6">
                    <BookMarked className="text-amber-400" />
                    <h3 className="text-lg font-bold">104 Books</h3>
                 </div>
                 <div className="flex justify-between items-end mb-4">
                    <span className="text-3xl font-bold">10/104</span>
                    <span className="text-slate-500 text-sm">9.6% Complete</span>
                 </div>
                 <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-amber-400 w-[9.6%]"></div>
                 </div>
                 <div className="mt-6 space-y-2">
                    <div className="text-xs text-slate-400 line-through">1. Hyperion (F)</div>
                    <div className="text-xs text-slate-400 line-through">2. The Pragmatic Programmer (NF)</div>
                    <div className="text-xs text-slate-200">3. Dune Messiah (F) - Current</div>
                 </div>
               </div>

               <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                 <div className="flex items-center space-x-3 mb-6">
                    <PlayCircle className="text-red-400" />
                    <h3 className="text-lg font-bold">Ebert's Greats</h3>
                 </div>
                 <div className="flex justify-between items-end mb-4">
                    <span className="text-3xl font-bold">4/104</span>
                    <span className="text-slate-500 text-sm">3.8% Complete</span>
                 </div>
                 <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-red-400 w-[3.8%]"></div>
                 </div>
                 <div className="mt-6 space-y-2">
                    <div className="text-xs text-slate-400 line-through">1. Citizen Kane</div>
                    <div className="text-xs text-slate-400 line-through">2. 2001: A Space Odyssey</div>
                 </div>
               </div>

               <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                 <div className="flex items-center space-x-3 mb-6">
                    <Music className="text-purple-400" />
                    <h3 className="text-lg font-bold">Top 500 Albums</h3>
                 </div>
                 <div className="flex justify-between items-end mb-4">
                    <span className="text-3xl font-bold">5/100</span>
                    <span className="text-slate-500 text-sm">5% Complete</span>
                 </div>
                 <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-purple-400 w-[5%]"></div>
                 </div>
                 <div className="mt-6 space-y-2">
                    <div className="text-xs text-slate-400 line-through">1. What's Going On - Marvin Gaye</div>
                    <div className="text-xs text-slate-400 line-through">2. Pet Sounds - Beach Boys</div>
                 </div>
               </div>
            </div>
          </div>
        );
      case Category.HEALTH:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
              <h2 className="text-3xl font-bold">Health & Stability</h2>
              <p className="text-slate-400 italic">"Stability, not fluctuation."</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <Footprints size={20} className="text-blue-400 mb-2" />
                <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Steps (Daily Avg)</h4>
                <p className="text-2xl font-bold">8,422</p>
                <p className="text-[10px] text-green-400 mt-1">Goal: 8k met</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <Weight size={20} className="text-indigo-400 mb-2" />
                <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Weight Trend</h4>
                <p className="text-2xl font-bold">Down 1.2lb</p>
                <p className="text-[10px] text-slate-500 mt-1">Weekly Average</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <Dumbbell size={20} className="text-emerald-400 mb-2" />
                <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Lifting</h4>
                <p className="text-2xl font-bold">3/3</p>
                <p className="text-[10px] text-green-400 mt-1">Weekly complete</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <Pizza size={20} className="text-orange-400 mb-2" />
                <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Free Meals</h4>
                <p className="text-2xl font-bold">1/1</p>
                <p className="text-[10px] text-orange-400 mt-1">Planned & used</p>
              </div>
            </div>
          </div>
        );
      default:
        return <Scoreboard />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      <main className="flex-1 p-4 md:p-10 overflow-x-hidden max-w-7xl mx-auto w-full">
        {renderContent()}
        <div className="mt-12">
          <Coach />
        </div>
        <footer className="mt-20 pt-10 border-t border-slate-800 text-center pb-10">
          <p className="text-slate-600 text-sm">2026 Execution Blueprint Dashboard — Built for High Performance.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
