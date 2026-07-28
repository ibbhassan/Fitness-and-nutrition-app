import { getLocalDateString } from '../utils/dateUtils';
import React, { useState, useMemo } from 'react';
import { Scale, HeartPulse, TrendingDown, ChevronLeft, ChevronRight, Calendar, Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { CalendarModal } from '../components/CalendarModal';
import { useUser } from '../context/UserContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { clsx } from 'clsx';

export const BiometricsTab: React.FC = () => {
  const { weightHistory, logWeight, bodyFatHistory, logBodyFat, biometrics, dailySteps, setDailySteps } = useUser();
  const [viewDate, setViewDate] = useState(getLocalDateString());
  const [showCalendar, setShowCalendar] = useState(false);
  const [graphRange, setGraphRange] = useState<'1M' | '3M' | '6M' | '1Y'>('1M');

  const viewDateLog = weightHistory.find(w => w.date === viewDate);
  const viewDateBfLog = bodyFatHistory?.find(b => b.date === viewDate);
  
  const [todaysWeightInput, setTodaysWeightInput] = useState(viewDateLog ? viewDateLog.weightLbs.toString() : '');
  const [todaysBfInput, setTodaysBfInput] = useState(viewDateBfLog ? viewDateBfLog.bodyFatPercent.toString() : '');
  const [stepsInput, setStepsInput] = useState(dailySteps ? dailySteps.toString() : '');
  const [stepsLogged, setStepsLogged] = useState(false);

  // Update input when viewDate changes
  React.useEffect(() => {
    const logForViewDate = weightHistory.find(w => w.date === viewDate);
    setTodaysWeightInput(logForViewDate ? logForViewDate.weightLbs.toString() : '');
    const bfForViewDate = bodyFatHistory?.find(b => b.date === viewDate);
    setTodaysBfInput(bfForViewDate ? bfForViewDate.bodyFatPercent.toString() : '');
  }, [viewDate, weightHistory, bodyFatHistory]);

  const handleLogWeight = () => {
    if (todaysWeightInput) {
      logWeight(Number(todaysWeightInput), viewDate);
    }
  };

  const handleLogBodyFat = () => {
    if (todaysBfInput) {
      logBodyFat(Number(todaysBfInput), viewDate);
    }
  };

  const handleLogSteps = () => {
    if (stepsInput) {
      setDailySteps(Number(stepsInput));
      setStepsLogged(true);
      setTimeout(() => setStepsLogged(false), 3000);
    }
  };

  const getWeightTrackingWeekStart = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const daysSinceSaturday = (dayOfWeek + 1) % 7; 
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - daysSinceSaturday);
    return weekStart;
  };

  const getWeekLabels = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekStart = getWeightTrackingWeekStart();
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      return { label: days[d.getDay()], date: dateStr };
    });
  };

  const weekLabels = getWeekLabels();
  const thisWeekLogs = weightHistory.filter(entry => weekLabels.some(wl => wl.date === entry.date));
  const avgWeight = thisWeekLogs.length > 0 
    ? (thisWeekLogs.reduce((sum, entry) => sum + entry.weightLbs, 0) / thisWeekLogs.length).toFixed(1)
    : (biometrics?.weightLbs || 0).toFixed(1);

  const handleDragEnd = (_event: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 50) {
      const d = new Date(viewDate + 'T12:00:00');
      if (info.offset.x > 0) {
        d.setDate(d.getDate() - 1); // Swiped right -> Previous day
      } else {
        d.setDate(d.getDate() + 1); // Swiped left -> Next day
      }
      setViewDate(d.toISOString().split('T')[0]);
    }
  };

  const shiftDate = (days: number) => {
    const d = new Date(viewDate + 'T12:00:00');
    d.setDate(d.getDate() + days);
    setViewDate(d.toISOString().split('T')[0]);
  };

  const todayStr = getLocalDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  let displayDateStr = '';
  if (viewDate === todayStr) displayDateStr = 'Today';
  else if (viewDate === yesterdayStr) displayDateStr = 'Yesterday';
  else if (viewDate === tomorrowStr) displayDateStr = 'Tomorrow';
  else {
    const d = new Date(viewDate + 'T12:00:00');
    displayDateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  // Calculate Lean Body Mass based on most recent logs or biometrics
  const currentBF = viewDateBfLog?.bodyFatPercent || biometrics?.bodyFat;
  const currentWeight = viewDateLog?.weightLbs || biometrics?.weightLbs;
  const lbm = (currentBF && currentWeight) ? (currentWeight * (1 - currentBF / 100)).toFixed(1) : null;
  const fatMass = (currentBF && currentWeight) ? (currentWeight * (currentBF / 100)).toFixed(1) : null;

  // Prepare graph data
  const graphData = useMemo(() => {
    const now = new Date();
    let monthsAgo = 1;
    if (graphRange === '3M') monthsAgo = 3;
    if (graphRange === '6M') monthsAgo = 6;
    if (graphRange === '1Y') monthsAgo = 12;
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - monthsAgo);
    
    // Filter and format for chart
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

  // Determine min and max for the Y-axis to make the chart look nice and dynamic
  const yAxisMin = graphData.length > 0 ? Math.floor(Math.min(...graphData.map(d => d.weightLbs)) - 5) : 0;
  const yAxisMax = graphData.length > 0 ? Math.ceil(Math.max(...graphData.map(d => d.weightLbs)) + 5) : 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in pb-24 overflow-x-hidden">
      
      {/* Top Header / Calendar area */}
      <div className="flex items-center justify-between pt-2 px-4 mb-4 max-w-md mx-auto">
        <button onClick={() => shiftDate(-1)} className="p-2 hover:bg-tactical-800 rounded-full transition-colors text-gray-400 hover:text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div 
          className="text-center cursor-pointer group flex flex-col items-center justify-center"
          onClick={() => setShowCalendar(true)}
        >
          <div className="flex items-center gap-2">
            <h1 className="font-rajdhani font-bold text-2xl text-white tracking-widest uppercase group-hover:text-neon-blue transition-colors">
              {displayDateStr}
            </h1>
            <Calendar className="w-4 h-4 text-gray-500 group-hover:text-neon-blue transition-colors" />
          </div>
          <p className="text-gray-400 text-xs">Biometrics Data</p>
        </div>
        <button onClick={() => shiftDate(1)} className="p-2 hover:bg-tactical-800 rounded-full transition-colors text-gray-400 hover:text-white">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <motion.div
        key={viewDate}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="space-y-6"
      >
        
        {/* Weight Trend Graph */}
        <div className="esports-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="esports-heading text-2xl text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-neon-blue" /> Weight Trend
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
          
          <div className="h-64 w-full">
            {graphData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
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
                    domain={[yAxisMin, yAxisMax]} 
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
                <TrendingDown className="w-8 h-8 opacity-20" />
                <span>Not enough data to display a trend. Log your weight on multiple days!</span>
              </div>
            )}
          </div>
        </div>

        {/* Daily Logging section */}
        <div className="esports-panel p-6">
          <h1 className="esports-heading text-xl text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-neon-gold" /> Daily Metrics
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-tactical-900 border border-tactical-700 p-6 rounded-lg flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-rajdhani font-bold text-white flex items-center gap-2 mb-2 uppercase tracking-wider">
                  <Scale className="w-5 h-5 text-neon-blue" /> Morning Weigh-In
                </h3>
                <p className="text-sm text-gray-400 mb-6">Tracking daily ensures our adaptive TDEE algorithm works accurately.</p>
              </div>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  placeholder="Lbs"
                  value={todaysWeightInput}
                  onChange={(e) => setTodaysWeightInput(e.target.value)}
                  className="bg-tactical-800 border border-tactical-700 text-white p-3 pr-24 rounded font-bold focus:border-neon-blue outline-none transition-all w-full"
                />
                <button 
                  onClick={handleLogWeight}
                  className="absolute right-1.5 top-1.5 bottom-1.5 bg-neon-blue text-tactical-900 px-4 rounded font-rajdhani font-bold uppercase tracking-wider hover:bg-[#00d0dd] transition-colors"
                >
                  Log
                </button>
              </div>
              {viewDateLog && (
                <p className="mt-4 text-xs font-inter text-neon-blue flex items-center gap-1">
                  ✓ Logged {viewDateLog.weightLbs} lbs
                </p>
              )}
            </div>

            <div className="bg-tactical-900 border border-tactical-700 p-6 rounded-lg flex flex-col justify-center items-center relative overflow-hidden">
              <TrendingDown className="absolute -right-4 -bottom-4 w-32 h-32 text-neon-blue opacity-5" />
              <span className="text-xs text-neon-blue font-rajdhani uppercase font-bold tracking-widest mb-2 z-10">Current Weekly Average</span>
              <div className="flex items-end gap-2 mb-2 z-10">
                <span className="text-5xl font-rajdhani font-bold text-white">{avgWeight}</span>
                <span className="text-lg text-gray-400 mb-1">Lbs</span>
              </div>
              <p className="text-xs text-gray-500 font-inter z-10 text-center">
                Based on {thisWeekLogs.length} entries this week.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-tactical-900 border border-tactical-700 p-6 rounded-lg flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-rajdhani font-bold text-white flex items-center gap-2 mb-2 uppercase tracking-wider">
                  <Zap className="w-5 h-5 text-neon-red" /> Body Fat %
                </h3>
                <p className="text-sm text-gray-400 mb-6">Log your body fat percentage to track true body composition changes.</p>
              </div>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  placeholder="%"
                  value={todaysBfInput}
                  onChange={(e) => setTodaysBfInput(e.target.value)}
                  className="bg-tactical-800 border border-tactical-700 text-white p-3 pr-24 rounded font-bold focus:border-neon-red outline-none transition-all w-full"
                />
                <button 
                  onClick={handleLogBodyFat}
                  className="absolute right-1.5 top-1.5 bottom-1.5 bg-neon-red text-white px-4 rounded font-rajdhani font-bold uppercase tracking-wider hover:bg-[#ff1e38] transition-colors"
                >
                  Log
                </button>
              </div>
              {viewDateBfLog && (
                <p className="mt-4 text-xs font-inter text-neon-red flex items-center gap-1">
                  ✓ Logged {viewDateBfLog.bodyFatPercent}%
                </p>
              )}
            </div>

            <div className="bg-tactical-900 border border-tactical-700 p-6 rounded-lg flex flex-col justify-center items-center relative overflow-hidden">
              <span className="text-xs text-neon-purple font-rajdhani uppercase font-bold tracking-widest mb-2 z-10">Lean Body Mass</span>
              {lbm ? (
                <>
                  <div className="flex items-end gap-2 mb-2 z-10">
                    <span className="text-5xl font-rajdhani font-bold text-white">{lbm}</span>
                    <span className="text-lg text-gray-400 mb-1">Lbs</span>
                  </div>
                  <p className="text-xs text-gray-500 font-inter z-10 text-center">
                    Estimated Fat Mass: {fatMass} lbs
                  </p>
                </>
              ) : (
                <div className="text-sm text-gray-500 text-center mt-4">
                  Log your weight and body fat % to calculate Lean Body Mass.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-tactical-900 border border-tactical-700 p-6 rounded-lg flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-rajdhani font-bold text-white flex items-center gap-2 mb-2 uppercase tracking-wider">
                  <HeartPulse className="w-5 h-5 text-neon-purple" /> Daily Steps
                </h3>
                <p className="text-sm text-gray-400 mb-6">Enter your daily steps manually here.</p>
              </div>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  placeholder="Steps"
                  value={stepsInput}
                  onChange={(e) => setStepsInput(e.target.value)}
                  className="bg-tactical-800 border border-tactical-700 text-white p-3 pr-24 rounded font-bold focus:border-neon-purple outline-none transition-all w-full"
                />
                <button 
                  onClick={handleLogSteps}
                  className="absolute right-1.5 top-1.5 bottom-1.5 bg-neon-purple text-white px-4 rounded font-rajdhani font-bold uppercase tracking-wider hover:bg-[#b52eff] transition-colors"
                >
                  Log
                </button>
              </div>
              {stepsLogged && (
                <p className="mt-4 text-xs font-inter text-neon-purple flex items-center gap-1">
                  ✓ Successfully updated steps.
                </p>
              )}
            </div>
          </div>

        </div>
      </motion.div>

      {showCalendar && (
        <CalendarModal 
          selectedDate={viewDate} 
          onSelectDate={(date) => {
            setViewDate(date);
            setShowCalendar(false);
          }}
          onClose={() => setShowCalendar(false)} 
        />
      )}
    </div>
  );
};
