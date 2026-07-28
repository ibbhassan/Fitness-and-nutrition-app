import React, { useMemo, useState } from 'react';
import { 
  AreaChart, Area, 
  LineChart, Line, 
  BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useUser } from '../context/UserContext';
import { TrendingUp, Activity, Hexagon, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { clsx } from 'clsx';

export const Analytics: React.FC = () => {
  const { workoutHistory, profile, weightHistory } = useUser();
  const [selectedExercise, setSelectedExercise] = useState<string>('Bench Press');
  const [graphRange, setGraphRange] = useState<'1M' | '3M' | '6M' | '1Y'>('1M');

  // 1. Volume Progression
  const volumeData = useMemo(() => {
    const sorted = [...workoutHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map(log => ({
      date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      volume: log.volume,
      name: log.name
    }));
  }, [workoutHistory]);

  // 2. 1RM Tracking
  const { allExercises, oneRepMaxData } = useMemo(() => {
    const exercises = new Set<string>();
    const rmData: Record<string, { date: string, rm: number }[]> = {};

    const sortedHistory = [...workoutHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedHistory.forEach(log => {
      const dateStr = new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      log.exercises.forEach(ex => {
        exercises.add(ex.name);
        
        let dailyMax1RM = 0;
        ex.sets.forEach(set => {
          if (set.completed && set.reps > 0 && set.weight > 0) {
            // Brzycki formula
            const est1RM = set.weight * (36 / (37 - set.reps));
            if (est1RM > dailyMax1RM) dailyMax1RM = est1RM;
          }
        });

        if (dailyMax1RM > 0) {
          if (!rmData[ex.name]) rmData[ex.name] = [];
          rmData[ex.name].push({ date: dateStr, rm: Math.round(dailyMax1RM) });
        }
      });
    });

    const exList = Array.from(exercises).sort();
    return { allExercises: exList, oneRepMaxData: rmData };
  }, [workoutHistory]);

  // Handle default selection if 'Bench Press' is not in history
  React.useEffect(() => {
    if (allExercises.length > 0 && !allExercises.includes(selectedExercise)) {
      setSelectedExercise(allExercises[0]);
    }
  }, [allExercises, selectedExercise]);

  const selectedRmData = oneRepMaxData[selectedExercise] || [];
  const rmYMin = selectedRmData.length > 0 ? Math.floor(Math.min(...selectedRmData.map(d => d.rm)) * 0.9) : 0;
  const rmYMax = selectedRmData.length > 0 ? Math.ceil(Math.max(...selectedRmData.map(d => d.rm)) * 1.1) : 100;

  // 3. Stat Hexagon Breakdown (Radar)
  const radarData = useMemo(() => {
    if (!profile.stats) return [];
    return [
      { subject: 'Strength', A: profile.stats.strength, fullMark: 100 },
      { subject: 'Hypertrophy', A: profile.stats.hypertrophy, fullMark: 100 },
      { subject: 'Endurance', A: profile.stats.endurance, fullMark: 100 },
      { subject: 'Volume', A: profile.stats.volume, fullMark: 100 },
      { subject: 'Power', A: profile.stats.power, fullMark: 100 },
      { subject: 'Consistency', A: profile.stats.consistency, fullMark: 100 },
    ];
  }, [profile.stats]);

  // 4. Consistency Heatmap
  const heatmapData = useMemo(() => {
    // Generate last 90 days grid
    const days = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Create a set of dates where workouts occurred
    const workoutDates = new Set(workoutHistory.map(w => {
      const d = new Date(w.date);
      d.setHours(0,0,0,0);
      return d.getTime();
    }));

    // Start 90 days ago
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({
        date: d,
        active: workoutDates.has(d.getTime())
      });
    }
    return days;
  }, [workoutHistory]);

  // 5. Total Time Trained (Last 4 weeks)
  const timeTrainedData = useMemo(() => {
    const weeks: { label: string, minutes: number }[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    // Get a label for a week
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() - (i * 7));
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);

      const label = `${weekStart.getMonth()+1}/${weekStart.getDate()} - ${weekEnd.getMonth()+1}/${weekEnd.getDate()}`;
      
      // Sum duration
      let minutes = 0;
      workoutHistory.forEach(w => {
        const d = new Date(w.date);
        d.setHours(0,0,0,0);
        if (d.getTime() >= weekStart.getTime() && d.getTime() <= weekEnd.getTime()) {
          minutes += (w.durationMinutes || 0);
        }
      });

      weeks.push({ label, minutes });
    }
    return weeks;
  }, [workoutHistory]);

  // 6. Weight Trend Data
  const weightGraphData = useMemo(() => {
    const now = new Date();
    let monthsAgo = 1;
    if (graphRange === '3M') monthsAgo = 3;
    if (graphRange === '6M') monthsAgo = 6;
    if (graphRange === '1Y') monthsAgo = 12;
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - monthsAgo);
    
    return weightHistory
      .filter(w => new Date(w.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(w => {
        const d = new Date(w.date + 'T12:00:00');
        return {
          ...w,
          displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        };
      });
  }, [weightHistory, graphRange]);

  const weightYMin = weightGraphData.length > 0 ? Math.floor(Math.min(...weightGraphData.map(d => d.weightLbs)) - 5) : 0;
  const weightYMax = weightGraphData.length > 0 ? Math.ceil(Math.max(...weightGraphData.map(d => d.weightLbs)) + 5) : 100;



  return (
    <div className="max-w-5xl mx-auto space-y-6 fade-in pb-24 overflow-x-hidden">
      <div className="esports-panel p-6">
        <h1 className="esports-heading text-2xl text-white">Analytics Engine</h1>
        <p className="text-gray-400 text-sm mt-1">Advanced metrics and progression tracking.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar Chart (RPG Stats) */}
        <div className="esports-panel p-6 flex flex-col items-center">
          <h2 className="esports-heading text-xl text-white mb-2 flex items-center gap-2 self-start">
            <Hexagon className="w-5 h-5 text-neon-purple" /> Stat Breakdown
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#2D3748" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#A0AEC0', fontSize: 12, fontFamily: 'Rajdhani', fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Stats" dataKey="A" stroke="#b52eff" fill="#b52eff" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 1RM Tracker */}
        <div className="esports-panel p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="esports-heading text-xl text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-neon-gold" /> 1RM Tracker
            </h2>
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
          
          <div className="h-52 w-full">
            {selectedRmData.length < 2 ? (
              <div className="h-full flex items-center justify-center text-gray-500 font-inter text-sm text-center px-4">
                Need at least 2 sessions of {selectedExercise} to show progression.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedRmData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                  <XAxis dataKey="date" stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[rmYMin, rmYMax]} stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A202C', borderColor: '#ffd700', borderRadius: '8px' }}
                    itemStyle={{ color: '#ffd700', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="rm" name="Est. 1RM (lbs)" stroke="#ffd700" strokeWidth={3} dot={{ fill: '#1A202C', stroke: '#ffd700', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#ffd700' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Consistency Heatmap */}
      <div className="esports-panel p-6">
        <h2 className="esports-heading text-xl text-white mb-6 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-neon-green" /> 90-Day Consistency
        </h2>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-1" style={{ minWidth: 'max-content' }}>
            {/* Wrapper flex container of small squares */}
            <div className="flex flex-wrap gap-1.5 w-full">
              {heatmapData.map((day, i) => (
                <div 
                  key={i} 
                  title={day.date.toDateString()}
                  className={clsx(
                    "w-4 h-4 rounded-sm transition-colors",
                    day.active ? "bg-neon-green shadow-[0_0_5px_rgba(0,255,0,0.5)]" : "bg-tactical-800"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 font-inter mt-2 text-right">
          Last 90 Days
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weight Trend Graph */}
        <div className="esports-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="esports-heading text-xl text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neon-blue" /> Weight Trend
            </h1>
            <div className="flex gap-2">
              {['1M', '3M', '6M', '1Y'].map(range => (
                <button
                  key={range}
                  onClick={() => setGraphRange(range as any)}
                  className={clsx(
                    "px-3 py-1 text-xs font-rajdhani font-bold rounded uppercase tracking-wider transition-colors",
                    graphRange === range ? "bg-neon-blue text-tactical-900" : "bg-tactical-800 text-gray-400 hover:bg-tactical-700 hover:text-white"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-52 w-full">
            {weightGraphData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightGraphData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="#718096" 
                    tick={{ fill: '#718096', fontSize: 12, fontFamily: 'Inter' }} 
                    axisLine={false} 
                    tickLine={false}
                    minTickGap={20}
                  />
                  <YAxis 
                    domain={[weightYMin, weightYMax]} 
                    stroke="#718096" 
                    tick={{ fill: '#718096', fontSize: 12, fontFamily: 'Inter' }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A202C', borderColor: '#00F0FF', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#00F0FF', fontWeight: 'bold' }}
                    labelStyle={{ color: '#A0AEC0', marginBottom: '4px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weightLbs" 
                    name="Weight (lbs)"
                    stroke="#00F0FF" 
                    strokeWidth={3} 
                    dot={{ fill: '#1A202C', stroke: '#00F0FF', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, fill: '#00F0FF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 font-inter text-sm flex-col gap-2">
                <span>Not enough data to display a trend.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Progression */}
        <div className="esports-panel p-6">
          <h2 className="esports-heading text-xl text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-neon-blue" /> Volume Progression
          </h2>
          
          {volumeData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-500 font-inter text-center">
              Log some workouts to see your volume progression!
            </div>
          ) : (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                  <XAxis dataKey="date" stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#718096" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A202C', borderColor: '#00f0ff', borderRadius: '8px' }}
                    itemStyle={{ color: '#00f0ff', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="volume" name="Total Vol (lbs)" stroke="#00f0ff" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Time Trained */}
        <div className="esports-panel p-6">
          <h2 className="esports-heading text-xl text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-neon-red" /> Time Trained (4 Weeks)
          </h2>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeTrainedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                <XAxis dataKey="label" stroke="#718096" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#2D3748' }}
                  contentStyle={{ backgroundColor: '#1A202C', borderColor: '#ff1e38', borderRadius: '8px' }}
                  itemStyle={{ color: '#ff1e38', fontWeight: 'bold' }}
                />
                <Bar dataKey="minutes" name="Minutes" fill="#ff1e38" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
