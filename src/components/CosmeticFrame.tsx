import React from 'react';
import clsx from 'clsx';
import { getCosmeticItem } from '../utils/cosmeticsRegistry';

interface CosmeticFrameProps {
  borderId?: string;
  avatarUrl: string;
  sizeClassName?: string;
  alt?: string;
  className?: string;
}

export const CosmeticFrame: React.FC<CosmeticFrameProps> = ({
  borderId,
  avatarUrl,
  sizeClassName = 'w-20 h-20',
  alt = 'Avatar',
  className
}) => {
  const borderItem = getCosmeticItem(borderId) || getCosmeticItem('border_default');
  const id = borderItem?.id || 'border_default';

  const isBronzeOrSilver = id === 'border_bronze' || id === 'border_silver';
  const isGoldOrPlatinum = id === 'border_gold' || id === 'border_platinum';
  const isEmeraldOrDiamond = id === 'border_emerald' || id === 'border_diamond';
  const isMasterOrGrandmaster = id === 'border_master' || id === 'border_grandmaster';
  const isChallengerOrImmortal = id === 'border_challenger' || id === 'border_immortal_365' || id === 'border_titan_180';

  return (
    <div className={clsx("relative flex items-center justify-center shrink-0 group", sizeClassName, className)}>
      {/* Base Avatar Circle */}
      <div className={clsx(
        "w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-tactical-900 relative z-10 transition-all duration-300",
        borderItem?.cssClass || 'border-2 border-neon-blue'
      )}>
        <img src={avatarUrl} alt={alt} className="w-full h-full object-cover scale-105" />
      </div>

      {/* Tier 1 & 2: Riveted Tactical Brackets (Bronze & Silver) */}
      {isBronzeOrSilver && (
        <div className="absolute -inset-1.5 pointer-events-none z-20 flex items-center justify-center">
          <svg className="w-full h-full text-slate-300/80" viewBox="0 0 100 100" fill="none">
            {/* Corner Brackets */}
            <path d="M 18 28 L 18 18 L 28 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 72 18 L 82 18 L 82 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 82 72 L 82 82 L 72 82" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 28 82 L 18 82 L 18 72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* Tier 3 & 4: Side Chevrons & Corner Brackets (Gold & Platinum) */}
      {isGoldOrPlatinum && (
        <div className="absolute -inset-2 pointer-events-none z-20 flex items-center justify-center">
          <svg className={clsx("w-full h-full drop-shadow-md", id === 'border_gold' ? "text-yellow-400" : "text-cyan-400")} viewBox="0 0 100 100" fill="none">
            {/* Corner Brackets */}
            <path d="M 15 25 L 15 15 L 25 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M 75 15 L 85 15 L 85 25" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M 85 75 L 85 85 L 75 85" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M 25 85 L 15 85 L 15 75" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            
            {/* Left Chevrons */}
            <path d="M 6 45 L 2 50 L 6 55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 10 45 L 6 50 L 10 55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Right Chevrons */}
            <path d="M 94 45 L 98 50 L 94 55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 90 45 L 94 50 L 90 55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Tier 5 & 6: Hexagonal Energy Shield & Crystal Node Badges (Emerald & Diamond) */}
      {isEmeraldOrDiamond && (
        <div className="absolute -inset-2.5 pointer-events-none z-20 flex items-center justify-center">
          <svg className={clsx("w-full h-full animate-pulse", id === 'border_emerald' ? "text-emerald-400" : "text-cyan-300")} viewBox="0 0 100 100" fill="none">
            {/* Hex Outer Grid */}
            <polygon points="50,4 90,25 90,75 50,96 10,75 10,25" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" opacity="0.8" />
            
            {/* 4 Crystal Nodes (Top, Bottom, Left, Right) */}
            <polygon points="50,0 54,6 50,12 46,6" fill="currentColor" />
            <polygon points="50,88 54,94 50,100 46,94" fill="currentColor" />
            <polygon points="0,50 6,46 12,50 6,54" fill="currentColor" />
            <polygon points="88,50 94,46 100,50 94,54" fill="currentColor" />
          </svg>
        </div>
      )}

      {/* Tier 7 & 8: Floating Wings & Gemstone Crown (Master & Grandmaster) */}
      {isMasterOrGrandmaster && (
        <div className="absolute -inset-3.5 pointer-events-none z-20 flex items-center justify-center">
          <svg className={clsx("w-full h-full drop-shadow-[0_0_12px_rgba(0,0,0,0.8)]", id === 'border_master' ? "text-purple-400" : "text-red-500")} viewBox="0 0 100 100" fill="none">
            {/* Top Crown Gem */}
            <path d="M 50 2 L 56 10 L 50 18 L 44 10 Z" fill="currentColor" />
            <path d="M 40 12 L 50 4 L 60 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

            {/* Left Wing Feathers */}
            <path d="M 18 35 C 8 30 2 40 4 55 C 6 65 14 72 20 75" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 22 40 C 12 36 6 45 8 58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Right Wing Feathers */}
            <path d="M 82 35 C 92 30 98 40 96 55 C 94 65 86 72 80 75" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 78 40 C 88 36 94 45 92 58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      )}

      {/* Tier 9 & 10: The Golden Cosmic Crown & Solar Wings (Challenger & 365-Day Immortal) */}
      {isChallengerOrImmortal && (
        <div className="absolute -inset-4 pointer-events-none z-20 flex items-center justify-center">
          <svg className="w-full h-full text-yellow-300 drop-shadow-[0_0_15px_rgba(250,204,21,0.9)] animate-pulse" viewBox="0 0 100 100" fill="none">
            {/* Royal Crown Header */}
            <path d="M 35 14 L 42 22 L 50 10 L 58 22 L 65 14 L 62 26 L 38 26 Z" fill="currentColor" stroke="black" strokeWidth="1" />
            <circle cx="50" cy="8" r="3" fill="#00F0FF" />
            <circle cx="35" cy="12" r="2" fill="#FA22FF" />
            <circle cx="65" cy="12" r="2" fill="#FA22FF" />

            {/* Majestic Wings Left */}
            <path d="M 22 30 C 6 22 -2 38 2 56 C 5 70 16 80 26 84" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 26 38 C 12 32 4 44 8 60 C 12 72 20 78 28 80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Majestic Wings Right */}
            <path d="M 78 30 C 94 22 102 38 98 56 C 95 70 84 80 74 84" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 74 38 C 88 32 96 44 92 60 C 88 72 80 78 72 80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Bottom Starburst Crest */}
            <path d="M 50 88 L 53 94 L 60 94 L 54 98 L 57 104 L 50 100 L 43 104 L 46 98 L 40 94 L 47 94 Z" fill="currentColor" stroke="black" strokeWidth="0.5" />
          </svg>
        </div>
      )}
    </div>
  );
};
