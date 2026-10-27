export const getLocalDateString = (d: Date | string = new Date()) => {
  const date = typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)
    ? new Date(d + 'T12:00:00')
    : new Date(d);
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
};

export const getWeekString = (d: Date | string = new Date()) => {
  const date = typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)
    ? new Date(d + 'T12:00:00')
    : new Date(d);
  const daysSinceFriday = (date.getDay() + 2) % 7;
  const friday = new Date(date);
  friday.setDate(date.getDate() - daysSinceFriday);
  return getLocalDateString(friday);
};

export const getPreviousWeekString = (d: Date | string = new Date()) => {
  const date = typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)
    ? new Date(d + 'T12:00:00')
    : new Date(d);
  const daysSinceFriday = (date.getDay() + 2) % 7;
  const prevFriday = new Date(date);
  prevFriday.setDate(date.getDate() - daysSinceFriday - 7);
  return getLocalDateString(prevFriday);
};

export const calculateWeeklyEpForWeek = (
  workoutHistory?: { date: string; epChange?: number }[],
  manualQuestCompletions?: Record<string, boolean>,
  weekStr: string = getWeekString(),
  profile?: { weeklyEp?: number; weeklyEpWeek?: string; weeklyEpByWeek?: Record<string, number> }
): number => {
  let total = 0;

  if (Array.isArray(workoutHistory)) {
    workoutHistory.forEach(w => {
      if (w?.date && getWeekString(w.date) === weekStr) {
        total += w.epChange || 0;
      }
    });
  }

  if (manualQuestCompletions && typeof manualQuestCompletions === 'object') {
    if (manualQuestCompletions[`weekly-workouts-${weekStr}`]) total += 100;
    if (manualQuestCompletions[`weekly-pr-${weekStr}`]) total += 50;
    if (manualQuestCompletions[`weekly-nutrition-${weekStr}`]) total += 200;

    Object.keys(manualQuestCompletions).forEach(key => {
      if (!manualQuestCompletions[key]) return;
      if (key.startsWith('daily-steps-') || key.startsWith('daily-duration-') || key.startsWith('daily-water-')) {
        const datePart = key.slice(-10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart) && getWeekString(datePart) === weekStr) {
          total += 10;
        }
      }
    });
  }

  const storedForWeek = profile?.weeklyEpByWeek?.[weekStr];
  if (typeof storedForWeek === 'number') {
    total = Math.max(total, storedForWeek);
  } else if (profile?.weeklyEpWeek === weekStr && typeof profile?.weeklyEp === 'number') {
    total = Math.max(total, profile.weeklyEp);
  }

  return total;
};

export const getTimeUntilNextReset = () => {
  const now = new Date();
  const nextFriday = new Date(now);
  const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7;
  
  nextFriday.setDate(now.getDate() + daysUntilFriday);
  nextFriday.setHours(0, 0, 0, 0);

  const diffMs = nextFriday.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return `${diffDays}D ${diffHours}H`;
};

