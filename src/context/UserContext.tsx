import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, DailyNutrition, Biometrics, WeightEntry, WorkoutPreset, AvatarConfig, WorkoutLog, ActiveExercise, LoggedSet, FoodItem } from '../types';
import { seedProfile, seedNutrition } from '../utils/seedData';

interface UserContextType {
  user: { username: string } | null;
  login: (username: string) => void;
  logout: () => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: (goal: string, workoutsPerWeek: number, scheduledDays: number[], split: Record<number, string>, macros: DailyNutrition, bio: Biometrics) => void;
  profile: UserProfile;
  nutrition: DailyNutrition;
  targetWorkoutsPerWeek: number;
  scheduledWorkoutDays: number[];
  workoutSplit: Record<number, string>;
  biometrics: Biometrics | null;
  weightHistory: WeightEntry[];
  logWeight: (weightLbs: number) => void;
  addNutritionMacros: (macros: { calories: number; protein: number; carbs: number; fat: number; }) => void;
  customPresets: WorkoutPreset[];
  saveCustomPreset: (preset: WorkoutPreset) => void;
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
  activeWorkout: { id: string, name: string } | null;
  activeExercises: ActiveExercise[];
  startWorkout: (preset: WorkoutPreset | null) => void;
  abortWorkout: () => void;
  setActiveExercises: React.Dispatch<React.SetStateAction<ActiveExercise[]>>;
  recentFoods: FoodItem[];
  favoriteFoods: FoodItem[];
  logFood: (food: FoodItem) => void;
  toggleFavoriteFood: (food: FoodItem) => void;
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
      recentFoods: [] as FoodItem[],
      favoriteFoods: [] as FoodItem[]
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
  const [dailySteps, setDailySteps] = useState(initialState.dailySteps || 4230); // Default to something
  const [activeWorkout, setActiveWorkout] = useState<{id: string, name: string} | null>(initialState.activeWorkout || null);
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>(initialState.activeExercises || []);
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>(initialState.recentFoods || []);
  const [favoriteFoods, setFavoriteFoods] = useState<FoodItem[]>(initialState.favoriteFoods || []);



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
      healthSyncEnabled,
      dailySteps,
      activeWorkout,
      activeExercises,
      recentFoods,
      favoriteFoods
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [user, hasCompletedOnboarding, targetWorkoutsPerWeek, scheduledWorkoutDays, workoutSplit, profile, nutrition, biometrics, weightHistory, customPresets, workoutHistory, manualQuestCompletions, healthSyncEnabled, dailySteps, activeWorkout, activeExercises, recentFoods, favoriteFoods]);

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

  const logWeight = (weightLbs: number) => {
    const today = new Date().toISOString().split('T')[0];
    setWeightHistory(prev => {
      const existing = prev.findIndex(entry => entry.date === today);
      if (existing >= 0) {
        const newHistory = [...prev];
        newHistory[existing].weightLbs = weightLbs;
        return newHistory;
      }
      return [...prev, { date: today, weightLbs }];
    });
  };

  const addNutritionMacros = (macros: { calories: number; protein: number; carbs: number; fat: number; }) => {
    setNutrition(prev => ({
      calories: { ...prev.calories, current: prev.calories.current + macros.calories },
      protein: { ...prev.protein, current: prev.protein.current + macros.protein },
      carbs: { ...prev.carbs, current: prev.carbs.current + macros.carbs },
      fat: { ...prev.fat, current: prev.fat.current + macros.fat },
    }));
  };

  const logFood = (food: FoodItem) => {
    addNutritionMacros({
      calories: food.macrosPerUnit.calories * food.amount,
      protein: food.macrosPerUnit.protein * food.amount,
      carbs: food.macrosPerUnit.carbs * food.amount,
      fat: food.macrosPerUnit.fat * food.amount
    });
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

  const saveCustomPreset = (preset: WorkoutPreset) => {
    setCustomPresets(prev => [...prev, preset]);
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

  const logWorkout = (log: WorkoutLog) => {
    setWorkoutHistory(prev => [...prev, log]);
  };

  const startWorkout = (preset: WorkoutPreset | null = null) => {
    if (preset) {
      setActiveWorkout({ id: preset.id, name: preset.name });
      
      const mappedExercises: ActiveExercise[] = preset.exercises.map(ex => {
        const numSets = parseInt(ex.sets) || 3;
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
      });
      setActiveExercises(mappedExercises);
    } else {
      setActiveWorkout({ id: 'custom-active', name: 'Freestyle Workout' });
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

  return (
    <UserContext.Provider value={{
      user,
      login,
      logout,
      hasCompletedOnboarding,
      completeOnboarding,
      profile,
      nutrition,
      targetWorkoutsPerWeek,
      scheduledWorkoutDays,
      workoutSplit,
      biometrics,
      weightHistory,
      logWeight,
      addNutritionMacros,
      customPresets,
      saveCustomPreset,
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
      abortWorkout,
      setActiveExercises,
      recentFoods,
      favoriteFoods,
      logFood,
      toggleFavoriteFood
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
  return context;
};
