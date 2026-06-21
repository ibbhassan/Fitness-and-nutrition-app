import React, { useState } from 'react';
import { clsx } from 'clsx';
import type { WorkoutLog } from '../types';
import { Trophy, TrendingUp, TrendingDown, Minus, X, Activity, Clock, Dumbbell } from 'lucide-react';
import { useUser } from '../context/UserContext';

const getGradeColor = (grade?: string) => {
  switch (grade) {
    case 'S+': return 'text-neon-gold drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]';
    case 'S': return 'text-neon-purple drop-shadow-[0_0_8px_rgba(176,38,255,0.8)]';
    case 'A': return 'text-neon-blue';
    case 'B': return 'text-neon-green';
    default: return 'text-gray-400';
  }
};

export const MatchHistory: React.FC = () => {
  const { workoutHistory } = useUser();
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(null);

  // Sort history newest first
  const sortedHistory = [...workoutHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <div className="pt-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="esports-heading text-2xl text-white">Workout History</h2>
          <span className="text-sm font-rajdhani font-bold text-gray-400 uppercase tracking-widest">{sortedHistory.length} Workouts</span>
        </div>

        {sortedHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500 font-inter">
            No workouts logged yet. Your history will appear here.
          </div>
        ) : (
          <div className="space-y-6">
            {sortedHistory.map((match) => {
              const grade = match.grade || 'A';
              const epChange = match.epChange || 0;
              const totalSets = match.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
              const exerciseNames = match.exercises.map(e => e.name).join(', ');
              
              return (
                <div 
                  key={match.id} 
                  onClick={() => setSelectedWorkout(match)}
                  className="flex items-center py-6 px-4 sm:p-6 bg-tactical-900 rounded-xl border border-tactical-700 hover:border-tactical-500 hover:shadow-[0_0_15px_rgba(0,255,170,0.1)] transition-all cursor-pointer group"
                >
                  {/* Grade Column */}
                  <div className="w-16 sm:w-20 flex flex-col items-center justify-center border-r border-tactical-700 pr-3 sm:pr-6 shrink-0 gap-1">
                    {match.isPr && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-neon-gold/20 text-neon-gold border border-neon-gold/50 rounded flex items-center gap-1 shrink-0">
                        <Trophy className="w-2.5 h-2.5" /> PR
                      </span>
                    )}
                    <span className={clsx("font-rajdhani font-bold text-4xl sm:text-5xl transition-transform group-hover:scale-110", getGradeColor(grade))}>
                      {grade}
                    </span>
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 px-3 sm:px-6 min-w-0 overflow-hidden">
                    <div className="mb-2 w-full pr-2">
                      <h3 className="text-white font-rajdhani font-bold text-[clamp(12px,4vw,16px)] sm:text-2xl uppercase tracking-wide truncate">{match.name}</h3>
                    </div>
                    
                    {/* Extra details row */}
                    <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 text-[10px] sm:text-sm text-gray-400 font-inter mb-2">
                      <div className="flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-tactical-400" />
                        <span>{match.durationMinutes} min</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-tactical-400" />
                        <span>{match.volume.toLocaleString()} lbs</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Dumbbell className="w-3 h-3 sm:w-4 sm:h-4 text-tactical-400" />
                        <span>{match.exercises.length} Ex, {totalSets} Sets</span>
                      </div>
                    </div>
                    
                    {/* Exercise preview */}
                    <p className="text-[10px] sm:text-xs text-gray-500 font-inter line-clamp-2 pr-2">
                      {exerciseNames}
                    </p>
                  </div>

                  {/* EP & Date Column */}
                  <div className="flex flex-col items-end pl-3 sm:pl-6 border-l border-tactical-700 shrink-0 min-w-[70px] sm:min-w-[100px]">
                    <span className="text-[9px] sm:text-xs text-gray-500 font-inter mb-2 text-right">
                      {new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-[9px] sm:text-xs text-gray-400 font-rajdhani uppercase mb-1">EP Earned</span>
                    <div className={clsx(
                      "flex items-center font-bold text-base sm:text-xl",
                      epChange > 0 ? "text-neon-green" : epChange < 0 ? "text-neon-red" : "text-gray-400"
                    )}>
                      {epChange > 0 ? <TrendingUp className="w-3 h-3 sm:w-5 sm:h-5 mr-1" /> : epChange < 0 ? <TrendingDown className="w-3 h-3 sm:w-5 sm:h-5 mr-1" /> : <Minus className="w-3 h-3 sm:w-5 sm:h-5 mr-1" />}
                      {Math.abs(epChange)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Workout Details Modal */}
      {selectedWorkout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-safe">
          <div className="absolute inset-0 bg-tactical-900/80 backdrop-blur-sm" onClick={() => setSelectedWorkout(null)}></div>
          
          <div className="relative w-full max-w-2xl bg-tactical-800 border border-tactical-600 rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-tactical-700">
              <h2 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider">{selectedWorkout.name}</h2>
              <button 
                onClick={() => setSelectedWorkout(null)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-tactical-900 p-3 rounded-lg border border-tactical-700 flex flex-col items-center">
                  <Clock className="w-5 h-5 text-neon-blue mb-1" />
                  <span className="text-sm text-gray-400 font-rajdhani uppercase text-center">Duration</span>
                  <span className="text-lg font-bold text-white">{selectedWorkout.durationMinutes} min</span>
                </div>
                <div className="bg-tactical-900 p-3 rounded-lg border border-tactical-700 flex flex-col items-center">
                  <Activity className="w-5 h-5 text-neon-purple mb-1" />
                  <span className="text-sm text-gray-400 font-rajdhani uppercase text-center">Grade</span>
                  <span className={clsx("text-4xl font-bold mt-2 leading-none", getGradeColor(selectedWorkout.grade || 'A'))}>
                    {selectedWorkout.grade || 'A'}
                  </span>
                </div>
                <div className="bg-tactical-900 p-3 rounded-lg border border-tactical-700 flex flex-col items-center">
                  <Dumbbell className="w-5 h-5 text-neon-green mb-1" />
                  <span className="text-sm text-gray-400 font-rajdhani uppercase text-center">Volume</span>
                  <span className="text-lg font-bold text-white text-center">{selectedWorkout.volume.toLocaleString()} lbs</span>
                </div>
              </div>

              {/* Exercises List */}
              <div className="space-y-4">
                <h3 className="font-rajdhani font-bold text-lg text-gray-300 uppercase tracking-wider border-b border-tactical-700 pb-2">Exercises</h3>
                
                {selectedWorkout.exercises.map((ex, exIdx) => {
                  const completedSets = ex.sets.filter(s => s.completed);
                  if (completedSets.length === 0) return null;
                  
                  return (
                    <div key={ex.id} className="bg-tactical-900 rounded-lg border border-tactical-700 overflow-hidden">
                      <div className="px-4 py-3 bg-tactical-800/50 border-b border-tactical-700">
                        <h4 className="font-bold text-white">{exIdx + 1}. {ex.name || 'Unnamed Exercise'}</h4>
                      </div>
                      <div className="p-2 sm:p-4">
                        <div className="grid grid-cols-12 gap-2 text-[10px] sm:text-xs font-rajdhani uppercase text-gray-500 font-bold mb-2 px-1">
                          <div className="col-span-3 sm:col-span-2 text-center">Set</div>
                          <div className="col-span-4 sm:col-span-5 text-center">Lbs</div>
                          <div className="col-span-5 sm:col-span-5 text-center">Reps</div>
                        </div>
                        <div className="space-y-1">
                          {completedSets.map((set, sIdx) => (
                            <div key={set.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-tactical-800 rounded">
                              <div className="col-span-3 sm:col-span-2 flex justify-center">
                                <span className={clsx(
                                  "px-2 py-0.5 rounded text-xs font-bold",
                                  set.type === 'Warmup' ? "bg-neon-gold/20 text-neon-gold" : 
                                  set.type === 'Drop' ? "bg-neon-purple/20 text-neon-purple" :
                                  set.type === 'Failure' ? "bg-neon-red/20 text-neon-red" : 
                                  "bg-tactical-700 text-gray-300"
                                )}>
                                  {set.type === 'Warmup' ? 'W' : set.type === 'Drop' ? 'D' : set.type === 'Failure' ? 'F' : sIdx + 1}
                                </span>
                              </div>
                              <div className="col-span-4 sm:col-span-5 text-center font-inter text-white text-sm">
                                {set.weight}
                              </div>
                              <div className="col-span-5 sm:col-span-5 text-center font-inter text-white text-sm">
                                {set.reps}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {selectedWorkout.exercises.filter(ex => ex.sets.some(s => s.completed)).length === 0 && (
                  <p className="text-gray-500 text-sm italic">No completed exercises in this workout.</p>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
};
