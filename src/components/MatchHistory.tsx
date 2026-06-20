import React from 'react';
import { clsx } from 'clsx';
import type { MatchHistoryEntry } from '../types';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MatchHistoryProps {
  history: MatchHistoryEntry[];
}

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'S+': return 'text-neon-gold drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]';
    case 'S': return 'text-neon-purple drop-shadow-[0_0_8px_rgba(176,38,255,0.8)]';
    case 'A': return 'text-neon-blue';
    case 'B': return 'text-neon-green';
    default: return 'text-gray-400';
  }
};

export const MatchHistory: React.FC<MatchHistoryProps> = ({ history }) => {
  return (
    <div className="esports-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="esports-heading text-xl text-white">Workout History</h2>
        <span className="text-sm text-gray-400">Last 5 Workouts</span>
      </div>

      <div className="space-y-4">
        {history.map((match) => (
          <div 
            key={match.id} 
            className="flex items-center p-4 bg-tactical-900 rounded-md border border-tactical-700 hover:border-tactical-600 transition-colors"
          >
            {/* Grade Column */}
            <div className="w-16 flex flex-col items-center justify-center border-r border-tactical-700 pr-4">
              <span className={clsx("font-rajdhani font-bold text-3xl", getGradeColor(match.grade))}>
                {match.grade}
              </span>
            </div>

            {/* Info Column */}
            <div className="flex-1 px-4">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-medium">{match.title}</h3>
                {match.isPr && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-neon-gold/20 text-neon-gold border border-neon-gold/50 rounded flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> PR
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">{match.durationMinutes} min • {match.date}</p>
              {match.notes && <p className="text-xs text-gray-500 mt-2 italic">"{match.notes}"</p>}
            </div>

            {/* LP Column */}
            <div className="w-20 flex flex-col items-end pl-4 border-l border-tactical-700">
              <span className="text-xs text-gray-400 font-rajdhani uppercase mb-1">EP</span>
              <div className={clsx(
                "flex items-center font-bold",
                match.lpChange > 0 ? "text-neon-green" : match.lpChange < 0 ? "text-neon-red" : "text-gray-400"
              )}>
                {match.lpChange > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : match.lpChange < 0 ? <TrendingDown className="w-4 h-4 mr-1" /> : <Minus className="w-4 h-4 mr-1" />}
                {Math.abs(match.lpChange)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
