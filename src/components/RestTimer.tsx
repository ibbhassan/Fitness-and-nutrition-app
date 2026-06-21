import React, { useState, useEffect } from 'react';
import { Play, Pause, Plus, Minus, Timer, X } from 'lucide-react';
import { clsx } from 'clsx';

interface RestTimerProps {
  lastCompletedSetTime: number; // Timestamp to trigger auto-start
}

export const RestTimer: React.FC<RestTimerProps> = ({ lastCompletedSetTime }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [lastDuration, setLastDuration] = useState(120);
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const [increment, setIncrement] = useState(15);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const wakeLockRef = React.useRef<any>(null); // Type any since WakeLockSentinel might not be in TS lib

  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      audioRef.current?.pause();
      releaseWakeLock();
    };
  }, []);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (err) {
      console.log('Wake lock failed', err);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  };

  const playSilentAudio = () => {
    if (audioRef.current) {
      audioRef.current.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      audioRef.current.loop = true;
      audioRef.current.volume = 1;
      audioRef.current.play().catch(() => {});
    }
  };

  const playBellAudio = () => {
    if (audioRef.current) {
      audioRef.current.src = '/true-boxing-bell.mp3';
      audioRef.current.loop = false;
      audioRef.current.volume = 1;
      audioRef.current.play().catch(() => {});
    }
  };

  // Auto-start timer when a set is completed
  useEffect(() => {
    if (lastCompletedSetTime > 0) {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      setTargetTime(Date.now() + lastDuration * 1000);
      setTimeLeft(lastDuration);
      setIsActive(true);
      playSilentAudio();
      requestWakeLock();
    }
  }, [lastCompletedSetTime]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && targetTime !== null) {
      interval = setInterval(() => {
        const remaining = Math.round((targetTime - Date.now()) / 1000);
        if (remaining <= 0) {
          setTimeLeft(0);
          setIsActive(false);
          setTargetTime(null);
          releaseWakeLock();
          
          // Play bell on the already-active audio element
          playBellAudio();
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Rest Complete', {
              body: 'Time for your next set! Let\'s go.',
              icon: '/pwa-192x192.png'
            });
          }
        } else {
          setTimeLeft(remaining);
        }
      }, 500);
    } else {
      releaseWakeLock();
    }
    return () => clearInterval(interval);
  }, [isActive, targetTime]);

  const startTimer = (seconds: number) => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setLastDuration(seconds);
    setTargetTime(Date.now() + seconds * 1000);
    setTimeLeft(seconds);
    setIsActive(true);
    playSilentAudio();
    requestWakeLock();
  };

  const addTime = (seconds: number) => {
    if (targetTime) {
      setTargetTime(targetTime + seconds * 1000);
      setTimeLeft((time) => Math.max(0, time + seconds));
    }
  };

  const toggleTimer = () => {
    if (isActive) {
      setIsActive(false);
      setTargetTime(null);
      audioRef.current?.pause();
    } else if (timeLeft > 0) {
      setTargetTime(Date.now() + timeLeft * 1000);
      setIsActive(true);
      playSilentAudio();
    }
  };

  const cancelTimer = () => {
    setIsActive(false);
    setTargetTime(null);
    setTimeLeft(0);
    audioRef.current?.pause();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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
          <button 
            onClick={toggleTimer}
            className="p-2 bg-neon-blue text-black rounded hover:bg-neon-blue/80 transition-colors shadow-[0_0_10px_rgba(0,240,255,0.3)] mr-2 sm:mr-4"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <div className="flex items-center bg-tactical-800 rounded border border-tactical-600">
            <button onClick={() => addTime(-increment)} className="px-3 py-2 hover:bg-tactical-700 text-white rounded-l transition-colors">
              <Minus className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => setIncrement(increment === 10 ? 15 : increment === 15 ? 30 : 10)}
              className="px-3 py-2 min-w-[46px] text-center text-neon-blue font-rajdhani text-sm font-bold hover:bg-tactical-700 transition-colors border-x border-tactical-600/50"
              title="Change Increment Amount"
            >
              {increment}s
            </button>

            <button onClick={() => addTime(increment)} className="px-3 py-2 hover:bg-tactical-700 text-white rounded-r transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={cancelTimer}
            className="p-2 bg-tactical-800 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded border border-tactical-600 transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
