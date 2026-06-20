import React, { useState } from 'react';
import { Scale, HeartPulse, TrendingDown } from 'lucide-react';
import { useUser } from '../context/UserContext';

export const BiometricsTab: React.FC = () => {
  const { weightHistory, logWeight, biometrics, dailySteps, setDailySteps } = useUser();
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayLog = weightHistory.find(w => w.date === todayDateStr);
  const [todaysWeightInput, setTodaysWeightInput] = useState(todayLog ? todayLog.weightLbs.toString() : '');
  const [stepsInput, setStepsInput] = useState(dailySteps ? dailySteps.toString() : '');
  const [stepsLogged, setStepsLogged] = useState(false);

  const handleLogWeight = () => {
    if (todaysWeightInput) {
      logWeight(Number(todaysWeightInput));
    }
  };

  const handleLogSteps = () => {
    if (stepsInput) {
      setDailySteps(Number(stepsInput));
      setStepsLogged(true);
      setTimeout(() => setStepsLogged(false), 3000);
    }
  };

  const avgWeight = weightHistory.length > 0 
    ? (weightHistory.reduce((sum, entry) => sum + entry.weightLbs, 0) / weightHistory.length).toFixed(1)
    : (biometrics?.weightLbs || 0).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      <div className="esports-panel p-6">
        <h1 className="esports-heading text-2xl text-white mb-6 flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-neon-red" /> Biometrics & Body Data
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-tactical-900 border border-tactical-700 p-6 rounded-lg flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-rajdhani font-bold text-white flex items-center gap-2 mb-2 uppercase tracking-wider">
                <Scale className="w-5 h-5 text-neon-blue" /> Morning Weigh-In
              </h3>
              <p className="text-sm text-gray-400 mb-6">Tracking daily ensures our adaptive TDEE algorithm works accurately to adjust your macros over time.</p>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input 
                type="number" 
                placeholder="Lbs"
                value={todaysWeightInput}
                onChange={(e) => setTodaysWeightInput(e.target.value)}
                className="bg-tactical-800 border border-tactical-700 text-white p-3 rounded font-bold focus:border-neon-blue outline-none transition-all w-full"
              />
              <button 
                onClick={handleLogWeight}
                className="bg-neon-blue text-tactical-900 px-6 rounded font-rajdhani font-bold uppercase tracking-wider hover:bg-[#00d0dd] transition-colors shadow-[0_0_10px_rgba(0,240,255,0.3)] whitespace-nowrap"
              >
                Log
              </button>
            </div>
            {todayLog && (
              <p className="mt-4 text-xs font-inter text-neon-blue flex items-center gap-1">
                ✓ Successfully logged {todayLog.weightLbs} lbs today.
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
              Based on {weightHistory.length} entries.
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
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input 
                type="number" 
                placeholder="Steps"
                value={stepsInput}
                onChange={(e) => setStepsInput(e.target.value)}
                className="bg-tactical-800 border border-tactical-700 text-white p-3 rounded font-bold focus:border-neon-blue outline-none transition-all w-full"
              />
              <button 
                onClick={handleLogSteps}
                className="bg-neon-blue text-tactical-900 px-6 rounded font-rajdhani font-bold uppercase tracking-wider hover:bg-[#00d0dd] transition-colors shadow-[0_0_10px_rgba(0,240,255,0.3)] whitespace-nowrap"
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
      </div>
    </div>
  );
};
