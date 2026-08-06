import React from 'react';
import { X, Info, Flame, Target } from 'lucide-react';
import { getRankInfo, getRequiredEpForLevel } from '../utils/rankUtils';
import { clsx } from 'clsx';
import type { RankTier } from '../types';

interface RankInfoModalProps {
  onClose: () => void;
}

export const RankInfoModal: React.FC<RankInfoModalProps> = ({ onClose }) => {
  const tiers: RankTier[] = [
    'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 
    'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-safe">
      <div className="absolute inset-0 bg-tactical-900/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-tactical-800 border border-tactical-600 rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-tactical-700 bg-tactical-900 shrink-0 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Info className="w-6 h-6 text-neon-blue" />
            <h2 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider">Rank & EP Guide</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-8">
          
          {/* Section: How to get EP */}
          <section>
            <h3 className="text-lg font-rajdhani font-bold text-neon-gold uppercase tracking-wider mb-4 border-b border-tactical-700 pb-2">How to earn EP</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-tactical-900 p-4 rounded-lg border border-tactical-700">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-neon-blue" />
                  <h4 className="font-rajdhani font-bold text-white uppercase">Workout Grades</h4>
                </div>
                <ul className="text-sm text-gray-400 space-y-1 font-inter">
                  <li className="flex justify-between"><span>S+ Grade (Perfect/PR):</span> <span className="text-neon-blue font-bold">+50 EP</span></li>
                  <li className="flex justify-between"><span>S Grade:</span> <span className="text-neon-blue font-bold">+35 EP</span></li>
                  <li className="flex justify-between"><span>A Grade (Standard):</span> <span className="text-neon-blue font-bold">+25 EP</span></li>
                  <li className="flex justify-between"><span>C Grade (Short/Easy):</span> <span className="text-neon-blue font-bold">+10 EP</span></li>
                </ul>
              </div>

              <div className="bg-tactical-900 p-4 rounded-lg border border-tactical-700">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-neon-red" />
                  <h4 className="font-rajdhani font-bold text-white uppercase">Bonuses & Quests</h4>
                </div>
                <ul className="text-sm text-gray-400 space-y-1 font-inter">
                  <li className="flex justify-between"><span>Leg Day Bonus:</span> <span className="text-neon-gold font-bold">+10 EP</span></li>
                  <li className="flex justify-between"><span>20+ Day Streak:</span> <span className="text-neon-gold font-bold">+10 EP</span></li>
                  <li className="flex justify-between"><span>Daily Steps (10k+):</span> <span className="text-neon-purple font-bold">+10 EP</span></li>
                  <li className="flex justify-between"><span>Weekly Quests:</span> <span className="text-neon-purple font-bold">Varies</span></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section: The Ladder */}
          <section>
            <h3 className="text-lg font-rajdhani font-bold text-neon-blue uppercase tracking-wider mb-4 border-b border-tactical-700 pb-2">The Ladder</h3>
            <div className="space-y-3">
              {tiers.map((tier, idx) => {
                const baseLevel = idx * 5 + 1;
                const { crestUrl, color } = getRankInfo(baseLevel);
                
                let epRequiredText = '';
                if (tier === 'Master' || tier === 'Grandmaster' || tier === 'Challenger') {
                  const req = getRequiredEpForLevel(baseLevel);
                  epRequiredText = `${req} EP per level`;
                } else {
                  const reqStart = getRequiredEpForLevel(baseLevel);
                  const reqEnd = getRequiredEpForLevel(baseLevel + 4);
                  epRequiredText = `${reqStart} - ${reqEnd} EP per level`;
                }

                return (
                  <div key={tier} className="bg-tactical-900 rounded-lg p-3 flex items-center gap-4 border border-tactical-700 hover:border-tactical-600 transition-colors">
                    <img src={crestUrl} alt={tier} className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
                    <div className="flex-1">
                      <h4 className={clsx("font-rajdhani font-bold text-lg uppercase tracking-wider", color)}>{tier}</h4>
                      <p className="text-gray-400 text-sm font-inter">
                        {tier === 'Master' ? 'Level 36' : tier === 'Grandmaster' ? 'Level 37' : tier === 'Challenger' ? 'Level 38+' : `Levels ${baseLevel} - ${baseLevel + 4}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-rajdhani text-gray-300 bg-tactical-800 px-2 py-1 rounded border border-tactical-700">{epRequiredText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
