import React, { useState } from 'react';
import { Habit, Frequency } from '../types';
import { Check, Flame, MoreHorizontal, Trophy, Calendar } from 'lucide-react';
import { getHabitMotivation } from '../services/geminiService';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string, date: string) => void;
  onDelete: (id: string) => void;
  currentDate: Date;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onDelete, currentDate }) => {
  const [motivation, setMotivation] = useState<string | null>(null);
  const [loadingMotivation, setLoadingMotivation] = useState(false);

  // Helper to format date as YYYY-MM-DD
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const todayStr = formatDate(currentDate);

  const isCompletedToday = habit.completedDates.includes(todayStr);
  
  // Calculate progress for non-daily habits
  const getProgress = () => {
    if (habit.frequency === 'daily') return isCompletedToday ? 1 : 0;
    
    const now = new Date(currentDate);
    let startStr = '';
    let endStr = '';

    if (habit.frequency === 'weekly') {
        const day = now.getDay(); // 0 is Sunday
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
        const start = new Date(now.setDate(diff));
        const end = new Date(now.setDate(start.getDate() + 6));
        
        const startOfWeek = new Date(currentDate);
        const dayOfWeek = startOfWeek.getDay() || 7; 
        startOfWeek.setHours(0,0,0,0);
        startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek + 1);
        
        const count = habit.completedDates.filter(d => {
            const date = new Date(d);
            return date >= startOfWeek;
        }).length;
        return count;
    }

    if (habit.frequency === 'monthly') {
        const thisMonth = currentDate.getMonth();
        const thisYear = currentDate.getFullYear();
        const count = habit.completedDates.filter(d => {
            const date = new Date(d);
            return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        }).length;
        return count;
    }
    return 0;
  };

  const progress = getProgress();
  const target = habit.targetCount;
  const isGoalMet = progress >= target;

  const handleMotivation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (motivation) {
        setMotivation(null);
        return;
    }
    setLoadingMotivation(true);
    const msg = await getHabitMotivation(habit);
    setMotivation(msg);
    setLoadingMotivation(false);
  };

  const getFrequencyLabel = () => {
    if (habit.frequency === 'daily') return 'Daily';
    if (habit.frequency === 'weekly') return `${habit.targetCount}x / Week`;
    if (habit.frequency === 'monthly') return `${habit.targetCount}x / Month`;
    return '';
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
        case 'health': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800';
        case 'productivity': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800';
        case 'learning': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800';
        case 'mindfulness': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800';
        default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all relative group">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(habit.category)}`}>
            {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
          </span>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mt-2 text-lg">{habit.title}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-1">{habit.description}</p>
        </div>
        <button onClick={() => onDelete(habit.id)} className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1" title="Current Streak">
                <Flame size={16} className={habit.streak > 0 ? "text-orange-500 fill-orange-500" : "text-slate-300 dark:text-slate-600"} />
                <span className="font-medium">{habit.streak}</span>
            </div>
            <div className="flex items-center gap-1">
               <Calendar size={16} />
               <span>{getFrequencyLabel()}</span>
            </div>
        </div>

        {/* Action Button */}
        {habit.frequency === 'daily' ? (
             <button 
             onClick={() => onToggle(habit.id, todayStr)}
             className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompletedToday ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
           >
             <Check size={20} strokeWidth={3} />
           </button>
        ) : (
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{progress}/{target}</span>
                <button 
                  onClick={() => onToggle(habit.id, todayStr)}
                  disabled={isGoalMet}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isGoalMet ? 'bg-green-500 text-white' : 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-slate-700'}`}
                >
                   {isGoalMet ? <Trophy size={14} /> : <Check size={16} />}
                </button>
            </div>
        )}
       
      </div>

      {/* Progress Bar for non-daily */}
      {habit.frequency !== 'daily' && (
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((progress / target) * 100, 100)}%` }}
            ></div>
        </div>
      )}

      {/* AI Motivation Quick Action */}
      <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800 flex justify-end">
        <button 
            onClick={handleMotivation}
            className="text-xs text-indigo-500 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
        >
            {loadingMotivation ? 'Asking AI...' : 'Spark Motivation ✨'}
        </button>
      </div>
      {motivation && (
          <div className="mt-2 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg text-xs text-indigo-800 dark:text-indigo-200 italic border border-indigo-100 dark:border-indigo-800/50 animate-in fade-in slide-in-from-top-2">
              "{motivation}"
          </div>
      )}
    </div>
  );
};