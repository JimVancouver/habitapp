import React, { useState, useMemo } from 'react';
import { Habit } from '../types';
import { ChevronLeft, ChevronRight, X, Calendar as CalIcon, PartyPopper, Filter, Check } from 'lucide-react';

interface CalendarViewProps {
  habits: Habit[];
  onToggle: (id: string, date: string) => void;
}

// Helper to get array of dates for the calendar grid
const getCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
  
  const days = [];
  
  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthLastDay - i, type: 'prev', fullDate: new Date(year, month - 1, prevMonthLastDay - i) });
  }
  
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, type: 'current', fullDate: new Date(year, month, i) });
  }
  
  // Next month padding
  const remainingCells = 42 - days.length; // 6 rows * 7 columns
  for (let i = 1; i <= remainingCells; i++) {
    days.push({ day: i, type: 'next', fullDate: new Date(year, month + 1, i) });
  }
  
  return days;
};

// Fun Checkbox Component (Used in Modal)
const FunCheckbox = ({ checked, onChange, colorClass }: { checked: boolean, onChange: () => void, colorClass: string }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!checked) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);
    }
    onChange();
  };

  // Generate random particles
  const particles = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => {
      const angle = (i * 360) / 8;
      const distance = 20;
      const x = Math.cos(angle * (Math.PI / 180)) * distance;
      const y = Math.sin(angle * (Math.PI / 180)) * distance;
      return { x, y, color: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'][i % 4] };
    });
  }, []);

  return (
    <div className="relative inline-flex items-center justify-center">
      <div 
        onClick={handleClick}
        className={`w-6 h-6 rounded-md border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
            checked 
            ? `${colorClass} border-transparent animate-check-bounce` 
            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-indigo-400'
        }`}
      >
        {checked && (
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polyline points="20 6 9 17 4 12"></polyline>
             </svg>
        )}
      </div>
      
      {/* Particle Effects */}
      {isAnimating && particles.map((p, i) => (
         <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full pointer-events-none animate-particle-out"
            style={{
                backgroundColor: p.color,
                left: '50%',
                top: '50%',
                '--tw-translate-x': `${p.x}px`,
                '--tw-translate-y': `${p.y}px`,
            } as React.CSSProperties}
         />
      ))}
    </div>
  );
};

