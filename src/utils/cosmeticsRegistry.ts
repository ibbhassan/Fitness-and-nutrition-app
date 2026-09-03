import type { UserProfile, RankTier } from '../types';
import { getRankInfo } from './rankUtils';

export type CosmeticType = 'border' | 'banner' | 'title';

export interface CosmeticItem {
  id: string;
  name: string;
  type: CosmeticType;
  category: 'rank' | 'streak' | 'special';
  description: string;
  badgeText?: string;
  cssClass: string;
  badgeClass?: string;
  isUnlockedByDefault?: boolean;
  requiredRank?: RankTier;
  requiredStreak?: number;
}

export const COSMETIC_ITEMS: CosmeticItem[] = [
  // BORDERS (Concept C - Vibrant Laser Halo)
  {
    id: 'border_default',
    name: 'Tactical',
    type: 'border',
    category: 'special',
    description: 'Standard tactical avatar ring.',
    cssClass: 'border-2 border-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.6)]',
    isUnlockedByDefault: true
  },
  {
    id: 'border_bronze',
    name: 'Bronze',
    type: 'border',
    category: 'rank',
    description: 'Unlocked by reaching Bronze Rank.',
    cssClass: 'border-2 border-amber-600 shadow-[0_0_15px_rgba(217,119,6,0.6)]',
    requiredRank: 'Bronze'
  },
  {
    id: 'border_silver',
    name: 'Silver',
    type: 'border',
    category: 'rank',
    description: 'Unlocked by reaching Silver Rank.',
    cssClass: 'border-2 border-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.7)]',
    requiredRank: 'Silver'
  },
  {
    id: 'border_gold',
    name: 'Gold',
    type: 'border',
    category: 'rank',
    description: 'Unlocked by reaching Gold Rank.',
    cssClass: 'border-2 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)]',
    requiredRank: 'Gold'
  },
  {
    id: 'border_platinum',
    name: 'Platinum',
    type: 'border',
    category: 'rank',
    description: 'Unlocked by reaching Platinum Rank.',
    cssClass: 'border-2 border-cyan-400 shadow-[0_0_22px_rgba(34,211,238,0.8)]',
    requiredRank: 'Platinum'
  },
  {
    id: 'border_emerald',
    name: 'Emerald',
    type: 'border',
    category: 'rank',
    description: 'Unlocked by reaching Emerald Rank.',
    cssClass: 'border-2 border-emerald-400 shadow-[0_0_22px_rgba(52,211,153,0.8)] animate-pulse',
    requiredRank: 'Emerald'
  },
  {
    id: 'border_diamond',
    name: 'Diamond',
    type: 'border',
    category: 'rank',
    description: 'Unlocked by reaching Diamond Rank.',
    cssClass: 'border-2 border-cyan-300 shadow-[0_0_25px_rgba(103,232,249,0.9)] animate-pulse',
    requiredRank: 'Diamond'
  },
  {
    id: 'border_master',
    name: 'Master',
    type: 'border',
    category: 'rank',
    description: 'Unlocked by reaching Master Rank.',
    cssClass: 'border-2 border-purple-400 shadow-[0_0_25px_rgba(192,132,252,0.9)] animate-pulse',
    requiredRank: 'Master'
  },
  {
    id: 'border_grandmaster',
    name: 'Grandmaster',
    type: 'border',
    category: 'rank',
    description: 'Unlocked by reaching Grandmaster Rank.',
    cssClass: 'border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.95)] animate-pulse',
    requiredRank: 'Grandmaster'
  },
  {
    id: 'border_challenger',
    name: 'Challenger',
    type: 'border',
    category: 'rank',
    description: 'Unlocked by reaching Challenger Rank.',
    cssClass: 'border-2 border-yellow-300 shadow-[0_0_35px_rgba(253,224,71,1)] animate-pulse',
    requiredRank: 'Challenger'
  },
  {
    id: 'border_titan_180',
    name: '180-Day Titan',
    type: 'border',
    category: 'streak',
    description: 'Unlocked by hitting a 180-Day Streak (6 Months).',
    cssClass: 'border-2 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.95)] animate-pulse',
    requiredStreak: 180
  },
  {
    id: 'border_immortal_365',
    name: '365-Day Immortal 👑',
    type: 'border',
    category: 'streak',
    description: 'Unlocked by achieving the 365-Day IMMORTAL Streak (1 Year).',
    cssClass: 'border-2 border-yellow-300 ring-2 ring-cyan-400 shadow-[0_0_40px_rgba(255,215,0,1)] animate-pulse',
    requiredStreak: 365
  },

  // BANNERS (Dark Matte Carbon Canvas with Left Rank Accent Bar)
  {
    id: 'banner_default',
    name: 'Tactical',
    type: 'banner',
    category: 'special',
    description: 'Standard tactical dark banner.',
    cssClass: 'bg-tactical-950 border-l-4 border-l-neon-blue border-y border-r border-tactical-800',
    isUnlockedByDefault: true
  },
  {
    id: 'banner_bronze',
    name: 'Bronze',
    type: 'banner',
    category: 'rank',
    description: 'Bronze Rank profile banner.',
    cssClass: 'bg-tactical-950 border-l-4 border-l-amber-600 border-y border-r border-tactical-800',
    requiredRank: 'Bronze'
  },
  {
    id: 'banner_silver',
    name: 'Silver',
    type: 'banner',
    category: 'rank',
    description: 'Silver Rank profile banner.',
    cssClass: 'bg-tactical-950 border-l-4 border-l-slate-300 border-y border-r border-tactical-800',
    requiredRank: 'Silver'
  },
  {
    id: 'banner_gold',
    name: 'Gold',
    type: 'banner',
    category: 'rank',
    description: 'Gold Rank profile banner.',
    cssClass: 'bg-tactical-950 border-l-4 border-l-yellow-400 border-y border-r border-tactical-800',
    requiredRank: 'Gold'
  },
  {
    id: 'banner_platinum',
    name: 'Platinum',
    type: 'banner',
    category: 'rank',
    description: 'Platinum Rank profile banner.',
    cssClass: 'bg-tactical-950 border-l-4 border-l-cyan-400 border-y border-r border-tactical-800',
    requiredRank: 'Platinum'
  },
  {
    id: 'banner_emerald',
    name: 'Emerald',
    type: 'banner',
    category: 'rank',
    description: 'Emerald Rank profile banner.',
    cssClass: 'bg-tactical-950 border-l-4 border-l-emerald-400 border-y border-r border-tactical-800',
    requiredRank: 'Emerald'
  },
  {
    id: 'banner_diamond',
    name: 'Diamond',
    type: 'banner',
    category: 'rank',
    description: 'Diamond Rank profile banner.',
    cssClass: 'bg-tactical-950 border-l-4 border-l-cyan-300 border-y border-r border-tactical-800',
    requiredRank: 'Diamond'
  },
  {
    id: 'banner_master',
    name: 'Master',
    type: 'banner',
    category: 'rank',
    description: 'Master Rank profile banner.',
    cssClass: 'bg-tactical-950 border-l-4 border-l-purple-400 border-y border-r border-tactical-800',
    requiredRank: 'Master'
  },
  {
    id: 'banner_grandmaster',
    name: 'Grandmaster',
    type: 'banner',
    category: 'rank',
    description: 'Grandmaster Rank profile banner.',
    cssClass: 'bg-tactical-950 border-l-4 border-l-red-500 border-y border-r border-tactical-800',
    requiredRank: 'Grandmaster'
  },
  {
    id: 'banner_challenger',
    name: 'Challenger',
    type: 'banner',
    category: 'rank',
    description: 'Challenger Rank profile banner.',
    cssClass: 'bg-tactical-950 border-l-4 border-l-yellow-400 border-y border-r border-tactical-800 shadow-[0_0_20px_rgba(250,204,21,0.15)]',
    requiredRank: 'Challenger'
  },
  {
    id: 'banner_titan_180',
    name: '180-Day Titan',
    type: 'banner',
    category: 'streak',
    description: 'Unlocked by hitting a 180-Day Streak.',
    cssClass: 'bg-tactical-950 border-l-4 border-l-orange-500 border-y border-r border-tactical-800',
    requiredStreak: 180
  },
  {
    id: 'banner_immortal_365',
    name: '365-Day Immortal 👑',
    type: 'banner',
    category: 'streak',
    description: 'Unlocked by achieving the 365-Day IMMORTAL Streak.',
    cssClass: 'bg-tactical-950 border-l-4 border-l-yellow-300 border-y border-r border-tactical-800 shadow-[0_0_25px_rgba(255,215,0,0.2)]',
    requiredStreak: 365
  },

  // TITLES (Clean Rank Badges)
  {
    id: 'title_bronze',
    name: 'Bronze',
    type: 'title',
    category: 'rank',
    description: 'Unlocked at Bronze Rank.',
    badgeText: '[BRONZE]',
    cssClass: '',
    badgeClass: 'bg-amber-950/40 border border-amber-700 text-amber-500 font-rajdhani font-bold text-xs uppercase tracking-widest',
    requiredRank: 'Bronze'
  },
  {
    id: 'title_silver',
    name: 'Silver',
    type: 'title',
    category: 'rank',
    description: 'Unlocked at Silver Rank.',
    badgeText: '[SILVER]',
    cssClass: '',
    badgeClass: 'bg-slate-900 border border-slate-400 text-slate-300 font-rajdhani font-bold text-xs uppercase tracking-widest',
    requiredRank: 'Silver'
  },
  {
    id: 'title_gold',
    name: 'Gold',
    type: 'title',
    category: 'rank',
    description: 'Unlocked at Gold Rank.',
    badgeText: '[GOLD]',
    cssClass: '',
    badgeClass: 'bg-yellow-500/20 border border-yellow-400 text-yellow-300 font-rajdhani font-bold text-xs uppercase tracking-widest',
    requiredRank: 'Gold'
  },
  {
    id: 'title_platinum',
    name: 'Platinum',
    type: 'title',
    category: 'rank',
    description: 'Unlocked at Platinum Rank.',
    badgeText: '[PLATINUM]',
    cssClass: '',
    badgeClass: 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-rajdhani font-bold text-xs uppercase tracking-widest',
    requiredRank: 'Platinum'
  },
  {
    id: 'title_emerald',
    name: 'Emerald',
    type: 'title',
    category: 'rank',
    description: 'Unlocked at Emerald Rank.',
    badgeText: '[EMERALD]',
    cssClass: '',
    badgeClass: 'bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-rajdhani font-bold text-xs uppercase tracking-widest',
    requiredRank: 'Emerald'
  },
  {
    id: 'title_diamond',
    name: 'Diamond',
    type: 'title',
    category: 'rank',
    description: 'Unlocked at Diamond Rank.',
    badgeText: '[DIAMOND]',
    cssClass: '',
    badgeClass: 'bg-cyan-500/20 border border-cyan-300 text-cyan-200 font-rajdhani font-bold text-xs uppercase tracking-widest shadow-[0_0_8px_rgba(103,232,249,0.3)]',
    requiredRank: 'Diamond'
  },
  {
    id: 'title_master',
    name: 'Master',
    type: 'title',
    category: 'rank',
    description: 'Unlocked at Master Rank.',
    badgeText: '[MASTER]',
    cssClass: '',
    badgeClass: 'bg-purple-500/20 border border-neon-purple text-purple-200 font-rajdhani font-bold text-xs uppercase tracking-widest shadow-[0_0_10px_rgba(176,38,255,0.3)]',
    requiredRank: 'Master'
  },
  {
    id: 'title_grandmaster',
    name: 'Grandmaster',
    type: 'title',
    category: 'rank',
    description: 'Unlocked at Grandmaster Rank.',
    badgeText: '[GRANDMASTER]',
    cssClass: '',
    badgeClass: 'bg-red-500/20 border border-red-500 text-red-300 font-rajdhani font-extrabold text-xs uppercase tracking-widest shadow-[0_0_12px_rgba(239,68,68,0.4)]',
    requiredRank: 'Grandmaster'
  },
  {
    id: 'title_challenger',
    name: 'Challenger',
    type: 'title',
    category: 'rank',
    description: 'Unlocked at Challenger Rank.',
    badgeText: '[CHALLENGER]',
    cssClass: '',
    badgeClass: 'bg-yellow-500/20 border border-yellow-400 text-yellow-300 font-rajdhani font-black text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(250,204,21,0.5)]',
    requiredRank: 'Challenger'
  },
  {
    id: 'title_titan_180',
    name: '180-Day Titan',
    type: 'title',
    category: 'streak',
    description: 'Unlocked by hitting a 180-Day Streak.',
    badgeText: '[180-DAY TITAN]',
    cssClass: '',
    badgeClass: 'bg-orange-500/20 border border-orange-500 text-orange-400 font-rajdhani font-extrabold text-xs uppercase tracking-widest shadow-[0_0_10px_rgba(249,115,22,0.4)]',
    requiredStreak: 180
  },
  {
    id: 'title_immortal_365',
    name: '365-Day Immortal 👑',
    type: 'title',
    category: 'streak',
    description: 'Unlocked by achieving the 365-Day IMMORTAL Streak.',
    badgeText: '[365-DAY IMMORTAL 👑]',
    cssClass: '',
    badgeClass: 'bg-yellow-400/20 border border-yellow-400 text-yellow-300 font-rajdhani font-black text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-pulse',
    requiredStreak: 365
  }
];

