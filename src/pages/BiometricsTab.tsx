import React, { useState } from 'react';
import { Scale, HeartPulse, TrendingDown, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { CalendarModal } from '../components/CalendarModal';
import { useUser } from '../context/UserContext';

export const BiometricsTab: React.FC = () => {
  const { weightHistory, logWeight, biometrics, dailySteps, setDailySteps } = useUser();
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCalendar, setShowCalendar] = useState(false);

  const viewDateLog = weightHistory.find(w => w.date === viewDate);
  const [todaysWeightInput, setTodaysWeightInput] = useState(viewDateLog ? viewDateLog.weightLbs.toString() : '');
  const [stepsInput, setStepsInput] = useState(dailySteps ? dailySteps.toString() : '');
  const [stepsLogged, setStepsLogged] = useState(false);

  // Update input when viewDate changes
  React.useEffect(() => {
    const logForViewDate = weightHistory.find(w => w.date === viewDate);
    setTodaysWeightInput(logForViewDate ? logForViewDate.weightLbs.toString() : '');
  }, [viewDate, weightHistory]);

  const handleLogWeight = () => {
    if (todaysWeightInput) {
      logWeight(Number(todaysWeightInput), viewDate);
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

  const thisWeekLogs = weightHistory.filter(entry => 
    weekLabels.some(wl => wl.date === entry.date)
  );

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

  const todayStr = new Date().toISOString().split('T')[0];
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
        className="esports-panel p-6"
      >
        <h1 className="esports-heading text-2xl text-white mb-6 flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-neon-red" /> Biometrics ({displayDateStr})
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-tactical-900 border border-tactical-700 p-6 rounded-lg flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-rajdhani font-bold text-white flex items-center gap-2 mb-2 uppercase tracking-wider">
                <Scale className="w-5 h-5 text-neon-blue" /> Morning Weigh-In
              </h3>
              <p className="text-sm text-gray-400 mb-6">Tracking daily ensures our adaptive TDEE algorithm works accurately to adjust your macros over time.</p>
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
                ✓ Successfully logged {viewDateLog.weightLbs} lbs for {displayDateStr}.
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
                <HeartPulse className="w-5 h-5 text-neon-blue" /> Daily Steps
              </h3>
              <p className="text-sm text-gray-400 mb-6">Web apps cannot directly sync with Apple Health. Enter your daily steps manually here.</p>
            </div>
            <div className="relative flex items-center">
              <input 
                type="number" 
                placeholder="Steps"
                value={stepsInput}
                onChange={(e) => setStepsInput(e.target.value)}
                className="bg-tactical-800 border border-tactical-700 text-white p-3 pr-24 rounded font-bold focus:border-neon-blue outline-none transition-all w-full"
              />
              <button 
                onClick={handleLogSteps}
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-neon-blue text-tactical-900 px-4 rounded font-rajdhani font-bold uppercase tracking-wider hover:bg-[#00d0dd] transition-colors"
              >
                Log
              </button>
            </div>
            {stepsLogged && (
              <p className="mt-4 text-xs font-inter text-neon-blue flex items-center gap-1">
                ✓ Successfully updated steps.
              </p>
            )}
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
