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
