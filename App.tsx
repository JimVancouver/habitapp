import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, Calendar as CalIcon, BarChart3, BrainCircuit, Moon, Sun, List, Users } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { SocialView } from './components/SocialView';
import { AddHabitModal } from './components/AddHabitModal';
import { Habit, Frequency } from './types';
import { analyzeProgress } from './services/geminiService';

const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('orbit_habits');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [viewMode, setViewMode] = useState<'dashboard' | 'calendar' | 'social'>('dashboard');
  const [viewFilter, setViewFilter] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('daily');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate] = useState(new Date());
  
  // AI Coach state
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Dark Mode state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('orbit_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('orbit_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('orbit_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('orbit_theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(prev => !prev);

  const addHabit = (newHabitData: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedDates'>) => {
    const newHabit: Habit = {
        ...newHabitData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        streak: 0,
        completedDates: []
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const toggleHabit = (id: string, dateStr: string) => {
    setHabits(prev => prev.map(h => {
        if (h.id !== id) return h;

        const isCompleted = h.completedDates.includes(dateStr);
        let newCompletedDates;
        let newStreak = h.streak;

        if (isCompleted) {
            newCompletedDates = h.completedDates.filter(d => d !== dateStr);
            // Naive streak reduction logic (in a real app, recalculate from history)
            newStreak = Math.max(0, h.streak - 1);
        } else {
            newCompletedDates = [...h.completedDates, dateStr];
            // Naive streak addition
            newStreak = h.streak + 1;
        }

        return {
            ...h,
            completedDates: newCompletedDates,
            streak: newStreak
        };
    }));
  };

  const handleAiAnalyze = async () => {
      if (isAnalyzing) return;
      setIsAnalyzing(true);
      const text = await analyzeProgress(habits);
      setAiAnalysis(text);
      setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      {/* Top Navigation */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    O
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">Orbit Habits</h1>
            </div>
            
            {/* View Switcher (Center) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setViewMode('dashboard')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${viewMode === 'dashboard' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                >
                  <LayoutGrid size={16} /> <span className="hidden sm:inline">Dashboard</span>
                </button>
                <button 
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                >
                  <CalIcon size={16} /> <span className="hidden sm:inline">Calendar</span>
                </button>
                <button 
                  onClick={() => setViewMode('social')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${viewMode === 'social' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                >
                  <Users size={16} /> <span className="hidden sm:inline">Friends</span>
                </button>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                    title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus size={18} /> <span className="hidden sm:inline">New Habit</span>
                </button>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Controls Row (Only for Dashboard) */}
        {viewMode === 'dashboard' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 w-fit transition-colors duration-300">
                    {(['daily', 'weekly', 'monthly', 'all'] as const).map((v) => (
                        <button
                            key={v}
                            onClick={() => setViewFilter(v)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${viewFilter === v ? 'bg-indigo-50 text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                        >
                            {v}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleAiAnalyze}
                        className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-slate-900 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <BrainCircuit size={18} /> {isAnalyzing ? 'Analyzing...' : 'Analyze Progress'}
                    </button>
                </div>
            </div>
        )}

        {/* AI Insight Banner */}
        {aiAnalysis && (
            <div className="mb-8 bg-indigo-600 dark:bg-indigo-700 text-white p-6 rounded-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 shadow-lg">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <BrainCircuit size={100} />
                </div>
                <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <BrainCircuit size={20} /> Coach Insights
                    </h3>
                    <p className="text-indigo-100 dark:text-indigo-50 leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
                    <button 
                        onClick={() => setAiAnalysis(null)} 
                        className="mt-4 text-xs bg-indigo-500 hover:bg-indigo-400 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-3 py-1 rounded-full transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        )}

        {/* Views */}
        {viewMode === 'dashboard' && (
             <Dashboard 
                habits={habits} 
                filter={viewFilter} 
                onToggle={toggleHabit} 
                onDelete={deleteHabit}
                currentDate={currentDate}
            />
        )}

        {viewMode === 'calendar' && (
            <CalendarView 
                habits={habits}
                onToggle={toggleHabit}
            />
        )}

        {viewMode === 'social' && (
            <SocialView userHabits={habits} />
        )}

      </main>

      <AddHabitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={addHabit} 
      />
    </div>
  );
};

export default App;