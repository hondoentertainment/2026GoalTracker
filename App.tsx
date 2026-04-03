
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Scoreboard from './components/Scoreboard';
import Creative from './components/Creative';
import Tech from './components/Tech';
import Media from './components/Media';
import Health from './components/Health';
import Coach from './components/Coach';
import ErrorBoundary from './components/ErrorBoundary';
import Toast, { useToast } from './components/Toast';
import TodayFocus from './components/TodayFocus';
import { Category } from './types';

export const ToastContext = React.createContext<(text: string, type?: 'success' | 'error' | 'info', undoAction?: () => void) => void>(() => {});

const SECTION_MAP: Record<string, Category> = {
  Creative: Category.CREATIVE,
  Tech: Category.TECH,
  Media: Category.MEDIA,
  Health: Category.HEALTH,
  Scoreboard: Category.SCOREBOARD,
};

const SHORTCUT_CATEGORIES: Category[] = [
  Category.SCOREBOARD,
  Category.CREATIVE,
  Category.TECH,
  Category.MEDIA,
  Category.HEALTH,
];

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>(Category.SCOREBOARD);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const index = parseInt(e.key, 10) - 1;
        setActiveCategory(SHORTCUT_CATEGORIES[index]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (section: string) => {
    const category = SECTION_MAP[section];
    if (category) {
      setActiveCategory(category);
    }
  };

  const renderContent = () => {
    switch (activeCategory) {
      case Category.SCOREBOARD:
        return (
          <ErrorBoundary section="Scoreboard">
            <Scoreboard />
          </ErrorBoundary>
        );
      case Category.CREATIVE:
        return (
          <ErrorBoundary section="Creative">
            <Creative />
          </ErrorBoundary>
        );
      case Category.TECH:
        return (
          <ErrorBoundary section="Tech">
            <Tech />
          </ErrorBoundary>
        );
      case Category.MEDIA:
        return (
          <ErrorBoundary section="Media">
            <Media />
          </ErrorBoundary>
        );
      case Category.HEALTH:
        return (
          <ErrorBoundary section="Health">
            <Health />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary section="Scoreboard">
            <Scoreboard />
          </ErrorBoundary>
        );
    }
  };

  return (
    <ToastContext.Provider value={addToast}>
      <div className="flex flex-col md:flex-row min-h-screen">
        <Sidebar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        <main className="flex-1 p-4 md:p-10 overflow-x-hidden max-w-7xl mx-auto w-full">
          {activeCategory === Category.SCOREBOARD && (
            <TodayFocus onNavigate={handleNavigate} />
          )}
          {renderContent()}
          <div className="mt-12">
            <ErrorBoundary section="Coach">
              <Coach />
            </ErrorBoundary>
          </div>
          <footer className="mt-20 pt-10 border-t border-slate-800 text-center pb-10">
            <p className="text-slate-600 text-sm">2026 Execution Blueprint Dashboard — Built for High Performance.</p>
            <p className="text-slate-700 text-xs mt-2">Tip: Ctrl+1-5 to switch tabs (Scoreboard, Creative, Tech, Media, Health)</p>
          </footer>
        </main>
        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    </ToastContext.Provider>
  );
};

export default App;
