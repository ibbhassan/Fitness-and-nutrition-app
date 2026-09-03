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
  // BORDERS
  {
    id: 'border_default',
    name: 'Tactical Neon Ring',
    type: 'border',
    category: 'special',
    description: 'Standard tactical neon blue avatar ring.',
    cssClass: 'border-2 border-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.3)]',
    isUnlockedByDefault: true
  },
  {
    id: 'border_bronze',
    name: 'Iron Bronze Ring',
    type: 'border',
    category: 'rank',
    description: 'Unlocked by reaching Bronze Rank.',
    cssClass: 'border-2 border-amber-700 shadow-[0_0_12px_rgba(180,83,9,0.4)]',
    requiredRank: 'Bronze'
  },
  {
    id: 'border_silver',
    name: 'Brushed Silver Ring',
    type: 'border',
    category: 'rank',
    description: 'Unlocked by reaching Silver Rank.',
    cssClass: 'border-2 border-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.4)]',
    requiredRank: 'Silver'
  },
  {
    id: 'border_gold',
    name: 'Radiant Gold Ring',
    type: 'border',
    category: 'rank',
    description: 'Unlocked by reaching Gold Rank.',
    cssClass: 'border-2 border-neon-gold shadow-[0_0_18px_rgba(255,215,0,0.5)]',
    requiredRank: 'Gold'
  },
  {
    id: 'border_platinum',
    name: 'Cyan Cyber Ring',
    type: 'border',
    category: 'rank',
    description: 'Unlocked by reaching Platinum Rank.',
    cssClass: 'border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)]',
    requiredRank: 'Platinum'
  },
  {
    id: 'border_emerald',
    name: 'Emerald Pulse Ring',
    type: 'border',
    category: 'rank',
    description: 'Unlocked by reaching Emerald Rank.',
    cssClass: 'border-2 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]',
    requiredRank: 'Emerald'
  },
  {
    id: 'border_diamond',
    name: 'Crystal Diamond Sparkle',
    type: 'border',
    category: 'rank',
    description: 'Unlocked by reaching Diamond Rank.',
    cssClass: 'border-2 border-cyan-300 ring-1 ring-cyan-200/50 shadow-[0_0_25px_rgba(103,232,249,0.7)]',
    requiredRank: 'Diamond'
  },
  {
    id: 'border_master',
    name: 'Amethyst Particle Ring',
    type: 'border',
    category: 'rank',
    description: 'Unlocked by reaching Master Rank.',
    cssClass: 'border-2 border-neon-purple ring-1 ring-purple-300/40 shadow-[0_0_25px_rgba(176,38,255,0.7)]',
    requiredRank: 'Master'
  },
  {
    id: 'border_grandmaster',
    name: 'Crimson Plasma Halo',
    type: 'border',
    category: 'rank',
    description: 'Unlocked by reaching Grandmaster Rank.',
    cssClass: 'border-2 border-red-500 ring-2 ring-red-400/40 shadow-[0_0_30px_rgba(239,68,68,0.8)]',
    requiredRank: 'Grandmaster'
  },
  {
    id: 'border_challenger',
    name: 'Golden Cosmic Frame',
    type: 'border',
    category: 'rank',
    description: 'Unlocked by reaching Challenger Rank.',
    cssClass: 'border-2 border-yellow-300 ring-2 ring-yellow-400/50 shadow-[0_0_30px_rgba(253,224,71,0.9)]',
    requiredRank: 'Challenger'
  },
  {
    id: 'border_titan_180',
    name: 'Titanium Flame Halo',
    type: 'border',
    category: 'streak',
    description: 'Unlocked by hitting a 180-Day Streak (6 Months).',
    cssClass: 'border-2 border-orange-500 ring-2 ring-orange-500/40 shadow-[0_0_25px_rgba(249,115,22,0.7)]',
    requiredStreak: 180
  },
  {
    id: 'border_immortal_365',
    name: 'Solar Flare Halo 👑',
    type: 'border',
    category: 'streak',
    description: 'Unlocked by achieving the 365-Day IMMORTAL Streak (1 Year).',
    cssClass: 'border-2 border-yellow-300 ring-2 ring-neon-blue shadow-[0_0_30px_rgba(255,215,0,0.95)] animate-pulse',
    requiredStreak: 365
  },

  // BANNERS
  {
    id: 'banner_default',
    name: 'Tactical Mesh',
    type: 'banner',
    category: 'special',
    description: 'Standard tactical dark ambient backdrop.',
    cssClass: 'bg-gradient-to-r from-tactical-900 via-tactical-900 to-neon-blue/10 border-tactical-700',
    isUnlockedByDefault: true
  },
  {
    id: 'banner_bronze',
    name: 'Iron Slate Mesh',
    type: 'banner',
    category: 'rank',
    description: 'Bronze Rank profile banner.',
    cssClass: 'bg-gradient-to-r from-stone-950 via-tactical-900 to-amber-950/30 border-amber-800/40',
    requiredRank: 'Bronze'
  },
  {
    id: 'banner_silver',
    name: 'Metallic Alloy Grid',
    type: 'banner',
    category: 'rank',
    description: 'Silver Rank profile banner.',
    cssClass: 'bg-gradient-to-r from-slate-900 via-tactical-900 to-slate-800/40 border-slate-600/40',
    requiredRank: 'Silver'
  },
  {
    id: 'banner_gold',
    name: 'Sunburst Gold Foil',
    type: 'banner',
    category: 'rank',
    description: 'Gold Rank profile banner.',
    cssClass: 'bg-gradient-to-r from-yellow-950/40 via-tactical-900 to-amber-900/30 border-yellow-500/40',
    requiredRank: 'Gold'
  },
  {
    id: 'banner_platinum',
    name: 'Cyber Platinum Matrix',
    type: 'banner',
    category: 'rank',
    description: 'Platinum Rank profile banner.',
    cssClass: 'bg-gradient-to-r from-cyan-950/40 via-tactical-900 to-slate-900 border-cyan-500/40',
    requiredRank: 'Platinum'
  },
  {
    id: 'banner_emerald',
    name: 'Deep Forest Bio-Grid',
    type: 'banner',
    category: 'rank',
    description: 'Emerald Rank profile banner.',
    cssClass: 'bg-gradient-to-r from-emerald-950/40 via-tactical-900 to-slate-900 border-emerald-500/40',
    requiredRank: 'Emerald'
  },
  {
    id: 'banner_diamond',
    name: 'Prismatic Diamond Mesh',
    type: 'banner',
    category: 'rank',
    description: 'Diamond Rank profile banner.',
    cssClass: 'bg-gradient-to-r from-cyan-950/50 via-tactical-900 to-blue-950/40 border-cyan-400/50',
    requiredRank: 'Diamond'
  },
  {
    id: 'banner_master',
    name: 'Royal Purple Void',
    type: 'banner',
    category: 'rank',
    description: 'Master Rank profile banner.',
    cssClass: 'bg-gradient-to-r from-purple-950/50 via-tactical-900 to-indigo-950/40 border-purple-500/50',
    requiredRank: 'Master'
  },
  {
    id: 'banner_grandmaster',
    name: 'Infernal Crimson Grid',
    type: 'banner',
    category: 'rank',
    description: 'Grandmaster Rank profile banner.',
    cssClass: 'bg-gradient-to-r from-red-950/60 via-tactical-900 to-amber-950/40 border-red-500/50',
    requiredRank: 'Grandmaster'
  },
  {
    id: 'banner_challenger',
    name: 'Golden Cosmic Pantheon',
    type: 'banner',
    category: 'rank',
    description: 'Challenger Rank profile banner.',
    cssClass: 'bg-gradient-to-r from-yellow-950/60 via-tactical-950 to-purple-950/40 border-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.2)]',
    requiredRank: 'Challenger'
  },
  {
    id: 'banner_titan_180',
    name: 'Titanium Foundry',
    type: 'banner',
    category: 'streak',
    description: 'Unlocked by hitting a 180-Day Streak.',
    cssClass: 'bg-gradient-to-r from-orange-950/50 via-tactical-900 to-amber-950/40 border-orange-500/40',
    requiredStreak: 180
  },
  {
    id: 'banner_immortal_365',
    name: 'The Pantheon of Sun 👑',
    type: 'banner',
    category: 'streak',
    description: 'Unlocked by achieving the 365-Day IMMORTAL Streak.',
    cssClass: 'bg-gradient-to-r from-yellow-950/60 via-tactical-950 to-amber-950/50 border-yellow-400/60 shadow-[0_0_30px_rgba(255,215,0,0.25)]',
    requiredStreak: 365
  },

  // TITLES
  {
    id: 'title_bronze',
    name: '[BRONZE FIGHTER]',
    type: 'title',
    category: 'rank',
    description: 'Unlocked at Bronze Rank.',
    badgeText: '[BRONZE FIGHTER]',
    cssClass: '',
    badgeClass: 'bg-amber-950/40 border border-amber-700 text-amber-500 font-rajdhani font-bold text-xs uppercase tracking-widest',
    requiredRank: 'Bronze'
  },
  {
    id: 'title_silver',
    name: '[SILVER COMPETITOR]',
    type: 'title',
    category: 'rank',
    description: 'Unlocked at Silver Rank.',
    badgeText: '[SILVER COMPETITOR]',
    cssClass: '',
    badgeClass: 'bg-slate-900 border border-slate-400 text-slate-300 font-rajdhani font-bold text-xs uppercase tracking-widest',
    requiredRank: 'Silver'
  },
  {
    id: 'title_gold',
    name: '[GOLD VANGUARD]',
    type: 'title',
    category: 'rank',
    description: 'Unlocked at Gold Rank.',
    badgeText: '[GOLD VANGUARD]',
    cssClass: '',
    badgeClass: 'bg-yellow-500/20 border border-yellow-400 text-yellow-300 font-rajdhani font-bold text-xs uppercase tracking-widest',
    requiredRank: 'Gold'
  },
  {
    id: 'title_platinum',
    name: '[PLATINUM STRIKER]',
    type: 'title',
    category: 'rank',
    description: 'Unlocked at Platinum Rank.',
    badgeText: '[PLATINUM STRIKER]',
    cssClass: '',
    badgeClass: 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-rajdhani font-bold text-xs uppercase tracking-widest',
    requiredRank: 'Platinum'
  },
  {
    id: 'title_emerald',
    name: '[EMERALD OVERLORD]',
    type: 'title',
    category: 'rank',
    description: 'Unlocked at Emerald Rank.',
    badgeText: '[EMERALD OVERLORD]',
    cssClass: '',
    badgeClass: 'bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-rajdhani font-bold text-xs uppercase tracking-widest',
    requiredRank: 'Emerald'
  },
  {
    id: 'title_diamond',
    name: '[DIAMOND ELITE]',
    type: 'title',
    category: 'rank',
    description: 'Unlocked at Diamond Rank.',
    badgeText: '[DIAMOND ELITE]',
    cssClass: '',
    badgeClass: 'bg-cyan-500/20 border border-cyan-300 text-cyan-200 font-rajdhani font-bold text-xs uppercase tracking-widest shadow-[0_0_8px_rgba(103,232,249,0.3)]',
    requiredRank: 'Diamond'
  },
  {
    id: 'title_master',
    name: '[MASTER PARAGON]',
    type: 'title',
    category: 'rank',
    description: 'Unlocked at Master Rank.',
    badgeText: '[MASTER PARAGON]',
    cssClass: '',
    badgeClass: 'bg-purple-500/20 border border-neon-purple text-purple-200 font-rajdhani font-bold text-xs uppercase tracking-widest shadow-[0_0_10px_rgba(176,38,255,0.3)]',
    requiredRank: 'Master'
  },
  {
    id: 'title_grandmaster',
    name: '[GRANDMASTER APEX]',
    type: 'title',
    category: 'rank',
    description: 'Unlocked at Grandmaster Rank.',
    badgeText: '[GRANDMASTER APEX]',
    cssClass: '',
    badgeClass: 'bg-red-500/20 border border-red-500 text-red-300 font-rajdhani font-extrabold text-xs uppercase tracking-widest shadow-[0_0_12px_rgba(239,68,68,0.4)]',
    requiredRank: 'Grandmaster'
  },
  {
    id: 'title_challenger',
    name: '[CHALLENGER]',
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
    name: '[180] HALF-YEAR TITAN',
    type: 'title',
    category: 'streak',
    description: 'Unlocked by hitting a 180-Day Streak.',
    badgeText: '[180] HALF-YEAR TITAN',
    cssClass: '',
    badgeClass: 'bg-orange-500/20 border border-orange-500 text-orange-400 font-rajdhani font-extrabold text-xs uppercase tracking-widest shadow-[0_0_10px_rgba(249,115,22,0.4)]',
    requiredStreak: 180
  },
  {
    id: 'title_immortal_365',
    name: '[365] THE IMMORTAL 👑',
    type: 'title',
    category: 'streak',
    description: 'Unlocked by achieving the 365-Day IMMORTAL Streak.',
    badgeText: '[365] THE IMMORTAL 👑',
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