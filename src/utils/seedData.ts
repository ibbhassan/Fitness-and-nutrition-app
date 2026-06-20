import type { UserProfile, MatchHistoryEntry, DailyNutrition } from '../types';

export const seedProfile: UserProfile = {
  name: "Recruit",
  level: 1,
  rank: 'Bronze',
  lp: 0,
  inPromoSeries: false,
  promoWins: 0,
  promoLosses: 0,
  currentMode: 'Cut',
  stats: {
    strength: 10,
    endurance: 10,
    consistency: 10,
    power: 10,
    hypertrophy: 10,
    volume: 10,
  }
};

export const seedMatchHistory: MatchHistoryEntry[] = [];

export const seedNutrition: DailyNutrition = {
  calories: { current: 0, target: 2000 },
  protein: { current: 0, target: 150 },
  carbs: { current: 0, target: 200 },
  fat: { current: 0, target: 65 },
};

export const seedSteps = {
  current: 0,
  target: 10000
};
