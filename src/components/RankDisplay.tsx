import React from 'react';
import type { UserProfile } from '../types';

import { clsx } from 'clsx';
import { getRankInfo, getRequiredEpForLevel } from '../utils/rankUtils';

interface RankDisplayProps {
  profile: UserProfile;
}

export const RankDisplay: React.FC<RankDisplayProps> = ({ profile }) => {
  const { tier, division, crestUrl, color } = getRankInfo(profile.level);
  const requiredEp = getRequiredEpForLevel(profile.level);
  const progressPercent = Math.min(100, Math.round((profile.lp / requiredEp) * 100));

  return (
    <div className="esports-panel p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 opacity-5">
        <img src={crestUrl} className="w-64 h-64 opacity-20 grayscale" alt="" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        {/* Rank Icon */}
        <div className="w-48 h-48 flex items-center justify-center shrink-0">
          <img 
            src={crestUrl} 
            alt={`${tier} Rank`} 
            className="w-full h-full object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
          />
        </div>

        {/* Rank Info */}
        <div className="flex-1 w-full">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h1 className={clsx("text-3xl font-rajdhani font-bold uppercase tracking-wider", color)}>
                {tier} {division}
              </h1>
              <p className="text-gray-400 font-inter">Level {profile.level} • {profile.currentMode} Mode</p>
            </div>
            <div className="text-right">
              <span className={clsx("text-2xl font-rajdhani font-bold", color)}>{Math.floor(profile.lp)}</span>
              <span className="text-gray-400 font-rajdhani ml-1">/ {requiredEp} EP</span>
            </div>
          </div>

          {/* LP Progress Bar */}
          <div className="h-4 w-full bg-black/60 shadow-inner rounded-full overflow-hidden border border-tactical-700 relative">
            <div 
              className={clsx("h-full relative shadow-[0_0_10px_rgba(255,255,255,0.2)]", color.replace('text-', 'bg-'))}
              style={{ width: `${progressPercent}%` }}
            >
              {/* Glow effect on the bar */}
              <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white/50 to-transparent" />
            </div>
          </div>
          
          {/* Promo Series Info (if active) */}
          {profile.inPromoSeries && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-rajdhani text-neon-purple uppercase">Promo Series:</span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className={clsx(
                      "w-4 h-4 rounded-full border border-tactical-600",
                      i < profile.promoWins ? "bg-neon-green border-neon-green" : 
                      i < profile.promoWins + profile.promoLosses ? "bg-neon-red border-neon-red" : "bg-tactical-900"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
