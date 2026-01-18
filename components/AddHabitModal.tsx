import React, { useState } from 'react';
import { Frequency, Habit, HabitSuggestion } from '../types';
import { generateHabitSuggestions } from '../services/geminiService';
import { Sparkles, Plus, X, Loader2 } from 'lucide-react';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedDates'>) => void;
}

export const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [targetCount, setTargetCount] = useState(1);
  const [category, setCategory] = useState('health');
  
  const [aiGoal, setAiGoal] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<HabitSuggestion[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
        title,
        description,
        frequency,
        targetCount,
        category: category as any
    });
    resetForm();
    onClose();
  };

  const handleAiGenerate = async () => {
    if (!aiGoal.trim()) return;
    setIsLoadingAi(true);
    const suggestions = await generateHabitSuggestions(aiGoal);
    setAiSuggestions(suggestions);
    setIsLoadingAi(false);
  };

  const acceptSuggestion = (s: HabitSuggestion) => {
      onAdd({
          title: s.title,
          description: s.description,
          frequency: s.frequency as Frequency,
          targetCount: s.targetCount,
          category: s.category as any
      });
      // Optionally stay open or close. Let's close.
      resetForm();
      onClose();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFrequency('daily');
    setTargetCount(1);
    setAiGoal('');
    setAiSuggestions([]);
    setMode('manual');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100 dark:border-slate-800 transition-colors duration-300">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div className="flex gap-4">
                <button 
                    onClick={() => setMode('manual')}
                    className={`text-sm font-medium pb-1 transition-colors ${mode === 'manual' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    Manual Entry
                </button>
                <button 
                    onClick={() => setMode('ai')}
                    className={`text-sm font-medium pb-1 transition-colors flex items-center gap-1 ${mode === 'ai' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    <Sparkles size={14} /> AI Assistant
                </button>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
            {mode === 'manual' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Habit Title</label>
                        <input 
                            required
                            type="text" 
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            placeholder="e.g., Morning Meditation"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                        <textarea 
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            placeholder="Why do you want to do this?"
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
                            <select 
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                value={frequency}
                                onChange={(e) => setFrequency(e.target.value as Frequency)}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Count</label>
                            <input 
                                type="number" 
                                min="1"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                value={targetCount}
                                onChange={(e) => setTargetCount(parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                        <select 
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="health">Health</option>
                            <option value="productivity">Productivity</option>
                            <option value="learning">Learning</option>
                            <option value="mindfulness">Mindfulness</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors mt-2"
                    >
                        <Plus size={18} /> Create Habit
                    </button>
                </form>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">What's your main goal?</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                placeholder="e.g., Get fit for summer, Learn Spanish"
                                value={aiGoal}
                                onChange={(e) => setAiGoal(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                            />
                            <button 
                                onClick={handleAiGenerate}
                                disabled={isLoadingAi || !aiGoal.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-800/50 text-white px-4 rounded-lg flex items-center justify-center transition-colors"
                            >
                                {isLoadingAi ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                            </button>
                        </div>
                    </div>

                    {aiSuggestions.length > 0 && (
                        <div className="space-y-3 mt-4">
                            <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Suggestions</h4>
                            {aiSuggestions.map((s, idx) => (
                                <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors flex justify-between items-center group">
                                    <div>
                                        <h5 className="font-semibold text-slate-800 dark:text-slate-200">{s.title}</h5>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{s.frequency} • {s.targetCount}x • {s.category}</p>
                                    </div>
                                    <button 
                                        onClick={() => acceptSuggestion(s)}
                                        className="bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                        title="Add this habit"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {!isLoadingAi && aiSuggestions.length === 0 && (
                        <div className="text-center py-8 text-slate-400 dark:text-slate-600">
                            <Sparkles size={48} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm">Enter a goal to get AI-powered habit suggestions.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};