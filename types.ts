export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  title: string;
  description: string;
  frequency: Frequency;
  targetCount: number; // e.g., 1 per day, 3 per week
  completedDates: string[]; // ISO date strings YYYY-MM-DD
  category: 'health' | 'productivity' | 'learning' | 'mindfulness' | 'other';
  streak: number;
  createdAt: string;
}

export interface AIAdvice {
  text: string;
  type: 'motivation' | 'suggestion' | 'analysis';
}

export interface HabitSuggestion {
  title: string;
  description: string;
  frequency: Frequency;
  targetCount: number;
  category: string;
}
