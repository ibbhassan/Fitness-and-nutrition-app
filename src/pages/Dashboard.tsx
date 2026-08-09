import React from 'react';
import { clsx } from 'clsx';
import { RankDisplay } from '../components/RankDisplay';
import { seedSteps } from '../utils/seedData';
import { useUser } from '../context/UserContext';
import { Flame, Target, Wheat, Footprints, Calendar, Dumbbell, Droplet, Activity, Award, CheckCircle, TrendingDown } from 'lucide-react';
import { getWeekString } from '../utils/dateUtils';
import { calculateStreak } from '../utils/streakUtils';

export const Dashboard: React.FC = () => {
  const { profile, nutrition, targetWorkoutsPerWeek, scheduledWorkoutDays, workoutSplit, weightHistory, workoutHistory, manualQuestCompletions, toggleManualQuest, dailySteps, biometrics } = useUser();
  const { calories, protein, carbs, fat } = nutrition;

  const formatLocalDate = (d: Date | string) => {
    const date = new Date(d);
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  };

  const todayStr = formatLocalDate(new Date());
  const weekStr = getWeekString(new Date());

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
      const dateStr = formatLocalDate(d);
      const isLogged = weightHistory.some(entry => {
        // If entry.date is an ISO string, format it. If it's already YYYY-MM-DD, formatLocalDate handles it.
        return formatLocalDate(entry.date) === dateStr;
      });
      return { label: days[d.getDay()], isLogged, date: dateStr };
    });
  };

  const weekLabels = getWeekLabels();

  // Average weight for THIS week only
  const thisWeekLogs = weightHistory.filter(entry => 
    weekLabels.some(wl => wl.date === formatLocalDate(entry.date))
  );

  const avgWeight = thisWeekLogs.length > 0 
    ? (thisWeekLogs.reduce((sum, entry) => sum + entry.weightLbs, 0) / thisWeekLogs.length).toFixed(1)
    : (biometrics?.weightLbs || 0).toFixed(1);

  const daysLogged = thisWeekLogs.length;

  // Dynamic data for weekly consistency (last 7 days)
  const getConsistencyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dateStr = formatLocalDate(d);
      
      const loggedWorkouts = workoutHistory.filter(w => formatLocalDate(w.date) === dateStr);
      let bestWorkout = null;
      if (loggedWorkouts.length > 0) {
        const gradeValues: Record<string, number> = { 'S+': 7, 'S': 6, 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'F': 1 };
        bestWorkout = loggedWorkouts.reduce((best, curr) => {
          const currGrade = curr.grade || 'A';
          const bestGrade = best.grade || 'A';
          return (gradeValues[currGrade] || 0) > (gradeValues[bestGrade] || 0) ? curr : best;
        });
      }
      
      const isScheduled = scheduledWorkoutDays.includes(d.getDay());
      
      let status = 'rest';
      if (bestWorkout) {
        status = 'completed';
      } else if (isScheduled) {
        // If it's strictly before today, it's missed. If today or future, pending.
        const isPastDay = d.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        status = isPastDay ? 'missed' : 'pending';
      }
      
      return {
        day: days[d.getDay()],
        status,
        grade: bestWorkout ? (bestWorkout.grade || 'A') : '-'
      };
    });
  };

  const consistencyData = getConsistencyData();
  const weekStartDate = new Date(weekStr + 'T00:00:00');
  const workoutsThisWeek = workoutHistory.filter(w => new Date(w.date) >= weekStartDate).length;

  const currentStreak = calculateStreak(workoutHistory, scheduledWorkoutDays);
  
  const dailyStepsKey = `daily-steps-${todayStr}`;
  const dailyWaterKey = `daily-water-${todayStr}`;
  const weeklyWorkoutsKey = `weekly-workouts-${weekStr}`;
  const weeklyPrKey = `weekly-pr-${weekStr}`;
  const weeklyNutritionKey = `weekly-nutrition-${weekStr}`;

  const isWeeklyQuestComplete = workoutsThisWeek >= targetWorkoutsPerWeek || !!manualQuestCompletions[weeklyWorkoutsKey];
  const isDailyStepsComplete = dailySteps >= seedSteps.target || !!manualQuestCompletions[dailyStepsKey];
  
  const prsThisWeek = workoutHistory.some(w => w.isPr && new Date(w.date) >= weekStartDate);
  
  const isWeeklyPrComplete = prsThisWeek || !!manualQuestCompletions[weeklyPrKey];
  const isWeeklyNutritionComplete = !!manualQuestCompletions[weeklyNutritionKey];

  React.useEffect(() => {
    if (workoutsThisWeek >= targetWorkoutsPerWeek && !manualQuestCompletions[weeklyWorkoutsKey]) {
      toggleManualQuest(weeklyWorkoutsKey, 100);
    }
  }, [workoutsThisWeek, targetWorkoutsPerWeek]);

  React.useEffect(() => {
    if (dailySteps >= seedSteps.target && !manualQuestCompletions[dailyStepsKey]) {
      toggleManualQuest(dailyStepsKey, 10);
    }
  }, [dailySteps, seedSteps.target]);

  React.useEffect(() => {
    if (prsThisWeek && !manualQuestCompletions[weeklyPrKey]) {
      toggleManualQuest(weeklyPrKey, 50);
    }
  }, [prsThisWeek]);

  const getUpcomingWorkout = () => {
    if (!scheduledWorkoutDays || scheduledWorkoutDays.length === 0) return { title: 'No Workouts Scheduled', subtitle: 'Update your schedule in settings' };
    
    const today = new Date().getDay();
    const formatTitle = (splitName: string | undefined) => {
      const name = splitName || 'Workout';
      return name.toLowerCase().includes('day') || name.toLowerCase().includes('workout') || name.toLowerCase() === 'rest' 
        ? name 
        : `${name} Day`;
    };

    if (scheduledWorkoutDays.includes(today)) {
      return { title: formatTitle(workoutSplit[today]), subtitle: 'Today' };
    }
    
    // Find next scheduled day
    let nextDay = today + 1;
    let daysAway = 1;
    for (let i = 0; i < 7; i++) {
      if (nextDay > 6) nextDay = 0;
      if (scheduledWorkoutDays.includes(nextDay)) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const subtitle = daysAway === 1 ? 'Tomorrow' : `Upcoming on ${days[nextDay]}`;
        return { title: formatTitle(workoutSplit[nextDay]), subtitle };
      }
      nextDay++;
      daysAway++;
    }
    return { title: 'Rest Day', subtitle: 'Enjoy your recovery' };
  };

  const upcomingWorkout = getUpcomingWorkout();

  return (
    <div className="space-y-6 fade-in">
      {/* Top Section: Rank and Overview */}
      <RankDisplay profile={profile} />

      {/* Middle Section: Stats & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Stats & Upcoming Workout) */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">

          <div className="esports-panel p-6 shrink-0">
            <h2 className="esports-heading text-xl text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-neon-gold" /> Upcoming Workout
            </h2>
              <div className="bg-tactical-900 border border-tactical-700 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-tactical-800 flex items-center justify-center border border-neon-gold">
                    <Dumbbell className="w-5 h-5 text-neon-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{upcomingWorkout.title}</h3>
                    <p className="text-sm text-gray-400">{upcomingWorkout.subtitle}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Subtract 180 EP?')) {
                    addEp(-180);
                  }
                }}
                className="mt-4 w-full bg-red-500/20 text-red-500 border border-red-500/50 p-2 rounded-lg text-sm font-bold hover:bg-red-500/30 transition-colors"
              >
                TEST: Subtract 180 EP
              </button>
            </div>

          {/* Active Challenges */}
          <div className="esports-panel p-6 shrink-0">
            <h2 className="esports-heading text-xl text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-neon-blue" /> Active Challenges
            </h2>
            
            <div className="space-y-3">
              {/* Daily Challenge */}
              <button 
                onClick={() => toggleManualQuest(dailyStepsKey, 10)}
                className={clsx("w-full text-left bg-tactical-900 border border-tactical-700 p-3 rounded-lg relative overflow-hidden transition-all hover:border-neon-purple/50 cursor-pointer", isDailyStepsComplete ? "opacity-50" : "")}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-neon-purple" />
                <div className="flex justify-between items-start ml-2">
                  <div>
                    <span className="text-[10px] text-neon-purple font-rajdhani uppercase font-bold tracking-wider">Daily Challenge</span>
                    <h3 className={clsx("text-sm font-bold text-white mt-0.5", isDailyStepsComplete ? "line-through" : "")}>Hit 10k Steps</h3>
                  </div>
                  {isDailyStepsComplete ? (
                    <CheckCircle className="w-4 h-4 text-neon-purple" />
                  ) : (
                    <span className="text-xs font-rajdhani font-bold text-neon-green">+10 EP</span>
                  )}
                </div>
              </button>

              <button 
                onClick={() => toggleManualQuest(dailyWaterKey, 10)}
                className={clsx("w-full text-left bg-tactical-900 border border-tactical-700 p-3 rounded-lg relative overflow-hidden transition-all hover:border-neon-purple/50 cursor-pointer", manualQuestCompletions[dailyWaterKey] ? "opacity-50" : "")}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-neon-purple" />
                <div className="flex justify-between items-start ml-2">
                  <div>
                    <span className="text-[10px] text-neon-purple font-rajdhani uppercase font-bold tracking-wider">Daily Challenge</span>
                    <h3 className={clsx("text-sm font-bold text-white mt-0.5", manualQuestCompletions[dailyWaterKey] ? "line-through" : "")}>Drink 1 Gallon of Water</h3>
                  </div>
                  {manualQuestCompletions[dailyWaterKey] ? (
                    <CheckCircle className="w-4 h-4 text-neon-purple" />
                  ) : (
                    <span className="text-xs font-rajdhani font-bold text-neon-green">+10 EP</span>
                  )}
                </div>
              </button>

              {/* Weekly Challenges */}
              <button 
                onClick={() => toggleManualQuest(weeklyWorkoutsKey, 100)}
                className={clsx("w-full text-left bg-tactical-900 border border-tactical-700 p-3 rounded-lg relative overflow-hidden transition-all hover:border-neon-blue/50 cursor-pointer", isWeeklyQuestComplete ? "opacity-50" : "")}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-neon-blue" />
                <div className="flex justify-between items-start ml-2">
                  <div>
                    <span className="text-[10px] text-neon-blue font-rajdhani uppercase font-bold tracking-wider">Weekly Challenge</span>
                    <h3 className={clsx("text-sm font-bold text-white mt-0.5", isWeeklyQuestComplete ? "line-through" : "")}>Complete {targetWorkoutsPerWeek} Workouts</h3>
                  </div>
                  {isWeeklyQuestComplete ? (
                    <CheckCircle className="w-4 h-4 text-neon-blue" />
                  ) : (
                    <span className="text-xs font-rajdhani font-bold text-neon-green">+100 EP</span>
                  )}
                </div>
              </button>

              <button 
                onClick={() => toggleManualQuest(weeklyPrKey, 50)}
                className={clsx("w-full text-left bg-tactical-900 border border-tactical-700 p-3 rounded-lg relative overflow-hidden transition-all hover:border-neon-blue/50 cursor-pointer", isWeeklyPrComplete ? "opacity-50" : "")}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-neon-blue" />
                <div className="flex justify-between items-start ml-2">
                  <div>
                    <span className="text-[10px] text-neon-blue font-rajdhani uppercase font-bold tracking-wider">Weekly Challenge</span>
                    <h3 className={clsx("text-sm font-bold text-white mt-0.5", isWeeklyPrComplete ? "line-through" : "")}>Hit a new PR</h3>
                  </div>
                  {isWeeklyPrComplete ? (
                    <CheckCircle className="w-4 h-4 text-neon-blue" />
                  ) : (
                    <span className="text-xs font-rajdhani font-bold text-neon-green">+50 EP</span>
                  )}
                </div>
              </button>

              <button 
                onClick={() => toggleManualQuest(weeklyNutritionKey, 200)}
                className={clsx("w-full text-left bg-tactical-900 border border-tactical-700 p-3 rounded-lg relative overflow-hidden transition-all hover:border-neon-blue/50 cursor-pointer", isWeeklyNutritionComplete ? "opacity-50" : "")}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-neon-blue" />
                <div className="flex justify-between items-start ml-2">
                  <div>
                    <span className="text-[10px] text-neon-blue font-rajdhani uppercase font-bold tracking-wider">Weekly Challenge</span>
                    <h3 className={clsx("text-sm font-bold text-white mt-0.5", isWeeklyNutritionComplete ? "line-through" : "")}>Track Nutrition 7 Days</h3>
                  </div>
                  {isWeeklyNutritionComplete ? (
                    <CheckCircle className="w-4 h-4 text-neon-blue" />
                  ) : (
                    <span className="text-xs font-rajdhani font-bold text-neon-green">+200 EP</span>
                  )}
                </div>
              </button>

            </div>
          </div>
        </div>

        {/* Right Column (Nutrition and Steps) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Overview Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nutrition Summary */}
            <div className="esports-panel p-6">
              <h2 className="esports-heading text-xl text-white mb-4">Daily Fuel</h2>
              <div className="space-y-4">
                
                {/* Calories */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400 flex items-center gap-1"><Flame className="w-4 h-4 text-neon-red"/> Calories</span>
                    <span className="text-white font-bold">{Math.round(calories.current)} <span className="text-gray-500 font-normal">/ {calories.target}</span></span>
                  </div>
                  <div className="h-1.5 w-full bg-tactical-800 rounded-full overflow-hidden">
                    <div className="h-full bg-neon-red" style={{ width: `${Math.min((calories.current / calories.target) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Protein */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400 flex items-center gap-1"><Target className="w-4 h-4 text-neon-blue"/> Protein</span>
                    <span className="text-white font-bold">{Math.round(protein.current)}g <span className="text-gray-500 font-normal">/ {protein.target}g</span></span>
                  </div>
                  <div className="h-1.5 w-full bg-tactical-800 rounded-full overflow-hidden">
                    <div className="h-full bg-neon-blue" style={{ width: `${Math.min((protein.current / protein.target) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Carbs */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400 flex items-center gap-1"><Wheat className="w-4 h-4 text-neon-gold"/> Carbs</span>
                    <span className="text-white font-bold">{Math.round(carbs.current)}g <span className="text-gray-500 font-normal">/ {carbs.target}g</span></span>
                  </div>
                  <div className="h-1.5 w-full bg-tactical-800 rounded-full overflow-hidden">
                    <div className="h-full bg-neon-gold" style={{ width: `${Math.min((carbs.current / carbs.target) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Fats */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400 flex items-center gap-1"><Droplet className="w-4 h-4 text-neon-purple"/> Fats</span>
                    <span className="text-white font-bold">{Math.round(fat.current)}g <span className="text-gray-500 font-normal">/ {fat.target}g</span></span>
                  </div>
                  <div className="h-1.5 w-full bg-tactical-800 rounded-full overflow-hidden">
                    <div className="h-full bg-neon-purple" style={{ width: `${Math.min((fat.current / fat.target) * 100, 100)}%` }} />
                  </div>
                </div>

              </div>
            </div>

            {/* Daily Steps */}
            <div className="esports-panel p-6 flex flex-col items-center justify-center relative overflow-hidden">
              <Footprints className="absolute -right-6 -bottom-6 w-32 h-32 text-neon-green opacity-5" />
              <div className="w-full text-left mb-2">
                <h2 className="esports-heading text-xl text-white">Daily Steps</h2>
              </div>
              
              <div className="relative w-32 h-32 flex items-center justify-center z-10">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-tactical-700" />
                  <circle 
                    cx="64" cy="64" r="56" 
                    stroke="currentColor" strokeWidth="6" fill="transparent" 
                    strokeDasharray="351.8" 
                    strokeDashoffset={351.8 - (351.8 * Math.min((dailySteps / seedSteps.target), 1))} 
                    className="text-neon-green transition-all duration-1000" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-rajdhani font-bold text-white">{dailySteps.toLocaleString()}</span>
                  <span className="text-xs text-gray-400 font-inter">/ {seedSteps.target.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Weekly Consistency Tracker */}
          <div className="esports-panel p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="esports-heading text-xl text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-neon-blue" /> Weekly Consistency
              </h2>
              <span className="text-sm text-gray-400 font-rajdhani uppercase tracking-widest">Streak: {currentStreak} Day{currentStreak !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="flex justify-between items-center gap-2">
              {consistencyData.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <span className="text-xs text-gray-500 mb-2 font-rajdhani uppercase">{day.day}</span>
                  <div 
                    className={clsx(
                      "w-full aspect-square rounded-md border-2 flex items-center justify-center transition-all duration-300",
                      day.status === 'completed' && day.grade.includes('S') ? "bg-neon-gold/20 border-neon-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]" :
                      day.status === 'completed' ? "bg-neon-blue/20 border-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.3)]" :
                      day.status === 'rest' ? "bg-tactical-700 border-tactical-600" :
                      day.status === 'missed' ? "bg-neon-red/10 border-neon-red/50" :
                      "bg-tactical-800 border-tactical-700 border-dashed"
                    )}
                  >
                    {day.status === 'completed' && <span className="text-white font-rajdhani font-bold">{day.grade}</span>}
                    {day.status === 'rest' && <span className="text-gray-400 text-xs font-inter">Rest</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Body Weight Intel */}
          <div className="esports-panel p-6 flex flex-col justify-center items-center relative overflow-hidden">
            <TrendingDown className="absolute -right-4 -bottom-4 w-32 h-32 text-neon-purple opacity-5" />
            
            {/* 7 Days tracker */}
            <div className="flex gap-4 mb-6 z-10">
              {weekLabels.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-gray-500 font-rajdhani uppercase">{day.label}</span>
                  <div className={clsx(
                    "w-6 h-6 rounded border flex items-center justify-center transition-all duration-300",
                    day.isLogged 
                      ? "bg-neon-purple/20 border-neon-purple shadow-[0_0_8px_rgba(181,53,245,0.4)]" 
                      : "bg-tactical-800 border-tactical-600"
                  )}>
                    {day.isLogged && <div className="w-2 h-2 rounded-sm bg-neon-purple" />}
                  </div>
                </div>
              ))}
            </div>

            <span className="text-xs text-neon-purple font-rajdhani uppercase font-bold tracking-widest mb-2 z-10">Current Weekly Average</span>
            <div className="flex items-end gap-2 mb-2 z-10">
              <span className="text-5xl font-rajdhani font-bold text-white">{avgWeight}</span>
              <span className="text-lg text-gray-400 mb-1">Lbs</span>
            </div>
            <p className="text-xs text-gray-500 font-inter z-10">
              {daysLogged === 7 ? "Final week average calculated." : `Based on ${daysLogged} days logged this week.`}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
