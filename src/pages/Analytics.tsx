import React, { useMemo, useState } from 'react';
import { 
  AreaChart, Area, 
  LineChart, Line, 
  BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useUser } from '../context/UserContext';
import { TrendingUp, Activity, Hexagon, Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Flame, Dumbbell, Award, Target } from 'lucide-react';
import { clsx } from 'clsx';
import { calculateStreak } from '../utils/streakUtils';

export const Analytics: React.FC = () => {
  const { workoutHistory, profile, weightHistory, scheduledWorkoutDays, targetWorkoutsPerWeek, workoutSplit } = useUser();
  const [selectedExercise, setSelectedExercise] = useState<string>('Bench Press');
  const [statType, setStatType] = useState<'1rm' | 'max_weight'>('1rm');
  const [graphRange, setGraphRange] = useState<'1M' | '3M' | '6M' | '1Y'>('1M');
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // 1. Volume Progression
  const volumeData = useMemo(() => {
    const sorted = [...workoutHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map(log => ({
      date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      volume: log.volume,
      name: log.name
    }));
  }, [workoutHistory]);

  // 2. 1RM & Max Weight Tracking
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
            // Brzycki formula
            const est1RM = set.weight * (36 / (37 - set.reps));
            if (est1RM > dailyMax1RM) dailyMax1RM = est1RM;
            
            // Raw Max Weight
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

    const exList = Array.from(exercises).sort();
    return { allExercises: exList, oneRepMaxData: rmData, maxWeightData: maxData };
  }, [workoutHistory]);

  // Handle default selection if 'Bench Press' is not in history
  React.useEffect(() => {
    if (allExercises.length > 0 && !allExercises.includes(selectedExercise)) {
      setSelectedExercise(allExercises[0]);
    }
  }, [allExercises, selectedExercise]);

  const selectedChartData = statType === '1rm' ? (oneRepMaxData[selectedExercise] || []) : (maxWeightData[selectedExercise] || []);
  const yDataKey = statType === '1rm' ? 'rm' : 'weight';
  const yAxisLabel = statType === '1rm' ? 'Est. 1RM (lbs)' : 'Max Weight (lbs)';

  const rmYMin = selectedChartData.length > 0 ? Math.floor(Math.min(...selectedChartData.map((d: any) => d[yDataKey])) * 0.9) : 0;
  const rmYMax = selectedChartData.length > 0 ? Math.ceil(Math.max(...selectedChartData.map((d: any) => d[yDataKey])) * 1.1) : 100;

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

  // 4. Monthly Consistency Calendar & Stats
  const formatLocalYMD = (d: Date | string) => {
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const todayYMD = formatLocalYMD(new Date());
  const currentStreak = useMemo(
    () => calculateStreak(workoutHistory, scheduledWorkoutDays),
    [workoutHistory, scheduledWorkoutDays]
  );

  const calendarData = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startWeekday = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    const daysInMonth = lastDayOfMonth.getDate();

    const workoutsByDate = new Map<string, typeof workoutHistory>();
    workoutHistory.forEach(w => {
      const ymd = formatLocalYMD(w.date);
      const list = workoutsByDate.get(ymd) || [];
      list.push(w);
      workoutsByDate.set(ymd, list);
    });

    const gradeRank: Record<string, number> = { 'S+': 6, 'S': 5, 'A': 4, 'B': 3, 'C': 2 };

    const cells: Array<{
      ymd: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isFuture: boolean;
      isScheduled: boolean;
      workouts: typeof workoutHistory;
      bestGrade: string | null;
      hasPr: boolean;
    }> = [];

    // Leading padding days from previous month
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDate - i);
      const ymd = formatLocalYMD(d);
      const dayWorkouts = workoutsByDate.get(ymd) || [];
      cells.push({
        ymd,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isToday: ymd === todayYMD,
        isFuture: ymd > todayYMD,
        isScheduled: scheduledWorkoutDays?.includes(d.getDay()) ?? false,
        workouts: dayWorkouts,
        bestGrade: null,
        hasPr: false,
      });
    }

    let monthWorkoutsCount = 0;
    let activeDaysCount = 0;
    let sTierCount = 0;
    let elapsedScheduledDays = 0;
    let completedScheduledOrActiveDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const ymd = formatLocalYMD(d);
      const dayWorkouts = workoutsByDate.get(ymd) || [];
      const isFuture = ymd > todayYMD;
      const isScheduled = scheduledWorkoutDays?.includes(d.getDay()) ?? false;

      let bestGrade: string | null = null;
      let hasPr = false;

      if (dayWorkouts.length > 0) {
        activeDaysCount++;
        monthWorkoutsCount += dayWorkouts.length;
        dayWorkouts.forEach(w => {
          const g = w.grade || 'A';
          if (!bestGrade || (gradeRank[g] || 0) > (gradeRank[bestGrade] || 0)) {
            bestGrade = g;
          }
          if (w.isPr) hasPr = true;
          if (g === 'S+' || g === 'S') sTierCount++;
        });
      }

      if (!isFuture) {
        if (isScheduled) elapsedScheduledDays++;
        if (dayWorkouts.length > 0) completedScheduledOrActiveDays++;
      }

      cells.push({
        ymd,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: ymd === todayYMD,
        isFuture,
        isScheduled,
        workouts: dayWorkouts,
        bestGrade,
        hasPr,
      });
    }

    // Trailing padding days to complete the last week row
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const ymd = formatLocalYMD(d);
      cells.push({
        ymd,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isToday: ymd === todayYMD,
        isFuture: ymd > todayYMD,
        isScheduled: scheduledWorkoutDays?.includes(d.getDay()) ?? false,
        workouts: [],
        bestGrade: null,
        hasPr: false,
      });
    }

    const targetDenominator = Math.max(elapsedScheduledDays, targetWorkoutsPerWeek || 4);
    const consistencyPercent = elapsedScheduledDays > 0
      ? Math.min(100, Math.round((completedScheduledOrActiveDays / elapsedScheduledDays) * 100))
      : Math.min(100, Math.round((activeDaysCount / targetDenominator) * 100));

    return {
      cells,
      monthWorkoutsCount,
      activeDaysCount,
      sTierCount,
      consistencyPercent,
    };
  }, [calendarMonth, workoutHistory, scheduledWorkoutDays, targetWorkoutsPerWeek, todayYMD]);

  const selectedDayInfo = useMemo(() => {
    const targetYMD = selectedCalendarDate || todayYMD;
    return calendarData.cells.find(c => c.ymd === targetYMD) || null;
  }, [selectedCalendarDate, todayYMD, calendarData.cells]);

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

  // 7. Weekly Weight Average Data
  const weeklyWeightAvgData = useMemo(() => {
    if (weightGraphData.length === 0) return [];

    const weeksMap = new Map<string, { sum: number; count: number; dateStart: Date }>();

    weightGraphData.forEach(w => {
      const d = new Date(w.date + 'T12:00:00');
      
      // Get the Monday of this week
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d);
      monday.setDate(diff);
      monday.setHours(0, 0, 0, 0);
      
      const weekKey = monday.toISOString();
      
      const existing = weeksMap.get(weekKey);
      if (existing) {
        weeksMap.set(weekKey, { sum: existing.sum + w.weightLbs, count: existing.count + 1, dateStart: monday });
      } else {
        weeksMap.set(weekKey, { sum: w.weightLbs, count: 1, dateStart: monday });
      }
    });

    return Array.from(weeksMap.values())
      .sort((a, b) => a.dateStart.getTime() - b.dateStart.getTime())
      .map(data => ({
        displayDate: data.dateStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        avgWeightLbs: Number((data.sum / data.count).toFixed(1))
      }));
  }, [weightGraphData]);

  const weeklyWeightYMin = weeklyWeightAvgData.length > 0 ? Math.floor(Math.min(...weeklyWeightAvgData.map(d => d.avgWeightLbs)) - 5) : 0;
  const weeklyWeightYMax = weeklyWeightAvgData.length > 0 ? Math.ceil(Math.max(...weeklyWeightAvgData.map(d => d.avgWeightLbs)) + 5) : 100;


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
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A202C', borderColor: '#b52eff', borderRadius: '8px' }}
                  itemStyle={{ color: '#b52eff', fontWeight: 'bold' }}
                  formatter={(value: any) => [`${value}`, 'Level']}
                />
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
          
          <div className="h-52 w-full">
            {selectedChartData.length < 2 ? (
              <div className="h-full flex items-center justify-center text-gray-500 font-inter text-sm text-center px-4">
                Need at least 2 sessions of {selectedExercise} to show progression.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedChartData as any[]} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                  <XAxis dataKey="date" stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[rmYMin, rmYMax]} stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
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
      </div>

      {/* Monthly Consistency Calendar */}
      <div className="esports-panel p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="esports-heading text-xl text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-neon-green" /> Consistency Tracker
            </h2>
            <p className="text-xs text-gray-400 font-inter mt-0.5">
              Tap any day to inspect logged sessions & workout grades
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className="p-2 rounded-lg bg-tactical-800 hover:bg-tactical-700 border border-tactical-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="min-w-[140px] text-center font-rajdhani font-bold text-base uppercase tracking-wider text-white bg-tactical-900 border border-tactical-700 px-3 py-1.5 rounded-lg">
              {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button
              onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="p-2 rounded-lg bg-tactical-800 hover:bg-tactical-700 border border-tactical-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {(calendarMonth.getMonth() !== new Date().getMonth() || calendarMonth.getFullYear() !== new Date().getFullYear()) && (
              <button
                onClick={() => {
                  const now = new Date();
                  setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                  setSelectedCalendarDate(todayYMD);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-neon-blue/15 border border-neon-blue/40 text-neon-blue text-xs font-rajdhani font-bold uppercase tracking-wider hover:bg-neon-blue/25 transition-colors cursor-pointer"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-tactical-900/90 border border-tactical-700 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-gold/10 border border-neon-gold/30 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-neon-gold" />
            </div>
            <div>
              <span className="text-[10px] font-rajdhani uppercase tracking-widest text-gray-400 block">Current Streak</span>
              <span className="text-xl font-rajdhani font-bold text-white">{currentStreak} <span className="text-xs text-gray-400 font-normal">Days</span></span>
            </div>
          </div>

          <div className="bg-tactical-900/90 border border-tactical-700 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center shrink-0">
              <Dumbbell className="w-5 h-5 text-neon-blue" />
            </div>
            <div>
              <span className="text-[10px] font-rajdhani uppercase tracking-widest text-gray-400 block">Month Sessions</span>
              <span className="text-xl font-rajdhani font-bold text-white">{calendarData.monthWorkoutsCount} <span className="text-xs text-gray-400 font-normal">Logged</span></span>
            </div>
          </div>

          <div className="bg-tactical-900/90 border border-tactical-700 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-green/10 border border-neon-green/30 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <span className="text-[10px] font-rajdhani uppercase tracking-widest text-gray-400 block">Schedule Hit Rate</span>
              <span className="text-xl font-rajdhani font-bold text-neon-green">{calendarData.consistencyPercent}%</span>
            </div>
          </div>

          <div className="bg-tactical-900/90 border border-tactical-700 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-neon-purple" />
            </div>
            <div>
              <span className="text-[10px] font-rajdhani uppercase tracking-widest text-gray-400 block">S / S+ Sessions</span>
              <span className="text-xl font-rajdhani font-bold text-white">{calendarData.sTierCount} <span className="text-xs text-gray-400 font-normal">Elite</span></span>
            </div>
          </div>
        </div>

        {/* 7-Column Weekday Headers */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayLabel => (
            <div key={dayLabel} className="text-center text-[11px] font-rajdhani font-bold uppercase tracking-widest text-gray-400 py-1">
              {dayLabel}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarData.cells.map((cell) => {
            const hasWorkout = cell.workouts.length > 0;
            const isElite = cell.bestGrade === 'S+' || cell.bestGrade === 'S';
            const isSelected = (selectedCalendarDate || todayYMD) === cell.ymd;
            const isMissedScheduled = cell.isCurrentMonth && !cell.isFuture && !cell.isToday && cell.isScheduled && !hasWorkout;

            return (
              <button
                key={cell.ymd}
                type="button"
                onClick={() => setSelectedCalendarDate(cell.ymd)}
                className={clsx(
                  "relative aspect-square sm:aspect-auto sm:h-16 rounded-lg border p-1 sm:p-2 flex flex-col justify-between items-center sm:items-stretch transition-all cursor-pointer",
                  !cell.isCurrentMonth && "opacity-30 bg-tactical-950/40 border-tactical-800/60",
                  cell.isCurrentMonth && hasWorkout && isElite && "bg-neon-gold/15 border-neon-gold shadow-[0_0_12px_rgba(255,215,0,0.2)]",
                  cell.isCurrentMonth && hasWorkout && !isElite && "bg-neon-blue/15 border-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.2)]",
                  cell.isCurrentMonth && !hasWorkout && isMissedScheduled && "bg-neon-red/5 border-neon-red/30",
                  cell.isCurrentMonth && !hasWorkout && !isMissedScheduled && "bg-tactical-900/80 border-tactical-700/80 hover:border-tactical-600",
                  cell.isToday && "ring-2 ring-neon-green",
                  isSelected && "ring-2 ring-white scale-[1.02] z-10"
                )}
              >
                <div className="w-full flex items-center justify-between">
                  <span className={clsx(
                    "text-xs font-rajdhani font-bold leading-none",
                    cell.isToday ? "text-neon-green" : hasWorkout ? "text-white" : "text-gray-400"
                  )}>
                    {cell.dayNumber}
                  </span>
                  {cell.hasPr && (
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-gold shadow-[0_0_6px_#ffd700]" title="PR Broken" />
                  )}
                </div>

                <div className="flex items-center justify-center sm:justify-end w-full mt-auto">
                  {hasWorkout ? (
                    <span className={clsx(
                      "text-[10px] sm:text-xs font-rajdhani font-extrabold px-1.5 py-0.5 rounded leading-none",
                      isElite
                        ? "bg-neon-gold/25 text-neon-gold border border-neon-gold/50"
                        : "bg-neon-blue/25 text-neon-blue border border-neon-blue/50"
                    )}>
                      {cell.bestGrade}
                    </span>
                  ) : cell.isCurrentMonth && cell.isScheduled && !cell.isFuture ? (
                    <span className="text-[9px] font-rajdhani uppercase tracking-wider text-neon-red/70 hidden sm:inline">
                      {cell.isToday ? 'Due' : 'Missed'}
                    </span>
                  ) : cell.isCurrentMonth && !cell.isScheduled ? (
                    <span className="text-[9px] font-rajdhani uppercase tracking-wider text-gray-600 hidden sm:inline">
                      Rest
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Day Details Bar & Legend */}
        <div className="mt-4 pt-4 border-t border-tactical-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {selectedDayInfo ? (
            <div className="flex-1 bg-tactical-900 border border-tactical-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-rajdhani font-bold uppercase tracking-wider text-gray-400">
                  {new Date(selectedDayInfo.ymd + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                {selectedDayInfo.isToday && (
                  <span className="text-[10px] font-rajdhani font-bold uppercase px-2 py-0.5 rounded bg-neon-green/15 text-neon-green border border-neon-green/30">
                    Today
                  </span>
                )}
              </div>
              {selectedDayInfo.workouts.length > 0 ? (
                <div className="space-y-1.5">
                  {selectedDayInfo.workouts.map(w => (
                    <div key={w.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          "text-xs font-rajdhani font-extrabold px-1.5 py-0.5 rounded border",
                          (w.grade === 'S+' || w.grade === 'S')
                            ? "bg-neon-gold/20 text-neon-gold border-neon-gold/50"
                            : "bg-neon-blue/20 text-neon-blue border-neon-blue/50"
                        )}>
                          {w.grade || 'A'}
                        </span>
                        <span className="font-bold text-white">{w.name}</span>
                        {w.isPr && (
                          <span className="text-[10px] font-rajdhani font-bold uppercase px-1.5 py-0.5 rounded bg-neon-gold/20 text-neon-gold">
                            PR
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {w.durationMinutes}m • {(w.volume || 0).toLocaleString()} lbs
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 font-inter">
                  {selectedDayInfo.isScheduled
                    ? `Scheduled: ${workoutSplit?.[new Date(selectedDayInfo.ymd + 'T12:00:00').getDay()] || 'Workout'} (${selectedDayInfo.isFuture || selectedDayInfo.isToday ? 'Upcoming' : 'No session logged'})`
                    : 'Scheduled Rest Day — No workout logged.'}
                </p>
              )}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 text-xs font-rajdhani uppercase tracking-wider text-gray-400 shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-neon-gold/30 border border-neon-gold inline-block" /> S / S+ Rank
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-neon-blue/30 border border-neon-blue inline-block" /> Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-tactical-900 border border-tactical-700 inline-block" /> Rest
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weight Trend Graph */}
        <div className="esports-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="esports-heading text-xl text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neon-blue" /> Weight Trend (Daily)
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

        {/* Weekly Avg Weight Trend Graph */}
        <div className="esports-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="esports-heading text-xl text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-neon-purple" /> Weekly Avg Weight
            </h1>
          </div>
          
          <div className="h-52 w-full">
            {weeklyWeightAvgData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyWeightAvgData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
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
                    domain={[weeklyWeightYMin, weeklyWeightYMax]} 
                    stroke="#718096" 
                    tick={{ fill: '#718096', fontSize: 12, fontFamily: 'Inter' }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A202C', borderColor: '#b52eff', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#b52eff', fontWeight: 'bold' }}
                    labelStyle={{ color: '#A0AEC0', marginBottom: '4px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgWeightLbs" 
                    name="Avg Weight (lbs)"
                    stroke="#b52eff" 
                    strokeWidth={3} 
                    dot={{ fill: '#1A202C', stroke: '#b52eff', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, fill: '#b52eff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 font-inter text-sm flex-col gap-2">
                <span>Not enough weekly data to display a trend.</span>
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
