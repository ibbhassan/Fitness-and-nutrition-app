import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '../context/UserContext';
import { TrendingUp } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { workoutHistory } = useUser();

  const volumeData = useMemo(() => {
    // Sort chronologically
    const sorted = [...workoutHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map(log => ({
      date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      volume: log.volume,
      name: log.name
    }));
  }, [workoutHistory]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in mb-24">
      <div className="esports-panel p-6 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="esports-heading text-2xl text-white">Analytics Engine</h1>
          <p className="text-gray-400 text-sm mt-1">Track your progressive overload and raw volume.</p>
        </div>
      </div>

      <div className="esports-panel p-6">
        <h2 className="esports-heading text-xl text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-neon-blue" /> Volume Progression
        </h2>
        
        {volumeData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500 font-inter text-center">
            Log some workouts to see your volume progression over time!
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e33" vertical={false} />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d21', borderColor: '#374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#00f0ff', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  name="Total Vol (lbs)"
                  stroke="#00f0ff" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorVolume)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
