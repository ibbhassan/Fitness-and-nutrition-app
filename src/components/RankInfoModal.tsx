import React, { useState } from 'react';
import { X, Info, Flame, Target } from 'lucide-react';
import { getRankInfo, getCumulativeEpForLevel } from '../utils/rankUtils';
import { clsx } from 'clsx';
import type { RankTier } from '../types';

interface RankInfoModalProps {
  onClose: () => void;
}

export const RankInfoModal: React.FC<RankInfoModalProps> = ({ onClose }) => {
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState<number>(5);
  const [averageGrade, setAverageGrade] = useState<'S+'|'S'|'A'|'B'|'C'>('S');
  const [dailyConsistency, setDailyConsistency] = useState<number>(0.75);
  const [weeklyConsistency, setWeeklyConsistency] = useState<number>(0.75);

  const tiers: RankTier[] = [
    'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 
    'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'
  ];

  const getBaseEpForGrade = (grade: string) => {
    switch (grade) {
      case 'S+': return 50;
      case 'S': return 35;
      case 'A': return 25;
      case 'B': return 15;
      case 'C': return 10;
      default: return 25;
    }
  };

  const calculateEstimatedWeeklyEp = () => {
    // 1. Workout EP
    const workoutEp = workoutsPerWeek * getBaseEpForGrade(averageGrade);
    
    // 2. Leg Day Bonus (Assume 2 leg days if 4+ workouts, 1 if 2-3, 0 if 0-1)
    let legDays = 0;
    if (workoutsPerWeek >= 4) legDays = 2;
    else if (workoutsPerWeek >= 2) legDays = 1;
    const legBonusEp = legDays * 10;

    // 3. Streak Bonus
    // Assume they maintain a streak if working out 3+ days and hitting 50%+ dailies
    const maintainsStreak = workoutsPerWeek >= 3 && dailyConsistency >= 0.5;
    const streakBonusEp = maintainsStreak ? workoutsPerWeek * 10 : 0;

    // 4. Daily Quests (20 max EP per day * 7 days)
    const dailyEp = Math.round((20 * 7) * dailyConsistency);

    // 5. Weekly Quests (350 max EP per week)
    const weeklyEp = Math.round(350 * weeklyConsistency);

    return workoutEp + legBonusEp + streakBonusEp + dailyEp + weeklyEp;
  };

  const estimatedWeeklyEp = calculateEstimatedWeeklyEp();

  const formatEstimatedTime = (targetCumulativeEp: number, weeklyEp: number) => {
    if (weeklyEp <= 0) return 'Never';
    if (targetCumulativeEp <= 0) return '0 Days';
    
    const weeks = targetCumulativeEp / weeklyEp;
    
    if (weeks < 1) {
      return `${Math.ceil(weeks * 7)} Days`;
    } else if (weeks < 4) {
      return `${Math.ceil(weeks)} Weeks`;
    } else if (weeks < 52) {
      const months = (weeks / 4.345).toFixed(1);
      return `${months} Months`;
    } else {
      const years = (weeks / 52.14).toFixed(1);
      return `${years} Years`;
    }
  };

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
                  <li className="flex justify-between"><span>S Grade (Excellent):</span> <span className="text-neon-blue font-bold">+35 EP</span></li>
                  <li className="flex justify-between"><span>A Grade (Standard):</span> <span className="text-neon-blue font-bold">+25 EP</span></li>
                  <li className="flex justify-between"><span>B Grade (Light):</span> <span className="text-neon-blue font-bold">+15 EP</span></li>
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
                  <li className="flex justify-between"><span>Streak Bonus (3d to 365d):</span> <span className="text-neon-gold font-bold">+5 to +300 EP</span></li>
                  <li className="flex justify-between"><span>365-Day Legendary Milestone:</span> <span className="text-yellow-400 font-bold">+2,500 EP</span></li>
                  <li className="flex justify-between"><span>Half-Year Titan Milestone:</span> <span className="text-yellow-400 font-bold">+1,000 EP</span></li>
                  <li className="flex justify-between"><span>Daily Challenges:</span> <span className="text-neon-purple font-bold">+20 EP / Day</span></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section: Max Weekly Potential */}
          <section>
            <h3 className="text-lg font-rajdhani font-bold text-neon-purple uppercase tracking-wider mb-4 border-b border-tactical-700 pb-2">Max Weekly Potential</h3>
            <div className="bg-tactical-900 rounded-lg p-4 border border-tactical-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-rajdhani font-bold text-gray-300 text-lg uppercase tracking-wider">Total Maximum</span>
                <span className="text-neon-purple font-bold text-xl">930 EP / Week</span>
              </div>
              <p className="text-sm text-gray-400 font-inter">
                Assuming daily S+ workouts (350), daily step & water quests (140), hitting 2 leg days (20), maintaining a streak (70), and completing all 3 weekly quests (350).
              </p>
            </div>
          </section>

          {/* Section: Rank Estimator */}
          <section>
            <h3 className="text-lg font-rajdhani font-bold text-neon-blue uppercase tracking-wider mb-4 border-b border-tactical-700 pb-2">Rank Progression Estimator</h3>
            <div className="bg-tactical-900 rounded-lg p-4 sm:p-5 border border-tactical-700 space-y-5">
              
              <div className="space-y-4">
                {/* Workouts Per Week */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-rajdhani font-bold text-gray-300 uppercase">Workouts / Week</label>
                    <span className="text-neon-blue font-bold">{workoutsPerWeek}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="7" 
                    value={workoutsPerWeek}
                    onChange={(e) => setWorkoutsPerWeek(Number(e.target.value))}
                    className="w-full accent-neon-blue bg-tactical-700 h-2 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Average Grade */}
                <div>
                  <label className="text-sm font-rajdhani font-bold text-gray-300 uppercase block mb-1">Average Grade</label>
                  <select 
                    value={averageGrade}
                    onChange={(e) => setAverageGrade(e.target.value as any)}
                    className="w-full bg-tactical-800 border border-tactical-600 rounded-lg p-2 text-white font-inter text-sm focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none"
                  >
                    <option value="S+">S+ (Perfect/PR)</option>
                    <option value="S">S (Excellent)</option>
                    <option value="A">A (Standard)</option>
                    <option value="B">B (Light)</option>
                    <option value="C">C (Short/Easy)</option>
                  </select>
                </div>

                {/* Consistency Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-rajdhani font-bold text-gray-300 uppercase block mb-1">Daily Quests</label>
                    <select 
                      value={dailyConsistency}
                      onChange={(e) => setDailyConsistency(Number(e.target.value))}
                      className="w-full bg-tactical-800 border border-tactical-600 rounded-lg p-2 text-white font-inter text-sm focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none"
                    >
                      <option value="1">Perfect (100%)</option>
                      <option value="0.75">Most (75%)</option>
                      <option value="0.5">Half (50%)</option>
                      <option value="0">None (0%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-rajdhani font-bold text-gray-300 uppercase block mb-1">Weekly Quests</label>
                    <select 
                      value={weeklyConsistency}
                      onChange={(e) => setWeeklyConsistency(Number(e.target.value))}
                      className="w-full bg-tactical-800 border border-tactical-600 rounded-lg p-2 text-white font-inter text-sm focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none"
                    >
                      <option value="1">Perfect (100%)</option>
                      <option value="0.75">Most (75%)</option>
                      <option value="0.5">Half (50%)</option>
                      <option value="0">None (0%)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Estimated Output */}
              <div className="mt-4 p-3 bg-tactical-800/50 border border-tactical-600 rounded-lg flex items-center justify-between">
                <span className="font-rajdhani font-bold text-gray-400 uppercase tracking-wider text-sm">Estimated Output</span>
                <span className="text-neon-blue font-bold font-mono">{estimatedWeeklyEp} EP / Week</span>
              </div>
            </div>
          </section>

          {/* Section: The Ladder */}
          <section>
            <h3 className="text-lg font-rajdhani font-bold text-neon-blue uppercase tracking-wider mb-4 border-b border-tactical-700 pb-2">The Ladder</h3>
            <div className="space-y-3">
              {tiers.map((tier, idx) => {
                let baseLevel = idx * 5 + 1;
                if (tier === 'Master') baseLevel = 36;
                else if (tier === 'Grandmaster') baseLevel = 37;
                else if (tier === 'Challenger') baseLevel = 38;
                
                const { crestUrl, color } = getRankInfo(baseLevel);
                
                let cumulativeReq = 0;
                let epRequiredText = '';
                if (tier === 'Iron') {
                  cumulativeReq = 0;
                  epRequiredText = `0 Total EP`;
                } else if (tier === 'Master' || tier === 'Grandmaster' || tier === 'Challenger') {
                  cumulativeReq = getCumulativeEpForLevel(baseLevel);
                  epRequiredText = `${cumulativeReq} Total EP`;
                } else {
                  cumulativeReq = getCumulativeEpForLevel(baseLevel);
                  epRequiredText = `${cumulativeReq} Total EP`;
                }

                const estimatedTimeText = tier === 'Iron' ? 'Day 1' : formatEstimatedTime(cumulativeReq, estimatedWeeklyEp);

                return (
                  <div key={tier} className="bg-tactical-900 rounded-lg p-3 flex items-center gap-4 border border-tactical-700 hover:border-tactical-600 transition-colors">
                    <img src={crestUrl} alt={tier} className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className={clsx("font-rajdhani font-bold text-lg uppercase tracking-wider truncate", color)}>{tier}</h4>
                        {estimatedWeeklyEp > 0 && (
                          <span className="text-neon-gold text-xs font-bold font-rajdhani uppercase tracking-wider whitespace-nowrap bg-tactical-800 px-2 py-0.5 rounded border border-tactical-600">
                            {estimatedTimeText}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-gray-400 text-sm font-inter">
                          {tier === 'Master' ? 'Level 36' : tier === 'Grandmaster' ? 'Level 37' : tier === 'Challenger' ? 'Level 38+' : `Levels ${baseLevel} - ${baseLevel + 4}`}
                        </p>
                        <span className="text-xs font-rajdhani text-gray-300 bg-tactical-800 px-2 py-0.5 rounded border border-tactical-700 whitespace-nowrap shrink-0 ml-2">
                          {epRequiredText}
                        </span>
                      </div>
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
