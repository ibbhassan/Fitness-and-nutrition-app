import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import type { UserStats } from '../types';

interface StatHexagonProps {
  stats: UserStats;
  hidePanel?: boolean;
  size?: number;
}

export const StatHexagon: React.FC<StatHexagonProps> = ({ stats, hidePanel = false, size }) => {
  const safeStats = stats || { strength: 0, endurance: 0, consistency: 0, power: 0, hypertrophy: 0, volume: 0 };
  
  const data = [
    { subject: 'Strength', A: safeStats.strength, fullMark: 100 },
    { subject: 'Endurance', A: safeStats.endurance, fullMark: 100 },
    { subject: 'Consistency', A: safeStats.consistency, fullMark: 100 },
    { subject: 'Power', A: safeStats.power, fullMark: 100 },
    { subject: 'Hypertrophy', A: safeStats.hypertrophy, fullMark: 100 },
    { subject: 'Volume', A: safeStats.volume, fullMark: 100 },
  ];

  const content = (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#2a2a2a" />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: '#a0a0a0', fontSize: hidePanel ? 10 : 12, fontFamily: 'Inter' }} 
        />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="Stats"
          dataKey="A"
          stroke="#00f0ff"
          strokeWidth={2}
          fill="#00f0ff"
          fillOpacity={0.3}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#121212', borderColor: '#2a2a2a', color: '#fff' }}
          itemStyle={{ color: '#00f0ff' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );

  if (hidePanel) {
    return (
      <div style={{ width: size || '100%', height: size || '100%' }}>
        {content}
      </div>
    );
  }

  return (
    <div className="esports-panel p-6 flex flex-col items-center justify-center h-full relative">
      <h2 className="esports-heading text-xl text-white mb-4 absolute top-6 left-6">My Stats</h2>
      <div className="w-full h-[300px] mt-8">
        {content}
      </div>
    </div>
  );
};
