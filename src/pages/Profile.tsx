import React, { useState } from 'react';
import { User, Settings, Medal, Shield, Target, Flame, Activity, X } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { StatHexagon } from '../components/StatHexagon';
import { AvatarCustomizer } from '../components/AvatarCustomizer';
import type { DailyNutrition } from '../types';
import clsx from 'clsx';

export const Profile: React.FC = () => {
  const { user, profile, biometrics, targetWorkoutsPerWeek, scheduledWorkoutDays, workoutSplit, nutrition, completeOnboarding } = useUser();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<'Cut' | 'Bulk' | 'Maintenance'>(profile?.currentMode || 'Maintenance');
  const [localSplit, setLocalSplit] = useState<Record<number, string>>(workoutSplit || {});

  const avatarUrl = '/images/avatar_3d.png';

  const calculateNewMacros = (newGoal: 'Cut' | 'Bulk' | 'Maintenance'): DailyNutrition => {
    if (!biometrics) return nutrition;

    // Convert to metric
    const heightCm = ((biometrics.heightFeet * 12) + biometrics.heightInches) * 2.54;
    const weightKg = biometrics.weightLbs * 0.453592;

    // Base Mifflin-St Jeor
    let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * biometrics.age);
    if (biometrics.gender === 'Male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // Activity Multiplier based on workouts per week
    let multiplier = 1.2;
    if (targetWorkoutsPerWeek === 3) multiplier = 1.375;
    if (targetWorkoutsPerWeek === 4) multiplier = 1.465;
    if (targetWorkoutsPerWeek === 5) multiplier = 1.55;
    if (targetWorkoutsPerWeek === 6) multiplier = 1.725;

    let tdee = bmr * multiplier;

    // Goal Modifier
    if (newGoal === 'Cut') tdee -= 500;
    if (newGoal === 'Bulk') tdee += 500;

    const targetCals = Math.round(tdee);
    
    // Intelligent Macros Split (1g protein per lb of bodyweight)
    const targetProtein = Math.round(biometrics.weightLbs * 1.0);
    const fatMultiplier = 0.4; // balanced approach
    const targetFat = Math.max(55, Math.round(biometrics.weightLbs * fatMultiplier));
    
    const proteinCals = targetProtein * 4;
    const fatCals = targetFat * 9;
    const remainingCals = targetCals - proteinCals - fatCals;
    const targetCarbs = Math.max(0, Math.round(remainingCals / 4));

    return {
      calories: { current: nutrition.calories.current, target: targetCals },
      protein: { current: nutrition.protein.current, target: targetProtein },
      carbs: { current: nutrition.carbs.current, target: targetCarbs },
      fat: { current: nutrition.fat.current, target: targetFat },
    };
  };

  const handleUpdateGoal = () => {
    if (!biometrics) return;
    const newMacros = calculateNewMacros(selectedGoal);
    completeOnboarding(selectedGoal, targetWorkoutsPerWeek, scheduledWorkoutDays, workoutSplit, newMacros, biometrics);
    setShowGoalModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 fade-in pb-20">
      
      {/* Top Banner: Agent ID Card */}
      <div className="esports-panel p-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-neon-gold/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
          
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-neon-blue flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)] shrink-0 bg-tactical-800">
                <img src={avatarUrl} alt="Personal Avatar" className="w-full h-full object-cover scale-110" />
              </div>
              <div>
                <h1 className="esports-heading text-3xl text-white tracking-widest">{user?.username || 'AGENT'}</h1>
                <p className="text-neon-blue font-rajdhani font-bold tracking-wider uppercase flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Level {profile?.level || 1} Operative
                </p>
              </div>
            </div>

            <div className="w-full max-w-sm mt-4 bg-tactical-900 rounded-lg p-4 border border-tactical-700">
              <h3 className="text-gray-400 text-xs font-rajdhani uppercase tracking-wider mb-3">Combat Effectiveness</h3>
              <div className="flex justify-between items-end mb-2">
                <span className="font-rajdhani font-bold text-white uppercase">{profile?.rank || 'Bronze'} Tier</span>
                <span className="text-neon-blue font-bold text-sm">{profile?.lp || 0} / 100 EP</span>
              </div>
              <div className="h-2 w-full bg-tactical-800 rounded-full overflow-hidden border border-tactical-600">
                <div 
                  className="h-full bg-neon-blue relative"
                  style={{ width: `${profile?.lp || 0}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-l from-white/50 to-transparent" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8 shrink-0 bg-tactical-900/50 rounded-xl border border-tactical-700 p-4 md:p-6 relative group ml-auto">
            <div className="absolute inset-0 bg-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            


            <div className="w-40 h-40 md:w-56 md:h-56 flex items-center justify-center relative z-10">
              <StatHexagon stats={profile?.stats} size={224} hidePanel={true} />
            </div>
          </div>

        </div>
      </div>

      {showAvatarModal && <AvatarCustomizer onClose={() => setShowAvatarModal(false)} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Directives & Biometrics */}
        <div className="space-y-6">
          <div className="esports-panel p-6">
            <div className="flex justify-between items-center mb-6 border-b border-tactical-700 pb-4">
              <h2 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Target className="w-5 h-5 text-neon-red" /> Current Directives
              </h2>
              <button 
                onClick={() => setShowGoalModal(true)}
                className="text-xs font-rajdhani font-bold uppercase tracking-wider text-neon-red hover:text-white transition-colors bg-neon-red/10 hover:bg-neon-red/30 px-3 py-1.5 rounded"
              >
                Change Goal
              </button>
            </div>

            <div className="bg-tactical-900 border-l-2 border-neon-red p-4 rounded-r-lg mb-6 flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider font-rajdhani mb-1">Active Mission</p>
                <p className="text-white font-bold text-lg">{profile?.currentMode === 'Cut' ? 'Operation: Shred' : profile?.currentMode === 'Bulk' ? 'Operation: Mass' : 'Operation: Maintain'}</p>
              </div>
              <div className="bg-tactical-800 px-4 py-2 rounded-lg text-neon-red font-bold uppercase tracking-wider">
                {profile?.currentMode || 'Maintenance'}
              </div>
            </div>

            <h3 className="text-sm font-rajdhani font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-tactical-700 pb-2">Biometric Loadout</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-tactical-800 p-3 rounded-lg border border-tactical-700">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Current Weight</p>
                <p className="text-white font-bold text-lg">{biometrics?.weightLbs || '--'} lbs</p>
              </div>
              <div className="bg-tactical-800 p-3 rounded-lg border border-tactical-700">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Height</p>
                <p className="text-white font-bold text-lg">{biometrics ? `${biometrics.heightFeet}'${biometrics.heightInches}"` : '--'}</p>
              </div>
              <div className="bg-tactical-800 p-3 rounded-lg border border-tactical-700">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Gender & Age</p>
                <p className="text-white font-bold text-lg">{biometrics?.gender?.charAt(0) || '-'} / {biometrics?.age || '--'}</p>
              </div>
              <div className="bg-tactical-800 p-3 rounded-lg border border-tactical-700">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Training Freq</p>
                <p className="text-white font-bold text-lg">{targetWorkoutsPerWeek || 0} Days/Wk</p>
              </div>
            </div>
            
            <h3 className="text-sm font-rajdhani font-bold text-gray-400 uppercase tracking-wider mt-6 mb-4 border-b border-tactical-700 pb-2">Macro Targets</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-neon-red/10 text-neon-red px-3 py-1.5 rounded border border-neon-red/30 text-sm font-bold">{nutrition?.calories?.target || 0} kcal</span>
              <span className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded border border-blue-500/30 text-sm font-bold">{nutrition?.protein?.target || 0}g Protein</span>
              <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1.5 rounded border border-yellow-500/30 text-sm font-bold">{nutrition?.carbs?.target || 0}g Carbs</span>
              <span className="bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded border border-purple-500/30 text-sm font-bold">{nutrition?.fat?.target || 0}g Fat</span>
            </div>
          </div>
        </div>

        {/* Right Column: Trophy Case & Settings */}
        <div className="space-y-6">
          <div className="esports-panel p-6">
            <div className="flex justify-between items-center mb-6 border-b border-tactical-700 pb-4">
              <h2 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Medal className="w-5 h-5 text-neon-gold" /> Trophy Case
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Badges - Decorative for now */}
              <div className="bg-tactical-900 border border-neon-gold/50 p-4 rounded-xl flex flex-col items-center justify-center text-center relative group overflow-hidden">
                <div className="absolute inset-0 bg-neon-gold/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-12 h-12 rounded-full bg-neon-gold/20 flex items-center justify-center mb-3 border border-neon-gold">
                  <Shield className="w-6 h-6 text-neon-gold" />
                </div>
                <h4 className="font-rajdhani font-bold text-white uppercase tracking-wider text-sm">Rookie Deployed</h4>
                <p className="text-xs text-gray-400 mt-1">Completed Onboarding</p>
              </div>

              <div className="bg-tactical-900 border border-tactical-700 p-4 rounded-xl flex flex-col items-center justify-center text-center relative group">
                <div className="w-12 h-12 rounded-full bg-tactical-800 flex items-center justify-center mb-3 opacity-50">
                  <Flame className="w-6 h-6 text-gray-500" />
                </div>
                <h4 className="font-rajdhani font-bold text-gray-500 uppercase tracking-wider text-sm">7-Day Streak</h4>
                <p className="text-xs text-gray-600 mt-1">Locked</p>
              </div>
              
              <div className="bg-tactical-900 border border-tactical-700 p-4 rounded-xl flex flex-col items-center justify-center text-center relative group">
                <div className="w-12 h-12 rounded-full bg-tactical-800 flex items-center justify-center mb-3 opacity-50">
                  <Activity className="w-6 h-6 text-gray-500" />
                </div>
                <h4 className="font-rajdhani font-bold text-gray-500 uppercase tracking-wider text-sm">Iron Clad</h4>
                <p className="text-xs text-gray-600 mt-1">Locked</p>
              </div>

              <div className="bg-tactical-900 border border-tactical-700 p-4 rounded-xl flex flex-col items-center justify-center text-center relative group">
                <div className="w-12 h-12 rounded-full bg-tactical-800 flex items-center justify-center mb-3 opacity-50">
                  <Target className="w-6 h-6 text-gray-500" />
                </div>
                <h4 className="font-rajdhani font-bold text-gray-500 uppercase tracking-wider text-sm">Marksman</h4>
                <p className="text-xs text-gray-600 mt-1">Locked</p>
              </div>
            </div>
          </div>

          <div className="esports-panel p-6">
            <div className="flex justify-between items-center mb-6 border-b border-tactical-700 pb-4">
              <h2 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Target className="w-5 h-5 text-neon-blue" /> Workout Schedule
              </h2>
            </div>
            
            <div className="space-y-3">
              {scheduledWorkoutDays.map((dayIdx) => (
                <div key={dayIdx} className="bg-tactical-900 border border-tactical-700 p-3 rounded-lg flex items-center gap-4">
                  <span className="text-neon-blue font-rajdhani uppercase font-bold tracking-wider w-12 shrink-0 text-sm">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIdx]}
                  </span>
                  <input 
                    type="text"
                    placeholder="e.g. Heavy Chest"
                    value={localSplit[dayIdx] || ''}
                    onChange={(e) => setLocalSplit(prev => ({ ...prev, [dayIdx]: e.target.value }))}
                    onBlur={() => {
                      if (localSplit[dayIdx] !== workoutSplit[dayIdx]) {
                        completeOnboarding(profile?.currentMode || 'Maintenance', targetWorkoutsPerWeek, scheduledWorkoutDays, localSplit, nutrition, biometrics!);
                      }
                    }}
                    className="flex-1 bg-tactical-800 border-none rounded p-2 text-white font-bold outline-none focus:ring-1 focus:ring-neon-blue transition-all placeholder:text-tactical-600 placeholder:font-normal text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="esports-panel p-6">
            <div className="flex justify-between items-center mb-6 border-b border-tactical-700 pb-4">
              <h2 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400" /> System Settings
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-tactical-900 rounded-lg border border-tactical-700">
                <span className="text-gray-300 font-inter text-sm">Apple Health Sync</span>
                <button 
                  onClick={useUser().toggleHealthSync}
                  className={clsx(
                    "w-12 h-6 rounded-full relative transition-colors duration-300",
                    useUser().healthSyncEnabled ? "bg-neon-blue/30 border border-neon-blue" : "bg-tactical-700"
                  )}
                >
                  <div className={clsx(
                    "w-4 h-4 rounded-full absolute top-0.5 transition-all duration-300",
                    useUser().healthSyncEnabled ? "bg-neon-blue right-0.5 shadow-[0_0_5px_#00f0ff]" : "bg-gray-500 left-0.5"
                  )}></div>
                </button>
              </div>
              <div className="flex justify-between items-center p-3 bg-tactical-900 rounded-lg border border-tactical-700">
                <span className="text-gray-300 font-inter text-sm">Push Notifications</span>
                <div className="w-12 h-6 bg-neon-blue/30 rounded-full relative border border-neon-blue cursor-not-allowed">
                  <div className="w-4 h-4 bg-neon-blue rounded-full absolute right-0.5 top-0.5 shadow-[0_0_5px_#00f0ff]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Goal Update Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-tactical-800 border border-tactical-600 p-6 rounded-xl w-full max-w-md relative fade-in">
            <button 
              onClick={() => setShowGoalModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider mb-2">Update Directives</h3>
            <p className="text-sm text-gray-400 mb-6">Changing your primary goal will recalibrate your daily macro targets based on your saved biometrics.</p>
            
            <div className="space-y-3 mb-6">
              {(['Cut', 'Bulk', 'Maintenance'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGoal(g)}
                  className={clsx(
                    "w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between",
                    selectedGoal === g 
                      ? "border-neon-red bg-neon-red/10" 
                      : "border-tactical-700 hover:border-tactical-600 bg-tactical-900"
                  )}
                >
                  <span className={clsx("font-rajdhani font-bold uppercase tracking-wider", selectedGoal === g ? "text-neon-red" : "text-gray-300")}>
                    {g}
                  </span>
                  {selectedGoal === g && <Target className="w-5 h-5 text-neon-red" />}
                </button>
              ))}
            </div>

            <button
              onClick={handleUpdateGoal}
              className="w-full py-3 rounded-lg bg-neon-red text-tactical-900 font-rajdhani font-bold text-lg hover:bg-[#ff1a4d] transition-colors shadow-[0_0_15px_rgba(255,0,60,0.4)]"
            >
              Recalibrate Target
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