export const CalendarView: React.FC<CalendarViewProps> = ({ habits, onToggle }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all');

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = getCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
  const todayStr = new Date().toISOString().split('T')[0];

  const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const getCellStatus = (date: Date) => {
    const dateStr = formatDateKey(date);
    
    if (selectedHabitId === 'all') {
        // Aggregate Mode
        const completedCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
        return { count: completedCount, isSpecificCompleted: false };
    } else {
        // Specific Habit Mode
        const habit = habits.find(h => h.id === selectedHabitId);
        const isCompleted = habit?.completedDates.includes(dateStr) || false;
        return { count: isCompleted ? 1 : 0, isSpecificCompleted: isCompleted };
    }
  };

  const handleCellClick = (date: Date) => {
      if (selectedHabitId === 'all') {
          setSelectedDate(date);
      } else {
          // Direct Toggle
          const dateStr = formatDateKey(date);
          onToggle(selectedHabitId, dateStr);
      }
  };

  const getDayClasses = (count: number, isSpecificCompleted: boolean, isSelected: boolean, isToday: boolean, isCurrentMonth: boolean) => {
    let classes = "aspect-square rounded-xl p-1 flex flex-col items-center justify-center relative transition-all duration-300 border ";
    
    // Opacity for non-current month
    if (!isCurrentMonth) classes += "opacity-30 ";

    // Selection ring
    if (isSelected && selectedHabitId === 'all') classes += "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 z-10 ";

    if (selectedHabitId !== 'all') {
        // Specific Habit Styling (Direct Toggle)
        if (isSpecificCompleted) {
            classes += "bg-indigo-500 dark:bg-indigo-600 border-indigo-600 dark:border-indigo-500 text-white shadow-md transform scale-[1.02] ";
        } else {
            classes += "hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-400 ";
            if (isToday) classes += "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold ";
        }
    } else {
        // Aggregate Styling (Heatmap style)
        if (count > 0) {
            if (count === 1) classes += "bg-indigo-100 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-800 ";
            else if (count === 2) classes += "bg-indigo-200 dark:bg-indigo-900/60 border-indigo-300 dark:border-indigo-700 ";
            else classes += "bg-indigo-300 dark:bg-indigo-900/80 border-indigo-400 dark:border-indigo-600 ";
            
            classes += "text-indigo-900 dark:text-indigo-100 shadow-sm ";
        } else {
            classes += "border-transparent ";
            if (isToday) classes += "bg-slate-100 dark:bg-slate-800 font-bold ";
            else classes += "hover:bg-slate-50 dark:hover:bg-slate-800/50 ";
            classes += "text-slate-700 dark:text-slate-300 ";
        }
        if (isToday && count === 0) classes += "text-indigo-600 dark:text-indigo-400 ";
    }
    
    return classes;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Habit Selector - Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
         <button
            onClick={() => setSelectedHabitId('all')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                selectedHabitId === 'all' 
                ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
         >
            All Habits
         </button>
         {habits.map(h => (
             <button
                key={h.id}
                onClick={() => setSelectedHabitId(h.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors border flex items-center gap-1.5 ${
                    selectedHabitId === h.id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
             >
                {selectedHabitId === h.id && <Check size={12} strokeWidth={3} />}
                {h.title}
             </button>
         ))}
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
           <CalIcon className="text-indigo-500" />
           {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors text-slate-600 dark:text-slate-400">
                <ChevronLeft size={20} />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="text-xs font-semibold px-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">Today</button>
            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors text-slate-600 dark:text-slate-400">
                <ChevronRight size={20} />
            </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-2">
                {d}
            </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, idx) => {
            const dateStr = formatDateKey(d.fullDate);
            const { count, isSpecificCompleted } = getCellStatus(d.fullDate);
            const isToday = dateStr === todayStr;
            const isSelected = selectedDate && formatDateKey(selectedDate) === dateStr;
            const isCurrentMonth = d.type === 'current';

            return (
                <button
                    key={idx}
                    onClick={() => handleCellClick(d.fullDate)}
                    className={getDayClasses(count, isSpecificCompleted, isSelected, isToday, isCurrentMonth)}
                >
                    <span className="text-sm z-10 relative">{d.day}</span>
                    
                    {/* Checkmark for Specific Habit View */}
                    {selectedHabitId !== 'all' && isSpecificCompleted && (
                        <div className="absolute inset-0 flex items-center justify-center text-white/20">
                             <Check size={24} strokeWidth={4} />
                        </div>
                    )}
                </button>
            );
        })}
      </div>

      {/* Day Detail Modal/Panel (Only for 'All' view) */}
      {selectedDate && selectedHabitId === 'all' && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
              <div 
                className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 border border-slate-100 dark:border-slate-800"
                onClick={(e) => e.stopPropagation()}
              >
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                      <div>
                          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                             {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Manage your habits for this day</p>
                      </div>
                      <button onClick={() => setSelectedDate(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
                      {habits.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                              No habits to track. Add some!
                          </div>
                      ) : (
                          habits.map(habit => {
                              const dateKey = formatDateKey(selectedDate);
                              const isCompleted = habit.completedDates.includes(dateKey);
                              
                              return (
                                  <div 
                                    key={habit.id} 
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                                        isCompleted 
                                        ? 'bg-indigo-100 border-indigo-300 shadow-md dark:bg-indigo-900/60 dark:border-indigo-700 transform scale-[1.02]' 
                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
                                    }`}
                                  >
                                      <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded transition-colors ${
                                                  isCompleted 
                                                  ? 'bg-white/50 text-indigo-700 dark:bg-black/20 dark:text-indigo-200' 
                                                  : 'text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300'
                                              } capitalize`}>
                                                  {habit.frequency}
                                              </span>
                                              <h4 className={`font-medium transition-colors ${isCompleted ? 'text-indigo-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>{habit.title}</h4>
                                          </div>
                                          {habit.frequency !== 'daily' && (
                                              <p className={`text-xs mt-0.5 ml-1 transition-colors ${isCompleted ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500'}`}>Target: {habit.targetCount}/{habit.frequency}</p>
                                          )}
                                      </div>
                                      
                                      <div className="pl-4">
                                         <FunCheckbox 
                                            checked={isCompleted} 
                                            onChange={() => onToggle(habit.id, dateKey)}
                                            colorClass="bg-indigo-600 dark:bg-indigo-500"
                                         />
                                      </div>
                                  </div>
                              );
                          })
                      )}
                  </div>
                  
                  {/* Footer motivation */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium flex items-center justify-center gap-1">
                          <PartyPopper size={14} /> Keep up the streak!
                      </p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};