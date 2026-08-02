import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Activity, Calendar as CalendarIcon, Clock, Dumbbell, UserMinus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getFriendFullProfile } from '../../services/socialService';
import { getRankInfo, getRequiredEpForLevel } from '../../utils/rankUtils';
import { clsx } from 'clsx';
import type { WorkoutLog } from '../../types';

interface FriendProfileProps {
  friendUid: string;
  onBack: () => void;
  onRemoveFriend: () => void;
}

export const FriendProfile: React.FC<FriendProfileProps> = ({ friendUid, onBack, onRemoveFriend }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'stats'>('history');
  const [friendData, setFriendData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string>('Bench Press');
  const [statType, setStatType] = useState<'1rm' | 'max_weight'>('1rm');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getFriendFullProfile(friendUid);
      setFriendData(data);
      setLoading(false);
    };
    load();
  }, [friendUid]);

  const workoutHistory: WorkoutLog[] = friendData?.workoutHistory || [];

  const { allExercises, oneRepMaxData, maxWeightData } = useMemo(() => {
    const exercises = new Set<string>();
    const rmData: Record<string, { date: string, rm: number }[]> = {};
    const maxData: Record<string, { date: string, weight: number }[]> = {};

    const sortedHistory = [...workoutHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedHistory.forEach(log => {
      const dateStr = new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      log.exercises.forEach(ex => {
        exercises.add(ex.name);
        
        let dailyMax1RM = 0;
        let dailyMaxWeight = 0;

        ex.sets.forEach(set => {
          if (set.completed && set.reps > 0 && set.weight > 0) {
            // Est 1RM
            const est1RM = set.weight * (36 / (37 - set.reps));
            if (est1RM > dailyMax1RM) dailyMax1RM = est1RM;
            
            // Raw max weight
            if (set.weight > dailyMaxWeight) dailyMaxWeight = set.weight;
          }
        });

        if (dailyMax1RM > 0) {
          if (!rmData[ex.name]) rmData[ex.name] = [];
          rmData[ex.name].push({ date: dateStr, rm: Math.round(dailyMax1RM) });
        }
        if (dailyMaxWeight > 0) {
          if (!maxData[ex.name]) maxData[ex.name] = [];
          maxData[ex.name].push({ date: dateStr, weight: dailyMaxWeight });
        }
      });
    });

    return { 
      allExercises: Array.from(exercises).sort(), 
      oneRepMaxData: rmData,
      maxWeightData: maxData
    };
  }, [workoutHistory]);

  useEffect(() => {
    if (allExercises.length > 0 && !allExercises.includes(selectedExercise)) {
      setSelectedExercise(allExercises[0]);
    }
  }, [allExercises, selectedExercise]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!friendData || !friendData.profile) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>Could not load agent data.</p>
        <button onClick={onBack} className="mt-4 text-neon-blue hover:underline">Return to Roster</button>
      </div>
    );
  }

  const { profile, user } = friendData;
  const rankInfo = getRankInfo(profile.level);

  const selectedChartData = statType === '1rm' ? (oneRepMaxData[selectedExercise] || []) : (maxWeightData[selectedExercise] || []);
  const yDataKey = statType === '1rm' ? 'rm' : 'weight';
  const yAxisLabel = statType === '1rm' ? 'Est. 1RM (lbs)' : 'Max Weight (lbs)';
  
  const yMin = selectedChartData.length > 0 ? Math.floor(Math.min(...selectedChartData.map((d: any) => d[yDataKey])) * 0.9) : 0;
  const yMax = selectedChartData.length > 0 ? Math.ceil(Math.max(...selectedChartData.map((d: any) => d[yDataKey])) * 1.1) : 100;

  return (
    <div className="space-y-6 fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Friends List
      </button>

      {/* Header Profile Card */}
      <div className="esports-panel p-6 relative overflow-hidden border-t-4" style={{borderTopColor: rankInfo.color}}>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: `linear-gradient(180deg, ${rankInfo.color}, transparent)` }}></div>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="relative shrink-0">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatar?.seed || user.username}`} alt="Avatar" className="w-24 h-24 rounded-full bg-tactical-800 border-4 shadow-lg" style={{borderColor: rankInfo.color}} />
          </div>
          
          <div className="text-center sm:text-left flex-1 mt-2 sm:mt-0">
            <h1 className="text-3xl font-rajdhani font-bold uppercase tracking-widest text-white drop-shadow-md">{user.username}</h1>
            <p className="font-rajdhani font-bold tracking-wider uppercase flex items-center justify-center sm:justify-start gap-2 mt-2" style={{color: rankInfo.color}}>
              Level {profile.level || 1}
            </p>
          </div>
          <div className="absolute top-0 right-0 sm:top-2 sm:right-2 z-30">
            <button 
              onClick={onRemoveFriend} 
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-rajdhani font-bold uppercase tracking-wider text-gray-500 hover:text-neon-red bg-tactical-900/80 backdrop-blur-sm border border-tactical-700 hover:border-neon-red/50 rounded-lg transition-all shadow-md hover:bg-neon-red/10"
              title="Remove Friend"
            >
              <UserMinus className="w-4 h-4 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        </div>

        {/* Full-width Rank Panel */}
        <div className="w-full mt-6 bg-tactical-900/80 rounded-lg p-4 border border-tactical-700 relative z-10">
          <h3 className="text-gray-400 text-xs font-rajdhani uppercase tracking-wider mb-3">Current Rank</h3>
          <div className="flex justify-between items-end mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src={rankInfo.crestUrl} 
                  alt="Rank Crest" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <span className="font-rajdhani font-bold uppercase text-lg" style={{color: rankInfo.color}}>
                {rankInfo.tier} {rankInfo.division}
              </span>
            </div>
            <span className="font-bold text-sm" style={{color: rankInfo.color}}>
              {Math.floor(profile?.lp || 0)} / {getRequiredEpForLevel(profile?.level || 1)} EP
            </span>
          </div>
          <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-tactical-600 shadow-inner">
            <div 
              className="h-full relative bg-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.8)]"
              style={{ 
                width: `${Math.min(100, Math.round(((profile?.lp || 0) / getRequiredEpForLevel(profile?.level || 1)) * 100))}%` 
              }}
            >
              <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-l from-white/50 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-tactical-700">
        <button
          onClick={() => setActiveTab('history')}
          className={clsx(
            "px-6 py-3 font-rajdhani font-bold tracking-wider uppercase transition-colors relative",
            activeTab === 'history' ? "text-neon-blue" : "text-gray-500 hover:text-gray-300"
          )}
        >
          Workout History
          {activeTab === 'history' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={clsx(
            "px-6 py-3 font-rajdhani font-bold tracking-wider uppercase transition-colors relative",
            activeTab === 'stats' ? "text-neon-gold" : "text-gray-500 hover:text-gray-300"
          )}
        >
          Stats & Records
          {activeTab === 'stats' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-gold shadow-[0_0_10px_rgba(255,215,0,0.5)]"></div>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {workoutHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-tactical-900 border border-tactical-700 rounded-xl">
              No recent missions found for this agent.
            </div>
          ) : (
            [...workoutHistory].reverse().map(workout => (
              <div key={workout.id} className="bg-tactical-900 p-4 rounded-xl border border-tactical-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-tactical-800 pb-3 gap-2">
                  <div>
                    <h3 className="font-rajdhani font-bold text-lg text-white uppercase tracking-wider">{workout.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {new Date(workout.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {workout.durationMinutes} min</span>
                      <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" /> {workout.volume.toLocaleString()} lbs vol</span>
                    </div>
                  </div>
                  {workout.grade && (
                    <div className={clsx(
                      "px-3 py-1 rounded font-rajdhani font-bold text-lg self-start sm:self-auto",
                      workout.grade.includes('S') ? "bg-neon-gold/20 text-neon-gold border border-neon-gold/50" : "bg-tactical-800 text-neon-blue border border-tactical-600"
                    )}>
                      Rank {workout.grade}
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  {workout.exercises.map(ex => (
                    <div key={ex.id} className="text-sm">
                      <div className="text-gray-300 font-bold mb-1 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-neon-blue"></div>
                        {ex.name}
                      </div>
                      <div className="pl-3.5 flex flex-wrap gap-2">
                        {ex.sets.map((set) => (
                          <span key={set.id} className={clsx(
                            "px-2 py-0.5 rounded text-xs",
                            set.completed ? "bg-tactical-800 text-gray-400 border border-tactical-700" : "bg-tactical-800/50 text-gray-600 border border-tactical-800 line-through"
                          )}>
                            {set.weight}lbs × {set.reps}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="esports-panel p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="esports-heading text-xl text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-neon-gold" /> Performance Tracker
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <select 
                value={statType}
                onChange={(e) => setStatType(e.target.value as '1rm' | 'max_weight')}
                className="bg-tactical-800 border border-tactical-700 text-white p-2 rounded text-sm font-rajdhani uppercase tracking-wider outline-none focus:border-neon-gold"
              >
                <option value="1rm">Est. 1 Rep Max</option>
                <option value="max_weight">Highest Weight Lifted</option>
              </select>
              <select 
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="bg-tactical-800 border border-tactical-700 text-white p-2 rounded text-sm font-rajdhani uppercase tracking-wider outline-none focus:border-neon-gold max-w-[200px]"
              >
                {allExercises.length === 0 ? <option>No Data</option> : null}
                {allExercises.map(ex => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="h-64 w-full">
            {selectedChartData.length < 2 ? (
              <div className="h-full flex items-center justify-center text-gray-500 font-inter text-sm text-center px-4">
                Not enough data to show progression for {selectedExercise}.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedChartData as any[]} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                  <XAxis dataKey="date" stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[yMin, yMax]} stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A202C', borderColor: '#ffd700', borderRadius: '8px' }}
                    itemStyle={{ color: '#ffd700', fontWeight: 'bold' }}
                    formatter={(value: any) => [`${value} lbs`, yAxisLabel]}
                  />
                  <Line type="monotone" dataKey={yDataKey} name={yAxisLabel} stroke="#ffd700" strokeWidth={3} dot={{ fill: '#1A202C', stroke: '#ffd700', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#ffd700' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
