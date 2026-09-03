import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Target, Flame, ChevronRight, ChevronLeft, Activity, Zap, Droplet, Wheat, X } from 'lucide-react';
import { clsx } from 'clsx';
import type { DailyNutrition, Biometrics } from '../types';

export const Onboarding: React.FC = () => {
  const { completeOnboarding, profile, cancelRecalibration } = useUser();
  const [step, setStep] = useState(1);

  const [goal, setGoal] = useState<'Cut' | 'Bulk' | 'Maintenance' | null>(null);
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState<number>(3);
  const [scheduledDays, setScheduledDays] = useState<number[]>([]);
  const [workoutSplit] = useState<Record<number, string>>({});
  const [macroPreference, setMacroPreference] = useState<'HighCarb' | 'HighFat'>('HighCarb');
  
  const [bio, setBio] = useState<Biometrics>({
    gender: 'Male',
    age: 25,
    heightFeet: 5,
    heightInches: 10,
    weightLbs: 180,
  });

  const [macros, setMacros] = useState<DailyNutrition>({
    calories: { current: 0, target: 2000 },
    protein: { current: 0, target: 160 },
    carbs: { current: 0, target: 200 },
    fat: { current: 0, target: 60 },
  });

  const handleNext = () => setStep(prev => prev + 1);

  const calculateAndAdvanceToMacros = () => {
    const workoutsCount = scheduledDays.length > 0 ? scheduledDays.length : (workoutsPerWeek || 3);
    
    // 1. Convert to metric
    const heightCm = ((bio.heightFeet * 12) + bio.heightInches) * 2.54;
    const weightKg = bio.weightLbs * 0.453592;

    // 2. Base Mifflin-St Jeor BMR
    let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * bio.age);
    if (bio.gender === 'Male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // 3. Activity Multiplier based on workouts per week
    let multiplier = 1.2; // Sedentary
    if (workoutsCount >= 1 && workoutsCount <= 3) multiplier = 1.375; // Light activity
    if (workoutsCount === 4) multiplier = 1.465; // Light/Moderate
    if (workoutsCount === 5) multiplier = 1.55;  // Moderate activity
    if (workoutsCount >= 6) multiplier = 1.725; // Very active

    let tdee = bmr * multiplier;

    // 4. Goal Modifier
    if (goal === 'Cut') tdee -= 400;
    if (goal === 'Bulk') tdee += 350;

    // Minimum safe calorie floor (1200 kcal for female, 1500 kcal for male)
    const minCals = bio.gender === 'Female' ? 1200 : 1500;
    const targetCals = Math.max(minCals, Math.round(tdee));
    
    // 5. Intelligent Balanced Macros Split
    // Protein: ~0.85g-0.95g per lb of bodyweight (capped at 35% of total cals so it doesn't starve carbs)
    const rawProtein = Math.round(bio.weightLbs * 0.9);
    const maxProteinByCals = Math.round((targetCals * 0.35) / 4);
    const targetProtein = Math.max(50, Math.min(rawProtein, maxProteinByCals));

    // Fat: 0.3g - 0.45g per lb (minimum 30g female, 40g male)
    const fatMultiplier = macroPreference === 'HighCarb' ? 0.3 : 0.45;
    const minFat = bio.gender === 'Female' ? 30 : 40;
    const targetFat = Math.max(minFat, Math.round(bio.weightLbs * fatMultiplier));

    // Carbs: Remaining calories, with a minimum floor of 50g
    const proteinCals = targetProtein * 4;
    const fatCals = targetFat * 9;
    const remainingCals = targetCals - proteinCals - fatCals;
    const targetCarbs = Math.max(50, Math.round(remainingCals / 4));

    setMacros({
      calories: { current: 0, target: targetCals },
      protein: { current: 0, target: targetProtein },
      carbs: { current: 0, target: targetCarbs },
      fat: { current: 0, target: targetFat },
    });
    setStep(7);
  };

  const handleSkipAll = () => {
    const selectedGoal = goal || 'Cut';
    const daysCount = workoutsPerWeek || 3;
    const defaultDays = [1, 3, 5].slice(0, daysCount);
    if (defaultDays.length < daysCount) {
      const pool = [1, 3, 5, 2, 4, 6, 0];
      for (const d of pool) {
        if (defaultDays.length >= daysCount) break;
        if (!defaultDays.includes(d)) defaultDays.push(d);
      }
      defaultDays.sort((a, b) => a - b);
    }
    const defaultSplit: Record<number, string> = {};
    defaultDays.forEach(day => { defaultSplit[day] = 'Workout'; });

    const defaultBio: Biometrics = bio.weightLbs ? bio : {
      gender: 'Male', age: 25, heightFeet: 5, heightInches: 10, weightLbs: 180
    };

    const defaultMacros: DailyNutrition = macros.calories.target ? macros : {
      calories: { current: 0, target: 2200 },
      protein: { current: 0, target: 180 },
      carbs: { current: 0, target: 220 },
      fat: { current: 0, target: 65 }
    };

    completeOnboarding(selectedGoal, daysCount, defaultDays, defaultSplit, defaultMacros, defaultBio);
  };

  const handleAdvanceStep3 = () => {
    let finalDays = [...scheduledDays];
    const daysTarget = workoutsPerWeek || 3;
    if (finalDays.length < daysTarget) {
      const defaultDayPool = [1, 3, 5, 2, 4, 6, 0];
      for (const d of defaultDayPool) {
        if (finalDays.length >= daysTarget) break;
        if (!finalDays.includes(d)) finalDays.push(d);
      }
      finalDays.sort((a, b) => a - b);
      setScheduledDays(finalDays);
    }
    setStep(5);
  };

  const handleComplete = () => {
    // Fill in any missing split labels with default "Workout" if left empty
    const finalSplit = { ...workoutSplit };
    scheduledDays.forEach(day => {
      if (!finalSplit[day]) finalSplit[day] = 'Workout';
    });
    completeOnboarding(goal as 'Cut' | 'Bulk' | 'Maintenance', workoutsPerWeek, scheduledDays, finalSplit, macros, bio);
  };

  return (
    <div className="min-h-screen bg-tactical-950 flex flex-col items-center justify-center p-4 sm:p-6 text-white font-inter">
      <div className="max-w-xl sm:max-w-2xl w-full esports-panel p-6 sm:p-10 fade-in relative">
        {profile ? (
          <button 
            onClick={cancelRecalibration}
            className="absolute top-4 right-4 text-gray-400 hover:text-white bg-tactical-800 hover:bg-tactical-700 p-2 rounded-full transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={handleSkipAll}
            className="absolute top-4 right-4 text-xs font-rajdhani uppercase font-bold text-gray-400 hover:text-white bg-tactical-800 hover:bg-tactical-700 px-3 py-1.5 rounded transition-colors z-20"
          >
            Skip Setup
          </button>
        )}
        {step > 1 && (
          <button 
            onClick={() => setStep(prev => prev === 5 ? 3 : prev - 1)}
            className="absolute top-4 left-4 text-gray-400 hover:text-white bg-tactical-800 hover:bg-tactical-700 p-2 rounded-full transition-colors z-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex justify-center mb-8">
          <span className="text-3xl font-rajdhani font-bold tracking-widest text-white uppercase">
            Ev<span className="text-neon-blue">oke</span>
          </span>
        </div>

        {step === 1 && (
          <div className="space-y-6 fade-in">
            <h2 className="esports-heading text-2xl text-center mb-2">Choose Your Path</h2>
            <p className="text-gray-400 text-center text-sm mb-6">Select your primary fitness goal to calibrate your dashboard.</p>
            
            <button 
              onClick={() => setGoal('Cut')}
              className={clsx(
                "w-full p-4 rounded-lg border-2 transition-all duration-300 flex items-center justify-between",
                goal === 'Cut' ? "border-neon-blue bg-neon-blue/10 shadow-[0_0_15px_rgba(0,240,255,0.2)]" : "border-tactical-700 bg-tactical-900 hover:border-tactical-600"
              )}
            >
              <div className="flex items-center gap-4">
                <Target className={goal === 'Cut' ? "text-neon-blue" : "text-gray-500"} />
                <div className="text-left">
                  <h3 className="font-bold text-lg font-rajdhani uppercase tracking-wider">Cut</h3>
                  <p className="text-xs text-gray-400">Lose fat, maintain muscle. Consistency focus.</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => setGoal('Bulk')}
              className={clsx(
                "w-full p-4 rounded-lg border-2 transition-all duration-300 flex items-center justify-between",
                goal === 'Bulk' ? "border-neon-gold bg-neon-gold/10 shadow-[0_0_15px_rgba(255,215,0,0.2)]" : "border-tactical-700 bg-tactical-900 hover:border-tactical-600"
              )}
            >
              <div className="flex items-center gap-4">
                <Activity className={goal === 'Bulk' ? "text-neon-gold" : "text-gray-500"} />
                <div className="text-left">
                  <h3 className="font-bold text-lg font-rajdhani uppercase tracking-wider">Bulk</h3>
                  <p className="text-xs text-gray-400">Build mass, push PRs. Progression focus.</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => { if (!goal) setGoal('Cut'); handleNext(); }}
              className="w-full mt-6 bg-white text-tactical-900 py-3 rounded font-rajdhani font-bold text-lg hover:bg-gray-200 transition-colors flex justify-center items-center gap-2"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => { setGoal('Cut'); handleNext(); }}
              className="w-full text-center text-xs font-rajdhani uppercase tracking-wider text-gray-500 hover:text-gray-300 py-1 transition-colors"
            >
              Skip for now (Default to Cut)
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 fade-in">
            <h2 className="esports-heading text-2xl text-center mb-2">Training Frequency</h2>
            <p className="text-gray-400 text-center text-sm mb-6">How many days per week are you committed to training?</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[2, 3, 4, 5, 6].map((days) => (
                <button
                  key={days}
                  onClick={() => setWorkoutsPerWeek(days)}
                  className={clsx(
                    "p-4 sm:p-6 rounded-lg border-2 transition-all duration-300 flex flex-col items-center justify-center",
                    workoutsPerWeek === days 
                      ? "border-neon-blue bg-neon-blue/10 shadow-[0_0_15px_rgba(0,240,255,0.2)]" 
                      : "border-tactical-700 bg-tactical-900 hover:border-tactical-600"
                  )}
                >
                  <span className="text-3xl font-rajdhani font-bold text-white block mb-1">{days}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-rajdhani">Days / Wk</span>
                </button>
              ))}
            </div>

            <button 
              onClick={handleNext}
              className="w-full mt-6 bg-white text-tactical-900 py-3 rounded font-rajdhani font-bold text-lg hover:bg-gray-200 transition-colors flex justify-center items-center gap-2"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => { setWorkoutsPerWeek(3); handleNext(); }}
              className="w-full text-center text-xs font-rajdhani uppercase tracking-wider text-gray-500 hover:text-gray-300 py-1 transition-colors"
            >
              Skip for now (Default 3 Days)
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 fade-in">
            <h2 className="esports-heading text-2xl text-center mb-2">Schedule Your Workouts</h2>
            <p className="text-gray-400 text-center text-sm mb-6">Select the specific {workoutsPerWeek} days you plan to hit the gym.</p>
            
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <button
                  key={day}
                  onClick={() => {
                    setScheduledDays(prev => 
                      prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx].sort()
                    );
                  }}
                  className={clsx(
                    "p-3 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300",
                    scheduledDays.includes(idx) 
                      ? "border-neon-blue bg-neon-blue/10 shadow-[0_0_10px_rgba(0,240,255,0.2)] text-white" 
                      : "border-tactical-700 bg-tactical-900 text-gray-400 hover:border-tactical-600 hover:text-white"
                  )}
                >
                  <span className="text-xs uppercase font-bold tracking-wider">{day.charAt(0)}</span>
                </button>
              ))}
            </div>

            <p className="text-center mt-4 text-neon-blue font-bold font-rajdhani uppercase tracking-widest">
              {scheduledDays.length} / {workoutsPerWeek} Days Selected
            </p>

            <button 
              onClick={handleAdvanceStep3}
              className="w-full mt-4 bg-white text-tactical-900 py-3 rounded font-rajdhani font-bold text-lg hover:bg-gray-200 transition-colors flex justify-center items-center gap-2"
            >
              Next Step <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={handleAdvanceStep3}
              className="w-full text-center text-xs font-rajdhani uppercase tracking-wider text-gray-500 hover:text-gray-300 py-1 transition-colors"
            >
              Skip Scheduling (Auto-Assign Days)
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 fade-in">
            <h2 className="esports-heading text-2xl text-center mb-2">Biometrics</h2>
            <p className="text-gray-400 text-center text-sm mb-6">Enter your stats so we can tailor your starting baseline.</p>

            <div className="space-y-4">
              <div className="flex gap-4">
                <button 
                  onClick={() => setBio({...bio, gender: 'Male'})}
                  className={clsx(
                    "flex-1 p-3 rounded border-2 transition-all font-rajdhani uppercase font-bold",
                    bio.gender === 'Male' ? "border-neon-blue bg-neon-blue/20 text-white" : "border-tactical-600 text-gray-400"
                  )}
                >
                  Male
                </button>
                <button 
                  onClick={() => setBio({...bio, gender: 'Female'})}
                  className={clsx(
                    "flex-1 p-3 rounded border-2 transition-all font-rajdhani uppercase font-bold",
                    bio.gender === 'Female' ? "border-neon-purple bg-neon-purple/20 text-white" : "border-tactical-600 text-gray-400"
                  )}
                >
                  Female
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-rajdhani uppercase mb-1">Age (Years)</label>
                <input 
                  type="number"
                  value={bio.age || ''}
                  onChange={(e) => setBio({...bio, age: e.target.value === '' ? 0 : Number(e.target.value)})}
                  className="w-full bg-tactical-800 border border-tactical-600 rounded p-3 text-white font-bold focus:border-neon-blue outline-none transition-all"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 font-rajdhani uppercase mb-1">Height (Feet)</label>
                  <input 
                    type="number"
                    value={bio.heightFeet || ''}
                    onChange={(e) => setBio({...bio, heightFeet: e.target.value === '' ? 0 : Number(e.target.value)})}
                    className="w-full bg-tactical-800 border border-tactical-600 rounded p-3 text-white font-bold focus:border-neon-blue outline-none transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 font-rajdhani uppercase mb-1">Height (Inches)</label>
                  <input 
                    type="number"
                    value={bio.heightInches === 0 ? '' : bio.heightInches}
                    onChange={(e) => setBio({...bio, heightInches: e.target.value === '' ? 0 : Number(e.target.value)})}
                    className="w-full bg-tactical-800 border border-tactical-600 rounded p-3 text-white font-bold focus:border-neon-blue outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-rajdhani uppercase mb-1">Weight (Lbs)</label>
                <input 
                  type="number"
                  value={bio.weightLbs || ''}
                  onChange={(e) => setBio({...bio, weightLbs: e.target.value === '' ? 0 : Number(e.target.value)})}
                  className="w-full bg-tactical-800 border border-tactical-600 rounded p-3 text-white font-bold focus:border-neon-blue outline-none transition-all"
                />
              </div>
            </div>

            <button 
              onClick={handleNext}
              className="w-full mt-6 bg-white text-tactical-900 py-3 rounded font-rajdhani font-bold text-lg hover:bg-gray-200 transition-colors flex justify-center items-center gap-2"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNext}
              className="w-full text-center text-xs font-rajdhani uppercase tracking-wider text-gray-500 hover:text-gray-300 py-1 transition-colors"
            >
              Skip for now (Use Standard Baseline)
            </button>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 fade-in">
            <h2 className="esports-heading text-2xl text-center mb-2">Macro Preference</h2>
            <p className="text-gray-400 text-center text-sm mb-6">Protein defaults to 1g/lb. Choose how you want to balance your remaining energy.</p>
            
            <button 
              onClick={() => setMacroPreference('HighCarb')}
              className={clsx(
                "w-full p-4 rounded-lg border-2 transition-all duration-300 flex items-center justify-between",
                macroPreference === 'HighCarb' ? "border-neon-gold bg-neon-gold/10 shadow-[0_0_15px_rgba(255,215,0,0.2)]" : "border-tactical-700 bg-tactical-900 hover:border-tactical-600"
              )}
            >
              <div className="flex items-center gap-4">
                <Wheat className={macroPreference === 'HighCarb' ? "text-neon-gold" : "text-gray-500"} />
                <div className="text-left">
                  <h3 className="font-bold text-lg font-rajdhani uppercase tracking-wider">High Carb / Lower Fat</h3>
                  <p className="text-xs text-gray-400">Better for high-intensity gym performance.</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => setMacroPreference('HighFat')}
              className={clsx(
                "w-full p-4 rounded-lg border-2 transition-all duration-300 flex items-center justify-between",
                macroPreference === 'HighFat' ? "border-neon-purple bg-neon-purple/10 shadow-[0_0_15px_rgba(181,53,245,0.2)]" : "border-tactical-700 bg-tactical-900 hover:border-tactical-600"
              )}
            >
              <div className="flex items-center gap-4">
                <Droplet className={macroPreference === 'HighFat' ? "text-neon-purple" : "text-gray-500"} />
                <div className="text-left">
                  <h3 className="font-bold text-lg font-rajdhani uppercase tracking-wider">Higher Fat / Lower Carb</h3>
                  <p className="text-xs text-gray-400">Sustained energy and hormonal optimization.</p>
                </div>
              </div>
            </button>

            <button 
              onClick={calculateAndAdvanceToMacros}
              className="w-full mt-6 bg-white text-tactical-900 py-3 rounded font-rajdhani font-bold text-lg hover:bg-gray-200 transition-colors flex justify-center items-center gap-2"
            >
              Calibrate Fuel <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => { setMacroPreference('HighCarb'); calculateAndAdvanceToMacros(); }}
              className="w-full text-center text-xs font-rajdhani uppercase tracking-wider text-gray-500 hover:text-gray-300 py-1 transition-colors"
            >
              Skip for now (Default High Carb)
            </button>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-8 fade-in">
            <div>
              <h2 className="esports-heading text-3xl sm:text-4xl text-center mb-3">Your Fuel Targets</h2>
              <p className="text-gray-300 text-center text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
                We've generated optimal targets based on the Mifflin-St Jeor formula for your <span className="text-neon-blue font-bold">{goal}</span> goal. You can adjust these manually.
              </p>
            </div>
            
            <div className="bg-tactical-900 border border-tactical-700 p-4 sm:p-5 rounded-lg flex items-start gap-3">
              <Activity className="w-6 h-6 text-neon-blue shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                <span className="text-neon-blue font-bold font-rajdhani uppercase text-base sm:text-lg">Adaptive TDEE Enabled:</span> Log your real weight and calories for 2 weeks, and the app will automatically adapt these textbook targets to your actual metabolism!
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex justify-between items-center text-sm sm:text-base text-gray-300 font-rajdhani font-bold uppercase tracking-wider mb-2">
                  <span>Calories (kcal)</span>
                  <Flame className="w-5 h-5 text-neon-red" />
                </label>
                <input 
                  type="number"
                  value={macros.calories.target || ''}
                  onChange={(e) => setMacros({...macros, calories: { current: 0, target: e.target.value === '' ? 0 : Number(e.target.value) }})}
                  className="w-full bg-tactical-800 border border-tactical-600 rounded-lg p-4 text-white text-2xl sm:text-3xl font-bold font-mono focus:border-neon-blue focus:ring-2 focus:ring-neon-blue outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-300 font-rajdhani font-bold uppercase tracking-wider mb-2">Protein (g)</label>
                  <input 
                    type="number"
                    value={macros.protein.target || ''}
                    onChange={(e) => setMacros({...macros, protein: { current: 0, target: e.target.value === '' ? 0 : Number(e.target.value) }})}
                    className="w-full bg-tactical-800 border border-tactical-600 rounded-lg p-3 sm:p-4 text-white text-xl sm:text-2xl font-bold font-mono focus:border-neon-blue outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-gray-300 font-rajdhani font-bold uppercase tracking-wider mb-2">Carbs (g)</label>
                  <input 
                    type="number"
                    value={macros.carbs.target || ''}
                    onChange={(e) => setMacros({...macros, carbs: { current: 0, target: e.target.value === '' ? 0 : Number(e.target.value) }})}
                    className="w-full bg-tactical-800 border border-tactical-600 rounded-lg p-3 sm:p-4 text-white text-xl sm:text-2xl font-bold font-mono focus:border-neon-blue outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-gray-300 font-rajdhani font-bold uppercase tracking-wider mb-2">Fats (g)</label>
                  <input 
                    type="number"
                    value={macros.fat.target || ''}
                    onChange={(e) => setMacros({...macros, fat: { current: 0, target: e.target.value === '' ? 0 : Number(e.target.value) }})}
                    className="w-full bg-tactical-800 border border-tactical-600 rounded-lg p-3 sm:p-4 text-white text-xl sm:text-2xl font-bold font-mono focus:border-neon-blue outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleComplete}
              className="w-full mt-8 bg-neon-blue text-tactical-900 py-4 rounded-lg font-rajdhani font-bold text-xl sm:text-2xl hover:bg-[#00d0dd] transition-colors shadow-[0_0_20px_rgba(0,240,255,0.4)] flex justify-center items-center gap-3"
            >
              <Zap className="w-6 h-6" /> Complete Setup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
