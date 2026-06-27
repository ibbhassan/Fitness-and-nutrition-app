import { getLocalDateString } from '../utils/dateUtils';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, DailyNutrition, Biometrics, WeightEntry, WorkoutPreset, AvatarConfig, WorkoutLog, ActiveExercise, LoggedSet, FoodItem, FoodLogEntry, Meal, ExerciseDefinition } from '../types';
import { seedProfile, seedNutrition } from '../utils/seedData';

interface UserContextType {
  user: { username: string } | null;
  login: (username: string) => void;
  logout: () => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: (goal: string, workoutsPerWeek: number, scheduledDays: number[], split: Record<number, string>, macros: DailyNutrition, bio: Biometrics) => void;
  markPatchNotesSeen: (version: string) => void;
  profile: UserProfile;
  nutrition: DailyNutrition;
  targetWorkoutsPerWeek: number;
  scheduledWorkoutDays: number[];
  workoutSplit: Record<number, string>;
  biometrics: Biometrics | null;
  weightHistory: WeightEntry[];
  logWeight: (weightLbs: number, dateStr?: string) => void;
  addNutritionMacros: (macros: { calories: number; protein: number; carbs: number; fat: number; }) => void;
  customPresets: WorkoutPreset[];
  saveCustomPreset: (preset: WorkoutPreset) => void;
  deleteCustomPreset: (id: string) => void;
  updateAvatar: (avatar: AvatarConfig) => void;
  workoutHistory: WorkoutLog[];
  logWorkout: (log: WorkoutLog) => void;
  manualQuestCompletions: Record<string, boolean>;
  toggleManualQuest: (questId: string, epAmount?: number) => void;
  addEp: (amount: number) => void;
  healthSyncEnabled: boolean;
  toggleHealthSync: () => void;
  dailySteps: number;
  setDailySteps: (steps: number) => void;
  addSteps: (amount: number) => void;
  activeWorkout: { id: string, name: string, startTime: number, paused?: boolean, accumulatedPauseMs?: number, lastPauseTime?: number | null } | null;
  activeExercises: ActiveExercise[];
  startWorkout: (preset: WorkoutPreset | null) => void;
  togglePauseWorkout: () => void;
  abortWorkout: () => void;
  setActiveExercises: React.Dispatch<React.SetStateAction<ActiveExercise[]>>;
  customExercises: ExerciseDefinition[];
  saveCustomExercise: (exercise: ExerciseDefinition) => void;
  recentFoods: FoodItem[];
  favoriteFoods: FoodItem[];
  foodLogs: FoodLogEntry[];
  savedMeals: Meal[];
  addFoodLog: (log: FoodLogEntry) => void;
  removeFoodLog: (id: string) => void;
  updateFoodLog: (id: string, updatedFood: FoodItem) => void;
  saveMeal: (meal: Meal) => void;
  logFood: (food: FoodItem) => void;
  toggleFavoriteFood: (food: FoodItem) => void;
  saveToFavorites: (food: FoodItem) => void;
  removeFavoriteFood: (foodName: string) => void;
  devAdvanceDay?: () => void;
  getMacrosForDate: (dateStr: string) => DailyNutrition;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'evoke_user_data_v2';

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state from local storage or fallback to defaults
  const loadState = () => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      user: null,
      hasCompletedOnboarding: false,
      targetWorkoutsPerWeek: 4,
      scheduledWorkoutDays: [1, 2, 4, 5], // default to Mon, Tue, Thu, Fri
      workoutSplit: { 1: 'Push', 2: 'Pull', 4: 'Legs', 5: 'Upper' } as Record<number, string>,
      profile: seedProfile,
      nutrition: seedNutrition,
      biometrics: null,
      weightHistory: [] as WeightEntry[],
      customPresets: [] as WorkoutPreset[],
      workoutHistory: [] as WorkoutLog[],
      manualQuestCompletions: {} as Record<string, boolean>,
      customExercises: [] as ExerciseDefinition[],
      recentFoods: [] as FoodItem[],
      favoriteFoods: [] as FoodItem[],
      foodLogs: [] as FoodLogEntry[],
      savedMeals: [] as Meal[],
      lastStepDate: getLocalDateString()
    };
  };

  const initialState = loadState();

  const [user, setUser] = useState<{ username: string } | null>(initialState.user);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(initialState.hasCompletedOnboarding);
  const [targetWorkoutsPerWeek, setTargetWorkoutsPerWeek] = useState(initialState.targetWorkoutsPerWeek);
  const [scheduledWorkoutDays, setScheduledWorkoutDays] = useState<number[]>(initialState.scheduledWorkoutDays || [1, 2, 4, 5]);
  const [workoutSplit, setWorkoutSplit] = useState<Record<number, string>>(initialState.workoutSplit || { 1: 'Push', 2: 'Pull', 4: 'Legs', 5: 'Upper' });
  const [profile, setProfile] = useState<UserProfile>(initialState.profile);
  const [nutrition, setNutrition] = useState<DailyNutrition>(initialState.nutrition);
  const [biometrics, setBiometrics] = useState<Biometrics | null>(initialState.biometrics);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>(initialState.weightHistory);
  const [customPresets, setCustomPresets] = useState<WorkoutPreset[]>(initialState.customPresets || []);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>(initialState.workoutHistory || []);
  const [manualQuestCompletions, setManualQuestCompletions] = useState<Record<string, boolean>>(initialState.manualQuestCompletions || {});
  const [healthSyncEnabled, setHealthSyncEnabled] = useState(initialState.healthSyncEnabled || false);
  const [dailySteps, setDailySteps] = useState(initialState.dailySteps === 4230 ? 0 : (initialState.dailySteps || 0));
  const [lastStepDate, setLastStepDate] = useState<string>(initialState.lastStepDate || getLocalDateString());
  const [currentDate, setCurrentDate] = useState<string>(getLocalDateString());
  const [activeWorkout, setActiveWorkout] = useState<{id: string, name: string, startTime: number, paused?: boolean, accumulatedPauseMs?: number, lastPauseTime?: number | null} | null>(initialState.activeWorkout || null);
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>(initialState.activeExercises || []);
  const [customExercises, setCustomExercises] = useState<ExerciseDefinition[]>(initialState.customExercises || []);
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>(initialState.recentFoods || []);
  const [favoriteFoods, setFavoriteFoods] = useState<FoodItem[]>(initialState.favoriteFoods || []);
  const [foodLogs, setFoodLogs] = useState<FoodLogEntry[]>(initialState.foodLogs || []);
  const [savedMeals, setSavedMeals] = useState<Meal[]>(initialState.savedMeals || []);

  // Set up an interval to check for date rollover (midnight)
  useEffect(() => {
    const interval = setInterval(() => {
      const today = getLocalDateString();
      if (today !== currentDate) {
        setCurrentDate(today);
      }
    }, 60000); // Check every minute
    
    // Also check on visibility change (e.g., coming back to app)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const today = getLocalDateString();
        if (today !== currentDate) {
          setCurrentDate(today);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentDate]);

  // Check for daily reset on mount and date change
  useEffect(() => {
    if (lastStepDate !== currentDate) {
      setDailySteps(0);
      setLastStepDate(currentDate);
    }
  }, [currentDate, lastStepDate]);

  // Sync to local storage whenever state changes
  useEffect(() => {
    const stateToSave = {
      user,
      hasCompletedOnboarding,
      targetWorkoutsPerWeek,
      scheduledWorkoutDays,
      workoutSplit,
      profile,
      nutrition,
      biometrics,
      weightHistory,
      customPresets,
      workoutHistory,
      manualQuestCompletions,
      customExercises,
      healthSyncEnabled,
      dailySteps,
      lastStepDate,
      activeWorkout,
      activeExercises,
      recentFoods,
      favoriteFoods,
      foodLogs,
      savedMeals
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [user, hasCompletedOnboarding, targetWorkoutsPerWeek, scheduledWorkoutDays, workoutSplit, profile, nutrition, biometrics, weightHistory, customPresets, workoutHistory, manualQuestCompletions, customExercises, healthSyncEnabled, dailySteps, lastStepDate, activeWorkout, activeExercises, recentFoods, favoriteFoods, foodLogs, savedMeals]);

  const login = (username: string) => {
    setUser({ username });
  };

  const logout = () => {
    setUser(null);
  };

  const completeOnboarding = (goal: string, workoutsPerWeek: number, scheduledDays: number[], split: Record<number, string>, macros: DailyNutrition, bio: Biometrics) => {
    setProfile((prev: UserProfile) => ({ ...prev, currentMode: goal as 'Cut' | 'Bulk' | 'Maintenance' }));
    setTargetWorkoutsPerWeek(workoutsPerWeek);
    setScheduledWorkoutDays(scheduledDays);
    setWorkoutSplit(split);
    setNutrition(macros);
    setBiometrics(bio);
    setHasCompletedOnboarding(true);
  };

  const logWeight = (weightLbs: number, dateStr?: string) => {
    const targetDate = dateStr || getLocalDateString();
    setWeightHistory(prev => {
      const existing = prev.findIndex(entry => entry.date === targetDate);
      if (existing !== -1) {
        const next = [...prev];
        next[existing] = { date: targetDate, weightLbs };
        return next;
      }
      return [...prev, { date: targetDate, weightLbs }].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
  };

  const addFoodLog = (log: FoodLogEntry) => {
    setFoodLogs(prev => [...prev, log]);
    // Also add to recent foods
    setRecentFoods(prev => {
      const filtered = prev.filter(f => f.name !== log.food.name);
      return [log.food, ...filtered].slice(0, 50);
    });
  };

  const updateFoodLog = (id: string, updatedFood: FoodItem) => {
    setFoodLogs(prev => prev.map(log => 
      log.id === id ? { ...log, food: updatedFood } : log
    ));
  };


  const removeFoodLog = (id: string) => {
    setFoodLogs(prev => prev.filter(log => log.id !== id));
  };

  const saveMeal = (meal: Meal) => {
    setSavedMeals(prev => [...prev, meal]);
  };

  // Dynamically calculate macros for a specific date
  const getMacrosForDate = (dateStr: string): DailyNutrition => {
    const logsForDate = foodLogs.filter(log => log.date === dateStr);
    
    let c = 0, p = 0, ca = 0, f = 0;
    logsForDate.forEach(log => {
      c += log.food.macrosPerUnit.calories * log.food.amount;
      p += log.food.macrosPerUnit.protein * log.food.amount;
      ca += log.food.macrosPerUnit.carbs * log.food.amount;
      f += log.food.macrosPerUnit.fat * log.food.amount;
    });

    return {
      calories: { current: Math.round(c), target: nutrition.calories.target },
      protein: { current: Math.round(p), target: nutrition.protein.target },
      carbs: { current: Math.round(ca), target: nutrition.carbs.target },
      fat: { current: Math.round(f), target: nutrition.fat.target },
    };
  };

  const computedNutrition = getMacrosForDate(currentDate);

  const logFood = (food: FoodItem) => {
    setRecentFoods(prev => {
      const filtered = prev.filter(f => f.id !== food.id && f.name !== food.name);
      return [{ ...food, timestamp: Date.now() }, ...filtered].slice(0, 30); // keep last 30
    });
  };

  const toggleFavoriteFood = (food: FoodItem) => {
    setFavoriteFoods(prev => {
      const isFav = prev.some(f => f.id === food.id || f.name === food.name);
      if (isFav) {
        return prev.filter(f => f.id !== food.id && f.name !== food.name);
      } else {
        return [{ ...food, isFavorite: true }, ...prev];
      }
    });
  };

  const saveToFavorites = (food: FoodItem) => {
    setFavoriteFoods(prev => {
      const foodName = (food?.name || '').toLowerCase();
      const exists = prev.some(f => (f?.name || '').toLowerCase() === foodName);
      if (!exists) {
        return [{ ...food, isFavorite: true }, ...prev];
      }
      return prev;
    });
  };

  const removeFavoriteFood = (foodName: string) => {
    setFavoriteFoods(prev => prev.filter(f => (f?.name || '').toLowerCase() !== foodName.toLowerCase()));
  };

  const saveCustomPreset = (preset: WorkoutPreset) => {
    setCustomPresets(prev => {
      const existingIndex = prev.findIndex(p => p.id === preset.id);
      if (existingIndex >= 0) {
        const newPresets = [...prev];
        newPresets[existingIndex] = preset;
        return newPresets;
      }
      return [...prev, preset];
    });
  };

  const deleteCustomPreset = (id: string) => {
    setCustomPresets(prev => prev.filter(p => p.id !== id));
  };

  const updateAvatar = (avatar: AvatarConfig) => {
    setProfile(prev => ({ ...prev, avatar }));
  };

  const addEp = (amount: number) => {
    setProfile(prev => {
      let newLp = prev.lp + amount;
      let newLevel = prev.level;
      let newRank = prev.rank;
      
      while (newLp >= 100) {
        newLp -= 100;
        newLevel += 1;
      }
      
      while (newLp < 0) {
        newLp += 100;
        newLevel -= 1;
      }
      
      if (newLevel < 1) {
        newLevel = 1;
        newLp = 0;
      }
      
      if (newLevel < 10) newRank = 'Bronze';
      else if (newLevel < 20) newRank = 'Silver';
      else if (newLevel < 30) newRank = 'Gold';
      else if (newLevel < 40) newRank = 'Platinum';
      else if (newLevel < 50) newRank = 'Diamond';
      else newRank = 'Masters';
      
      return { ...prev, lp: newLp, level: newLevel, rank: newRank };
    });
  };

  const toggleManualQuest = (questId: string, epAmount: number = 0) => {
    const isCurrentlyComplete = !!manualQuestCompletions[questId];
    
    if (!isCurrentlyComplete && epAmount > 0) {
      addEp(epAmount);
    } else if (isCurrentlyComplete && epAmount > 0) {
      addEp(-epAmount);
    }

    setManualQuestCompletions(prev => ({
      ...prev,
      [questId]: !isCurrentlyComplete
    }));
  };

  const markPatchNotesSeen = (version: string) => {
    setProfile(prev => ({ ...prev, lastSeenPatchVersion: version }));
  };

  const saveCustomExercise = (exercise: ExerciseDefinition) => {
    setCustomExercises(prev => [...prev, exercise]);
  };

  const logWorkout = (log: WorkoutLog) => {
    setWorkoutHistory(prev => [...prev, log]);
  };

  const startWorkout = (preset: WorkoutPreset | null = null) => {
    if (preset) {
      setActiveWorkout({ id: preset.id, name: preset.name, startTime: Date.now(), paused: false, accumulatedPauseMs: 0, lastPauseTime: null });
      
      const mappedExercises: ActiveExercise[] = preset.exercises.map(ex => {
        // Handle backwards compatibility for old PresetExercise (where sets was a string)
        if (typeof ex.sets === 'string') {
          const numSets = parseInt(ex.sets as string) || 3;
          const sets: LoggedSet[] = Array.from({ length: numSets }).map((_, i) => ({
            id: `${Date.now()}-${i}`,
            reps: 0,
            weight: 0,
            type: 'Normal',
            completed: false
          }));
          return {
            id: String(ex.id),
            name: ex.name,
            sets
          };
        }
        
        // New format: already an ActiveExercise shape
        return {
          id: String(ex.id),
          name: ex.name,
          // Deep clone the sets to reset completion status and ensure unique IDs
          sets: (ex.sets as LoggedSet[]).map((set, i) => ({
            ...set,
            id: `${Date.now()}-${ex.id}-${i}`,
            completed: false
          }))
        };
      });
      setActiveExercises(mappedExercises);
    } else {
      setActiveWorkout({ id: 'custom-active', name: 'Freestyle Workout', startTime: Date.now(), paused: false, accumulatedPauseMs: 0, lastPauseTime: null });
      setActiveExercises([{
        id: String(Date.now()),
        name: '',
        sets: [{ id: String(Date.now() + 1), reps: 0, weight: 0, type: 'Normal', completed: false }]
      }]);
    }
  };

  const abortWorkout = () => {
    setActiveWorkout(null);
    setActiveExercises([]);
  };

  const togglePauseWorkout = () => {
    if (!activeWorkout) return;
    
    if (activeWorkout.paused) {
      // Resuming
      const pauseDuration = activeWorkout.lastPauseTime ? Date.now() - activeWorkout.lastPauseTime : 0;
      setActiveWorkout({
        ...activeWorkout,
        paused: false,
        accumulatedPauseMs: (activeWorkout.accumulatedPauseMs || 0) + pauseDuration,
        lastPauseTime: null
      });
    } else {
      // Pausing
      setActiveWorkout({
        ...activeWorkout,
        paused: true,
        lastPauseTime: Date.now()
      });
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      login,
      logout,
      hasCompletedOnboarding,
      completeOnboarding,
      markPatchNotesSeen,
      profile,
      nutrition: computedNutrition,
      targetWorkoutsPerWeek,
      scheduledWorkoutDays,
      workoutSplit,
      biometrics,
      weightHistory,
      logWeight,
      addNutritionMacros: () => {},
      customPresets,
      saveCustomPreset,
      deleteCustomPreset,
      updateAvatar,
      workoutHistory,
      logWorkout,
      manualQuestCompletions,
      toggleManualQuest,
      addEp,
      healthSyncEnabled,
      toggleHealthSync: () => setHealthSyncEnabled((p: boolean) => !p),
      dailySteps,
      setDailySteps,
      addSteps: (amount: number) => setDailySteps((prev: number) => prev + amount),
      activeWorkout,
      activeExercises,
      startWorkout,
      togglePauseWorkout,
      abortWorkout,
      setActiveExercises,
      customExercises,
      saveCustomExercise,
      recentFoods,
      favoriteFoods,
      foodLogs,
      savedMeals,
      addFoodLog,
      updateFoodLog,
      removeFoodLog,
      saveMeal,
      logFood,
      toggleFavoriteFood,
      saveToFavorites,
      removeFavoriteFood,
      devAdvanceDay: () => setCurrentDate('2099-01-01'),
      getMacrosForDate
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context as UserContextType & { devAdvanceDay?: () => void };
};