const RANK_HIERARCHY: Record<RankTier, number> = {
  Iron: 1,
  Bronze: 2,
  Silver: 3,
  Gold: 4,
  Platinum: 5,
  Emerald: 6,
  Diamond: 7,
  Master: 8,
  Grandmaster: 9,
  Challenger: 10
};

export const isCosmeticUnlocked = (item: CosmeticItem, profile: UserProfile | null, currentStreak: number): boolean => {
  if (item.isUnlockedByDefault) return true;
  if (!profile) return false;

  if (profile.unlockedCosmetics && profile.unlockedCosmetics.includes(item.id)) {
    return true;
  }

  // Streak check
  if (item.requiredStreak && currentStreak >= item.requiredStreak) {
    return true;
  }

  // Rank check
  if (item.requiredRank) {
    const currentRank = profile.rank || getRankInfo(profile.level).tier;
    const userRankPower = RANK_HIERARCHY[currentRank] || 1;
    const requiredRankPower = RANK_HIERARCHY[item.requiredRank] || 1;
    if (userRankPower >= requiredRankPower) {
      return true;
    }
  }

  return false;
};

export const getCosmeticItem = (id?: string): CosmeticItem | undefined => {
  if (!id) return undefined;
  return COSMETIC_ITEMS.find(item => item.id === id);
};