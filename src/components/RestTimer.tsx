import React, { useState, useEffect } from 'react';
import { Play, Pause, Plus, Minus, Timer } from 'lucide-react';
import { clsx } from 'clsx';

interface RestTimerProps {
  lastCompletedSetTime: number; // Timestamp to trigger auto-start
}

export const RestTimer: React.FC<RestTimerProps> = ({ lastCompletedSetTime }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [lastDuration, setLastDuration] = useState(120);

  // Auto-start timer when a set is completed
  useEffect(() => {
    if (lastCompletedSetTime > 0) {
      setTimeLeft(lastDuration);
      setIsActive(true);
    }
  }, [lastCompletedSetTime]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play();
      } catch (e) {
        // Ignore audio errors
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startTimer = (seconds: number) => {
    setLastDuration(seconds);
    setTimeLeft(seconds);
    setIsActive(true);
  };

  const addTime = (seconds: number) => {
    setTimeLeft((time) => Math.max(0, time + seconds));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const cancelTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
  };

  // Auto-hide when timer is at 0 and not active
  if (timeLeft === 0 && !isActive) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-tactical-900 border-t border-neon-blue shadow-[0_-5px_30px_rgba(0,240,255,0.15)] pb-safe-area">
      <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
        {/* Left side: Icon & Timer */}
        <div className="flex items-center gap-4">
          <Timer className={clsx("w-6 h-6", isActive ? "text-neon-blue animate-pulse" : "text-gray-500")} />
          <div 
            className="text-3xl font-rajdhani font-bold text-white tabular-nums tracking-wider w-20" 
            style={{ textShadow: isActive ? '0 0 15px rgba(0, 240, 255, 0.4)' : 'none' }}
          >
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Center: Quick Select Presets */}
        <div className="flex gap-2 flex-1 justify-center order-3 sm:order-2 w-full sm:w-auto mt-2 sm:mt-0">
          <button onClick={() => startTimer(60)} className="flex-1 sm:flex-none px-4 py-1.5 bg-tactical-800 hover:bg-tactical-700 text-white font-rajdhani text-sm font-bold tracking-wider rounded border border-tactical-600 transition-colors">1M</button>
          <button onClick={() => startTimer(120)} className="flex-1 sm:flex-none px-4 py-1.5 bg-tactical-800 hover:bg-tactical-700 text-white font-rajdhani text-sm font-bold tracking-wider rounded border border-tactical-600 transition-colors">2M</button>
          <button onClick={() => startTimer(180)} className="flex-1 sm:flex-none px-4 py-1.5 bg-tactical-800 hover:bg-tactical-700 text-white font-rajdhani text-sm font-bold tracking-wider rounded border border-tactical-600 transition-colors">3M</button>
        </div>

        {/* Right side: Controls */}
        <div className="flex items-center gap-2 order-2 sm:order-3">
          <button onClick={() => addTime(-30)} className="p-2 bg-tactical-800 hover:bg-tactical-700 text-white rounded border border-tactical-600 transition-colors">
            <Minus className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => setIsActive(!isActive)}
            className={clsx(
              "w-10 h-10 flex items-center justify-center rounded border transition-all",
              isActive 
                ? "bg-tactical-800 border-neon-red text-neon-red hover:bg-tactical-700" 
                : "bg-neon-blue border-neon-blue text-tactical-900 hover:bg-neon-blue/90"
            )}
          >
            {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button onClick={() => addTime(30)} className="p-2 bg-tactical-800 hover:bg-tactical-700 text-white rounded border border-tactical-600 transition-colors">
            <Plus className="w-4 h-4" />
          </button>

          {/* Cancel/Dismiss Timer Button */}
          <button 
            onClick={cancelTimer} 
            className="p-2 ml-2 bg-tactical-800 hover:bg-neon-red/20 text-gray-400 hover:text-neon-red rounded border border-tactical-600 hover:border-neon-red transition-colors"
            title="Cancel Timer"
          >
            <span className="text-sm font-bold font-rajdhani uppercase px-1">Stop</span>
          </button>
        </div>
      </div>
    </div>
  );
};
