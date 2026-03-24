
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Scoreboard from './components/Scoreboard';
import Creative from './components/Creative';
import Tech from './components/Tech';
import Media from './components/Media';
import Health from './components/Health';
import Coach from './components/Coach';
import { Category } from './types';

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
        return <Media />;
      case Category.HEALTH:
        return <Health />;
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
