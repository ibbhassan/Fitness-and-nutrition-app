import type { RankTier } from '../types';

export const getRequiredEpForLevel = (level: number): number => {
  const safeLevel = Math.max(1, level);
  
  // The True Endgame Wall (Hardcoded Spikes)
  if (safeLevel === 36) return 22500; // Master
  if (safeLevel === 37) return 30000; // Grandmaster
  if (safeLevel >= 38) return 50000;  // Challenger+
  
  // The Normal Grind: 12% exponential growth (Levels 1-35)
  return Math.floor(100 * Math.pow(1.12, safeLevel - 1));
};

export const getCumulativeEpForLevel = (level: number): number => {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getRequiredEpForLevel(i);
  }
  return total;
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

  const safeLevel = Math.max(1, level || 1);

  if (safeLevel <= 35) {
    // 1-35
    tierIndex = Math.floor((safeLevel - 1) / 5);
    const divNumber = ((safeLevel - 1) % 5); 
    const divisions = ['V', 'IV', 'III', 'II', 'I'];
    division = divisions[divNumber];
  } else if (safeLevel === 36) {
    tierIndex = 7; // Master
  } else if (safeLevel === 37) {
    tierIndex = 8; // Grandmaster
  } else {
    tierIndex = 9; // Challenger
  }

  const tier = tiers[tierIndex] || 'Iron';
  const crestUrl = `/images/ranks/${tier.toLowerCase()}.png`;

  return { tier, division, crestUrl, color: colors[tier] };
};
