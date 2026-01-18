import React, { useMemo } from 'react';
import { Habit, Frequency } from '../types';
import { HabitCard } from './HabitCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';

interface DashboardProps {
  habits: Habit[];
  filter: Frequency | 'all';
  onToggle: (id: string, date: string) => void;
  onDelete: (id: string) => void;
  currentDate: Date;
}

export const Dashboard: React.FC<DashboardProps> = ({ habits, filter, onToggle, onDelete, currentDate }) => {
  
  const filteredHabits = useMemo(() => {
    if (filter === 'all') return habits;
    return habits.filter(h => h.frequency === filter);
  }, [habits, filter]);

  // Analytics Logic
  const stats = useMemo(() => {
    const total = habits.length;
    if (total === 0) return { completionRate: 0, byCategory: [] };

    const completedToday = habits.filter(h => {
       // Only counting "done today" for daily for simplicity in this chart
       // For a real app, this would be more complex
       if (h.frequency === 'daily') {
           return h.completedDates.includes(currentDate.toISOString().split('T')[0]);
       }
       return false; 
    }).length;

    const dailyHabits = habits.filter(h => h.frequency === 'daily').length;
    const rate = dailyHabits > 0 ? Math.round((completedToday / dailyHabits) * 100) : 0;

    const byCategoryMap = new Map<string, number>();
    habits.forEach(h => {
        byCategoryMap.set(h.category, (byCategoryMap.get(h.category) || 0) + 1);
    });

    const byCategory = Array.from(byCategoryMap.entries()).map(([name, value]) => ({ name, value }));
    return { completionRate: rate, byCategory };
  }, [habits, currentDate]);

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#64748B'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Main List */}
      <div className="lg:col-span-2 space-y-4">
        {filteredHabits.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 transition-colors duration-300">
             <div className="text-slate-300 dark:text-slate-600 mb-2">
                 <Activity size={48} className="mx-auto" />
             </div>
             <p className="text-slate-500 dark:text-slate-400 font-medium">No habits found for this view.</p>
             <p className="text-slate-400 dark:text-slate-500 text-sm">Add a new one to get started!</p>
          </div>
        ) : (
          filteredHabits.map(habit => (
            <HabitCard 
              key={habit.id} 
              habit={habit} 
              onToggle={onToggle} 
              onDelete={onDelete}
              currentDate={currentDate}
            />
          ))
        )}
      </div>

      {/* Sidebar / Stats */}
      <div className="space-y-6">
        
        {/* Daily Progress */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-700 dark:to-violet-800 rounded-2xl p-6 text-white shadow-lg transition-colors">
           <h3 className="text-indigo-100 font-medium text-sm uppercase tracking-wider mb-2">Daily Completion</h3>
           <div className="flex items-end gap-2">
              <span className="text-5xl font-bold">{stats.completionRate}%</span>
              <span className="text-indigo-200 mb-1 font-medium">done today</span>
           </div>
           <div className="w-full bg-white/20 h-2 rounded-full mt-4">
              <div className="bg-white h-full rounded-full transition-all duration-700" style={{ width: `${stats.completionRate}%` }}></div>
           </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Habit Mix</h3>
            <div className="h-48 w-full">
                {stats.byCategory.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={stats.byCategory}
                         cx="50%"
                         cy="50%"
                         innerRadius={40}
                         outerRadius={70}
                         paddingAngle={5}
                         dataKey="value"
                         stroke="none"
                       >
                         {stats.byCategory.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }}
                       />
                     </PieChart>
                   </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm">
                        Not enough data
                    </div>
                )}
               
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
                {stats.byCategory.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        <span className="capitalize">{entry.name}</span>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};