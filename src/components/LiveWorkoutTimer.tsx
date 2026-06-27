import React, { useState, useEffect } from 'react';

export const LiveWorkoutTimer: React.FC<{ 
  startTime: number, 
  paused?: boolean, 
  accumulatedPauseMs?: number, 
  lastPauseTime?: number | null 
}> = ({ startTime, paused, accumulatedPauseMs = 0, lastPauseTime }) => {
  const calculateElapsed = () => {
    if (paused && lastPauseTime) {
      return (lastPauseTime - startTime) - accumulatedPauseMs;
    }
    return (Date.now() - startTime) - accumulatedPauseMs;
  };
  
  const [elapsed, setElapsed] = useState(calculateElapsed());

  useEffect(() => {
    if (paused) {
      setElapsed(calculateElapsed());
      return;
    }
    const interval = setInterval(() => {
      setElapsed(calculateElapsed());
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, paused, accumulatedPauseMs, lastPauseTime]);

  const totalSeconds = Math.floor(elapsed / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  let timeString = '';
  if (h > 0) {
    timeString = `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  } else {
    timeString = `${m}:${s.toString().padStart(2, '0')}`;
  }

  return <span className="tabular-nums">{timeString}</span>;
};
