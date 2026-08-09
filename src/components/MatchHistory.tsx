import React, { useState } from 'react';
import { clsx } from 'clsx';
import type { WorkoutLog } from '../types';
import { Trophy, TrendingUp, TrendingDown, Minus, X, Activity, Clock, Dumbbell, Trash2, Edit2, Calendar } from 'lucide-react';
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

interface MatchHistoryProps {
  setActiveTab?: (tab: string) => void;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({ setActiveTab }) => {
  const { workoutHistory, deleteWorkout, setEditingWorkout } = useUser();
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
                  <div className="flex-1 px-3 sm:px-6 min-w-0">
                    <div className="mb-2 w-full">
                      <h3 className="text-white font-rajdhani font-bold text-[15px] sm:text-2xl uppercase tracking-tight sm:tracking-wide whitespace-normal leading-tight break-words">{match.name}</h3>
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
                    <span className="text-[9px] sm:text-xs text-gray-500 font-inter text-right">
                      {new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-tactical-400 font-inter mb-2 text-right">
                      {new Date(match.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
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
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedWorkout(null)}></div>
          
          <div className="relative w-full max-w-2xl bg-tactical-950 border border-tactical-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 bg-tactical-900/80 border-b border-tactical-800">
              <div>
                <h2 className="text-2xl font-rajdhani font-bold text-white uppercase tracking-wider">{selectedWorkout.name}</h2>
                <span className="text-xs text-gray-500 font-inter tracking-wide uppercase flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(selectedWorkout.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="text-tactical-700">•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(selectedWorkout.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
                </span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 bg-tactical-900 p-1 rounded-lg border border-tactical-800">
                {setActiveTab && (
                  <button 
                    onClick={() => {
                      setEditingWorkout(selectedWorkout);
                      setActiveTab('workout');
                      setSelectedWorkout(null);
                    }}
                    className="text-gray-400 hover:text-neon-blue hover:bg-tactical-800 p-2 rounded-md transition-all"
                    title="Edit Workout"
                  >
                    <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this workout? This will permanently remove its volume and EP from your stats.")) {
                      deleteWorkout(selectedWorkout.id);
                      setSelectedWorkout(null);
                    }
                  }}
                  className="text-gray-400 hover:text-neon-red hover:bg-tactical-800 p-2 rounded-md transition-all"
                  title="Delete Workout"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="w-px h-6 bg-tactical-800 mx-1"></div>
                <button 
                  onClick={() => setSelectedWorkout(null)}
                  className="text-gray-400 hover:text-white hover:bg-tactical-800 p-2 rounded-md transition-all"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3 p-4 sm:p-5 bg-tactical-900/30 border-b border-tactical-800/50">
              <div className="flex flex-col items-center justify-center p-3 bg-tactical-900/80 rounded-xl border border-tactical-800 shadow-inner">
                <span className="text-[10px] text-gray-500 font-rajdhani uppercase tracking-widest mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Duration</span>
                <span className="text-xl sm:text-2xl font-bold text-white font-mono">{selectedWorkout.durationMinutes}<span className="text-sm text-gray-500 ml-0.5">m</span></span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-tactical-900 rounded-xl border border-tactical-700 shadow-[0_0_15px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className={clsx("absolute inset-0 opacity-10 blur-xl", getGradeColor(selectedWorkout.grade || 'A').replace('text-', 'bg-').split(' ')[0])}></div>
                <span className="text-[10px] text-gray-400 font-rajdhani uppercase tracking-widest mb-1 relative z-10">Grade</span>
                <span className={clsx("text-3xl sm:text-4xl font-bold leading-none relative z-10", getGradeColor(selectedWorkout.grade || 'A'))}>
                  {selectedWorkout.grade || 'A'}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-tactical-900/80 rounded-xl border border-tactical-800 shadow-inner">
                <span className="text-[10px] text-gray-500 font-rajdhani uppercase tracking-widest mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Volume</span>
                <span className="text-xl sm:text-2xl font-bold text-white font-mono">{selectedWorkout.volume.toLocaleString()}<span className="text-[10px] text-gray-500 ml-1">LBS</span></span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Exercises List */}
              {selectedWorkout.exercises.map((ex, exIdx) => {
                const completedSets = ex.sets.filter(s => s.completed);
                if (completedSets.length === 0) return null;
                
                return (
                  <div key={ex.id} className="bg-tactical-900/60 rounded-xl border border-tactical-800 overflow-hidden">
                    <div className="bg-tactical-800/30 px-4 py-3 border-b border-tactical-800 flex items-center justify-between">
                      <h4 className="font-rajdhani font-bold text-base sm:text-lg text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="text-tactical-500 font-mono text-sm">{exIdx + 1}.</span> {ex.name || 'Unnamed Exercise'}
                      </h4>
                      <span className="text-[10px] sm:text-xs font-mono text-gray-500 bg-tactical-900 px-2 py-1 rounded border border-tactical-700">{completedSets.length} Sets</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {completedSets.map((set, sIdx) => {
                        const dotColor = set.type === 'Warmup' ? "bg-neon-gold shadow-[0_0_5px_rgba(255,215,0,0.5)]" : 
                                       set.type === 'Drop' ? "bg-neon-purple shadow-[0_0_5px_rgba(176,38,255,0.5)]" :
                                       set.type === 'Failure' ? "bg-neon-red shadow-[0_0_5px_rgba(255,51,102,0.5)]" : 
                                       "bg-neon-blue shadow-[0_0_5px_rgba(0,240,255,0.5)]";
                                       
                        return (
                          <div key={set.id} className="flex items-center justify-between p-2 sm:p-3 bg-tactical-950/50 rounded-lg border border-transparent hover:border-tactical-700/50 transition-colors group">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 w-8 shrink-0">
                                <span className="text-gray-600 font-mono text-xs group-hover:text-gray-400 transition-colors">{sIdx + 1}.</span>
                                <div className={clsx("w-1.5 h-1.5 rounded-full", dotColor)}></div>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-3 font-mono">
                                <span className="text-white font-medium text-sm sm:text-base">{set.weight} <span className="text-gray-600 text-[10px] sm:text-xs">LBS</span></span>
                                <span className="text-tactical-600 text-xs">×</span>
                                <span className="text-white font-medium text-sm sm:text-base">{set.reps} <span className="text-gray-600 text-[10px] sm:text-xs">REPS</span></span>
                              </div>
                            </div>
                            
                            {set.type !== 'Normal' && (
                              <span className={clsx(
                                "text-[9px] sm:text-[10px] uppercase font-rajdhani font-bold tracking-widest px-1.5 py-0.5 rounded border ml-2",
                                set.type === 'Warmup' ? "text-neon-gold border-neon-gold/30 bg-neon-gold/5" : 
                                set.type === 'Drop' ? "text-neon-purple border-neon-purple/30 bg-neon-purple/5" : "text-neon-red border-neon-red/30 bg-neon-red/5"
                              )}>
                                {set.type}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
              {selectedWorkout.exercises.filter(ex => ex.sets.some(s => s.completed)).length === 0 && (
                <div className="p-8 text-center bg-tactical-900/50 rounded-xl border border-tactical-800 border-dashed">
                  <p className="text-gray-500 text-sm font-inter">No completed exercises in this workout.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
