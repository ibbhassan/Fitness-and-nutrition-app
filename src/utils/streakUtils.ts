import { getLocalDateString } from './dateUtils';
import type { WorkoutLog } from '../types';

export const calculateStreak = (workoutHistory: WorkoutLog[], scheduledWorkoutDays: number[]): number => {
  let streak = 0;
  const today = new Date();
  const todayStr = getLocalDateString(today);
  
  const isTodayLogged = workoutHistory.some(w => getLocalDateString(w.date) === todayStr);
  const d = new Date(today);
  if (!isTodayLogged) {
     d.setDate(d.getDate() - 1);
  }
  
  while(true) {
     const dateStr = getLocalDateString(d);
     const logged = workoutHistory.some(w => getLocalDateString(w.date) === dateStr);
     const isScheduled = scheduledWorkoutDays.includes(d.getDay());
     
     if (logged) {
        streak++;
        d.setDate(d.getDate() - 1);
     } else if (!isScheduled) {
        d.setDate(d.getDate() - 1);
     } else {
        break;
     }
  }
  return streak;
};

export const getStreakBonusEp = (streak: number): number => {
  if (streak >= 365) return 300; // 1 Year Immortal Streak (+300 EP / workout)
  if (streak >= 180) return 150; // Half-Year Titan Streak (+150 EP / workout)
  if (streak >= 90) return 75;   // 3 Month Elite Streak (+75 EP / workout)
  if (streak >= 60) return 50;   // 2 Month Master Streak (+50 EP / workout)
  if (streak >= 30) return 35;   // 1 Month Veteran Streak (+35 EP / workout)
  if (streak >= 14) return 20;   // 2 Week Dedicated Streak (+20 EP / workout)
  if (streak >= 7) return 10;    // 1 Week Consistent Streak (+10 EP / workout)
  if (streak >= 3) return 5;     // 3 Day Rookie Streak (+5 EP / workout)
  return 0;
};

export interface StreakMilestone {
  days: number;
  title: string;
  badge: string;
  bonusEp: number;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 30, title: '1-Month Iron Streak', badge: '🛡️', bonusEp: 100 },
  { days: 60, title: '2-Month Master Streak', badge: '💥', bonusEp: 250 },
  { days: 90, title: 'Quarter-Year Elite Streak', badge: '🌟', bonusEp: 500 },
  { days: 180, title: 'Half-Year Titan Streak', badge: '🔥', bonusEp: 1000 },
  { days: 365, title: 'IMMORTAL 365 LEGENDARY STREAK', badge: '👑', bonusEp: 2500 }
];

export const getStreakMilestoneBonus = (newStreak: number, oldStreak: number): StreakMilestone | null => {
  for (const milestone of STREAK_MILESTONES) {
    if (newStreak >= milestone.days && oldStreak < milestone.days) {
      return milestone;
    }
  }
  return null;
};
