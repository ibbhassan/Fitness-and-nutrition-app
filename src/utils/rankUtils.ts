import type { RankTier } from '../types';

export const getRequiredEpForLevel = (level: number): number => {
  // Tier-based jumps: Base 100, +10 per level within a tier, +100 per new tier
  const safeLevel = Math.max(1, level);
  const tier = Math.floor((safeLevel - 1) / 5);
  const rawRequired = 100 + (tier * 100) + ((safeLevel - 1) % 5) * 10;
  return rawRequired;
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
