import type { RankTier } from '../types';

export const getRequiredEpForLevel = (level: number): number => {
  // Base EP is 75. It increases by 8% every level.
  // Level 1: 75 EP
  // Level 5 (Bronze): ~440 cumulative EP (~1 month)
  // Level 38 (Challenger): ~16,500 cumulative EP (~2.5 - 3 years)
  const baseEp = 75;
  const growthRate = 1.08;
  const rawRequired = baseEp * Math.pow(growthRate, Math.max(1, level) - 1);
  return Math.round(rawRequired / 5) * 5;
};

export const getRankInfo = (level: number): { tier: RankTier; division: string; crestUrl: string; color: string } => {
  const tiers: RankTier[] = [
    'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 
    'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'
  ];
  
  const colors: Record<RankTier, string> = {
    'Iron': 'text-gray-500',
    'Bronze': 'text-amber-700',
    'Silver': 'text-gray-300',
    'Gold': 'text-yellow-400',
    'Platinum': 'text-teal-300',
    'Emerald': 'text-emerald-400',
    'Diamond': 'text-blue-400',
    'Master': 'text-purple-400',
    'Grandmaster': 'text-red-500',
    'Challenger': 'text-cyan-300'
  };

  let tierIndex = 0;
  let division = '';

  if (level <= 35) {
    // 1-35
    tierIndex = Math.floor((level - 1) / 5);
    const divNumber = ((level - 1) % 5); 
    const divisions = ['V', 'IV', 'III', 'II', 'I'];
    division = divisions[divNumber];
  } else if (level === 36) {
    tierIndex = 7; // Master
  } else if (level === 37) {
    tierIndex = 8; // Grandmaster
  } else {
    tierIndex = 9; // Challenger
  }

  const tier = tiers[tierIndex];
  const crestUrl = `/images/ranks/${tier.toLowerCase()}.png`;

  return { tier, division, crestUrl, color: colors[tier] };
};
