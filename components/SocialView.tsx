import React, { useState } from 'react';
import { Habit } from '../types';
import { Users, Trophy, Share2, Flame, Star, Crown, Medal, Activity, CheckCircle2, ChevronRight } from 'lucide-react';

interface SocialViewProps {
  userHabits: Habit[];
}

export const SocialView: React.FC<SocialViewProps> = ({ userHabits }) => {
  const [copied, setCopied] = useState(false);
  const [activeFriend, setActiveFriend] = useState<number | null>(null);

  const userTotalStreak = userHabits.reduce((acc, h) => acc + h.streak, 0);
  const userTotalHabits = userHabits.length;
  const userScore = userTotalStreak * 10 + (userTotalHabits * 5);

  const friends = [
    { 
      id: 1, 
      name: 'Alex Rivera', 
      avatar: 'https://i.pravatar.cc/150?u=alex', 
      streak: 45, 
      score: 520, 
      status: 'Completed "Morning Run"',
      habits: [
        { title: 'Morning Run', progress: 5, target: 5, color: 'bg-emerald-500' },
        { title: 'Read Books', progress: 12, target: 20, color: 'bg-blue-500' }
      ]
    },
    { 
      id: 2, 
      name: 'Sarah Chen', 
      avatar: 'https://i.pravatar.cc/150?u=sarah', 
      streak: 12, 
      score: 210, 
      status: 'On a 12 day streak!',
      habits: [
        { title: 'Meditation', progress: 7, target: 7, color: 'bg-purple-500' },
        { title: 'Drink Water', progress: 1, target: 8, color: 'bg-cyan-500' }
      ]
    },
    { 
      id: 3, 
      name: 'Mike Johnson', 
      avatar: 'https://i.pravatar.cc/150?u=mike', 
      streak: 3, 
      score: 85, 
      status: 'Added "Read 30 mins"',
      habits: [
        { title: 'Coding', progress: 2, target: 5, color: 'bg-amber-500' }
      ]
    },
  ];

  const leaderboard = [
    { id: 'user', name: 'You', avatar: null, streak: userTotalStreak, score: userScore, isUser: true },
    ...friends.map(f => ({ ...f, isUser: false }))
  ].sort((a, b) => b.score - a.score);

  const handleShare = () => {
    const topHabit = [...userHabits].sort((a, b) => b.streak - a.streak)[0];
    const text = `🚀 I'm crushing my goals on Orbit Habits! \n\n🔥 Total Streak: ${userTotalStreak} days\n✨ Top Habit: ${topHabit ? `${topHabit.title} (${topHabit.streak} days)` : 'Just started!'}\n\nJoin me in building better habits!`;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-violet-200" /> Friends Circle
          </h2>
          <p className="text-violet-100 mt-1">See what your friends are achieving and stay motivated.</p>
        </div>
        
        <button 
          onClick={handleShare}
          className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 group w-full md:w-auto justify-center"
        >
          {copied ? <CheckCircle2 className="text-green-400" /> : <Share2 className="group-hover:scale-110 transition-transform" />}
          {copied ? 'Link Copied!' : 'Invite Friends'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Trophy className="text-amber-500" size={20} /> Leaderboard
              </h3>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {leaderboard.map((player, index) => (
                <div key={player.id} className={`p-4 flex items-center gap-4 transition-colors ${player.isUser ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                  <div className="w-8 text-center font-bold text-slate-400">
                    {index === 0 ? <Crown size={24} className="text-amber-400 mx-auto" /> : 
                     index === 1 ? <Medal size={24} className="text-slate-400 mx-auto" /> : 
                     index === 2 ? <Medal size={24} className="text-amber-700 mx-auto" /> : 
                     `#${index + 1}`}
                  </div>
                  
                  <div className="w-10 h-10 shrink-0">
                    {player.avatar ? (
                      <img src={player.avatar} alt={player.name} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border-2 border-white dark:border-slate-700 shadow-sm">
                        You
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className={`font-semibold ${player.isUser ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-800 dark:text-slate-200'}`}>
                      {player.name} {player.isUser && '(You)'}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-0.5"><Flame size={12} className="text-orange-500" /> {player.streak} streak</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">{player.score}</div>
                    <div className="text-xs text-slate-400">score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-emerald-500" /> Friends' Progress
            </h3>
            <div className="space-y-5">
              {friends.map((friend) => (
                <div key={friend.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <img src={friend.avatar} alt={friend.name} className="w-6 h-6 rounded-full" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{friend.name}</span>
                  </div>
                  <div className="space-y-2 pl-8">
                    {friend.habits.map((h, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                          <span>{h.title}</span>
                          <span>{h.progress}/{h.target}</span>
                        </div>
                        <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${h.color} transition-all duration-1000`} 
                            style={{ width: `${(h.progress / h.target) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2 text-sm">
              <Star size={16} className="text-amber-400" /> Recommended for you
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Sarah and 2 others recently started "Mindful Minutes". Want to join?
            </p>
            <button className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold py-2 rounded-lg transition-colors">
              Add Habit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
