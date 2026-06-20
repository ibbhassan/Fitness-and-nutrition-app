import React from 'react';
import type { UserProfile } from '../types';
import { Shield } from 'lucide-react';
import { clsx } from 'clsx';

interface RankDisplayProps {
  profile: UserProfile;
}

export const RankDisplay: React.FC<RankDisplayProps> = ({ profile }) => {
  return (
    <div className="esports-panel p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 opacity-5">
        <Shield className="w-64 h-64" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        {/* Rank Icon (Placeholder) */}
        <div className="w-32 h-32 rounded-full border-4 border-neon-gold flex items-center justify-center bg-tactical-900 shadow-[0_0_30px_rgba(255,215,0,0.2)]">
          <Shield className="w-16 h-16 text-neon-gold" />
        </div>

        {/* Rank Info */}
        <div className="flex-1 w-full">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h1 className="text-3xl font-rajdhani font-bold text-white uppercase tracking-wider">{profile.rank} Tier</h1>
              <p className="text-gray-400 font-inter">Level {profile.level} • {profile.currentMode} Mode</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-rajdhani font-bold text-neon-blue">{profile.lp}</span>
              <span className="text-gray-400 font-rajdhani ml-1">/ 100 EP</span>
            </div>
          </div>

          {/* LP Progress Bar */}
          <div className="h-4 w-full bg-tactical-900 rounded-full overflow-hidden border border-tactical-700 relative">
            <div 
              className="h-full bg-neon-blue relative"
              style={{ width: `${profile.lp}%` }}
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
