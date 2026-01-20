
import React from 'react';
import { Category } from '../types';
import { LayoutDashboard, PenTool, Cpu, PlaySquare, HeartPulse, ListTodo } from 'lucide-react';

interface SidebarProps {
  activeCategory: Category;
  setActiveCategory: (cat: Category) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeCategory, setActiveCategory }) => {
  const navItems = [
    { id: Category.SCOREBOARD, icon: LayoutDashboard, label: 'Scoreboard' },
    { id: Category.CREATIVE, icon: PenTool, label: 'Creative' },
    { id: Category.TECH, icon: Cpu, label: 'Tech' },
    { id: Category.MEDIA, icon: PlaySquare, label: 'Media' },
    { id: Category.HEALTH, icon: HeartPulse, label: 'Health' },
  ];

  return (
    <div className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          2026 Blueprint
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">Execution Mode</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveCategory(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              activeCategory === item.id
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400 italic">
          "Finish what you start."
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
