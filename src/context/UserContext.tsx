import { getLocalDateString } from '../utils/dateUtils';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, WorkoutPreset, WorkoutLog, AvatarConfig, DailyNutrition, ExerciseDefinition, LoggedSet, ActiveExercise, Biometrics, WeightEntry, BodyFatEntry, FoodItem, FoodLogEntry, Meal } from '../types';
import { getRequiredEpForLevel, getRankInfo } from '../utils/rankUtils';
import { seedProfile, seedNutrition } from '../utils/seedData';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { publishHighlight, deleteHighlightsForWorkout } from '../services/socialService';
import { calculateStreak } from '../utils/streakUtils';
import { useRef } from 'react';

interface UserContextType {
  user: { username: string, uid?: string } | null;
  login: (username: string) => void;
  logout: () => void;
  updateUsername: (newUsername: string) => Promise<void>;
  hasCompletedOnboarding: boolean;
  completeOnboarding: (goal: string, workoutsPerWeek: number, scheduledDays: number[], split: Record<number, string>, macros: DailyNutrition, bio: Biometrics) => void;
  resetOnboarding: () => void;
  cancelRecalibration: () => void;
  markPatchNotesSeen: (version: string) => void;
  profile: UserProfile;
  nutrition: DailyNutrition;
  targetWorkoutsPerWeek: number;
  scheduledWorkoutDays: number[];
  workoutSplit: Record<number, string>;
  biometrics: Biometrics | null;
  weightHistory: WeightEntry[];
  logWeight: (weightLbs: number, dateStr?: string) => void;
  bodyFatHistory: BodyFatEntry[];
  logBodyFat: (bodyFatPercent: number, dateStr?: string) => void;
  updateNutrition: (macros: DailyNutrition) => void;
  addNutritionMacros: (macros: { calories: number; protein: number; carbs: number; fat: number; }) => void;
  customPresets: WorkoutPreset[];
  saveCustomPreset: (preset: WorkoutPreset) => void;
  deleteCustomPreset: (id: string) => void;
  updateAvatar: (avatar: AvatarConfig) => void;
  workoutHistory: WorkoutLog[];
  logWorkout: (log: WorkoutLog) => void;
  deleteWorkout: (id: string) => void;
  updateWorkout: (log: WorkoutLog) => void;
  editingWorkout: WorkoutLog | null;
  setEditingWorkout: (log: WorkoutLog | null) => void;
  manualQuestCompletions: Record<string, boolean>;
  toggleManualQuest: (questId: string, epAmount?: number) => void;
  addEp: (amount: number) => void;
  healthSyncEnabled: boolean;
  toggleHealthSync: () => void;
  dailySteps: number;
  setDailySteps: (steps: number) => void;
  addSteps: (amount: number) => void;
  dailyStepsTarget: number;
  dailyWaterTarget: string;
  updateChallengeTargets: (stepsTarget: number, waterTarget: string) => void;
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
      bodyFatHistory: [] as BodyFatEntry[],
      customPresets: [] as WorkoutPreset[],
      workoutHistory: [] as WorkoutLog[],
      manualQuestCompletions: {} as Record<string, boolean>,
      customExercises: [] as ExerciseDefinition[],
      recentFoods: [] as FoodItem[],
      favoriteFoods: [] as FoodItem[],
      foodLogs: [] as FoodLogEntry[],
      savedMeals: [] as Meal[],
      lastStepDate: getLocalDateString(),
      dailyStepsTarget: 10000,
      dailyWaterTarget: '1 Gallon'
    };
  };

  const initialState = loadState();

  const [user, setUser] = useState<{ username: string, uid?: string } | null>(initialState.user);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(initialState.hasCompletedOnboarding);
  const [targetWorkoutsPerWeek, setTargetWorkoutsPerWeek] = useState(initialState.targetWorkoutsPerWeek);
  const [scheduledWorkoutDays, setScheduledWorkoutDays] = useState<number[]>(initialState.scheduledWorkoutDays || [1, 2, 4, 5]);
  const [workoutSplit, setWorkoutSplit] = useState<Record<number, string>>(initialState.workoutSplit || { 1: 'Push', 2: 'Pull', 4: 'Legs', 5: 'Upper' });
  const [profile, setProfile] = useState<UserProfile>(initialState.profile);
  const [nutrition, setNutrition] = useState<DailyNutrition>(initialState.nutrition);
  const [biometrics, setBiometrics] = useState<Biometrics | null>(initialState.biometrics);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>(initialState.weightHistory);
  const [bodyFatHistory, setBodyFatHistory] = useState<BodyFatEntry[]>(initialState.bodyFatHistory || []);
  const [customPresets, setCustomPresets] = useState<WorkoutPreset[]>(initialState.customPresets || []);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>(initialState.workoutHistory || []);
  const [manualQuestCompletions, setManualQuestCompletions] = useState<Record<string, boolean>>(initialState.manualQuestCompletions || {});
  const [healthSyncEnabled, setHealthSyncEnabled] = useState(initialState.healthSyncEnabled || false);
  const [dailySteps, setDailySteps] = useState(initialState.dailySteps === 4230 ? 0 : (initialState.dailySteps || 0));
  const [dailyStepsTarget, setDailyStepsTarget] = useState<number>(initialState.dailyStepsTarget || 10000);
  const [dailyWaterTarget, setDailyWaterTarget] = useState<string>(initialState.dailyWaterTarget || '1 Gallon');
  const [lastStepDate, setLastStepDate] = useState<string>(initialState.lastStepDate || getLocalDateString());
  const [currentDate, setCurrentDate] = useState<string>(getLocalDateString());
  const [activeWorkout, setActiveWorkout] = useState<{id: string, name: string, startTime: number, paused?: boolean, accumulatedPauseMs?: number, lastPauseTime?: number | null} | null>(initialState.activeWorkout || null);
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>(initialState.activeExercises || []);
  const [customExercises, setCustomExercises] = useState<ExerciseDefinition[]>(initialState.customExercises || []);
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>(initialState.recentFoods || []);
  const [favoriteFoods, setFavoriteFoods] = useState<FoodItem[]>(initialState.favoriteFoods || []);
  const [foodLogs, setFoodLogs] = useState<FoodLogEntry[]>(initialState.foodLogs || []);
  const [savedMeals, setSavedMeals] = useState<Meal[]>(initialState.savedMeals || []);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutLog | null>(null);

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
      bodyFatHistory,
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
      savedMeals,
      dailyStepsTarget,
      dailyWaterTarget
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));

    if (user?.uid) {
      const timeoutId = setTimeout(() => {
        setDoc(doc(db, 'users', user.uid!), stateToSave, { merge: true }).catch(err => {
          console.error("Failed to sync to Firestore:", err);
        });
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [user, hasCompletedOnboarding, targetWorkoutsPerWeek, scheduledWorkoutDays, workoutSplit, profile, nutrition, biometrics, weightHistory, bodyFatHistory, customPresets, workoutHistory, manualQuestCompletions, customExercises, healthSyncEnabled, dailySteps, dailyStepsTarget, dailyWaterTarget, lastStepDate, activeWorkout, activeExercises, recentFoods, favoriteFoods, foodLogs, savedMeals]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({ username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User', uid: firebaseUser.uid });
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.hasCompletedOnboarding !== undefined) setHasCompletedOnboarding(data.hasCompletedOnboarding);
            if (data.targetWorkoutsPerWeek !== undefined) setTargetWorkoutsPerWeek(data.targetWorkoutsPerWeek);
            if (data.scheduledWorkoutDays !== undefined) setScheduledWorkoutDays(data.scheduledWorkoutDays);
            if (data.workoutSplit !== undefined) setWorkoutSplit(data.workoutSplit);
            if (data.profile !== undefined) setProfile(data.profile);
            if (data.nutrition !== undefined) setNutrition(data.nutrition);
            if (data.biometrics !== undefined) setBiometrics(data.biometrics);
            if (data.weightHistory !== undefined) setWeightHistory(data.weightHistory);
            if (data.bodyFatHistory !== undefined) setBodyFatHistory(data.bodyFatHistory);
            if (data.customPresets !== undefined) setCustomPresets(data.customPresets);
            if (data.workoutHistory !== undefined) setWorkoutHistory(data.workoutHistory);
            if (data.manualQuestCompletions !== undefined) setManualQuestCompletions(data.manualQuestCompletions);
            if (data.customExercises !== undefined) setCustomExercises(data.customExercises);
            if (data.healthSyncEnabled !== undefined) setHealthSyncEnabled(data.healthSyncEnabled);
            if (data.dailySteps !== undefined) setDailySteps(data.dailySteps);
            if (data.dailyStepsTarget !== undefined) setDailyStepsTarget(data.dailyStepsTarget);
            if (data.dailyWaterTarget !== undefined) setDailyWaterTarget(data.dailyWaterTarget);
            if (data.lastStepDate !== undefined) setLastStepDate(data.lastStepDate);
            if (data.activeWorkout !== undefined) setActiveWorkout(data.activeWorkout);
            if (data.activeExercises !== undefined) setActiveExercises(data.activeExercises);
            if (data.recentFoods !== undefined) setRecentFoods(data.recentFoods);
            if (data.favoriteFoods !== undefined) setFavoriteFoods(data.favoriteFoods);
            if (data.foodLogs !== undefined) setFoodLogs(data.foodLogs);
            if (data.savedMeals !== undefined) setSavedMeals(data.savedMeals);
          }
        } catch (err) {
          console.error("Error fetching user data from Firestore:", err);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = (username: string) => {
    // Left for local dev or backward compatibility before they hook up real Auth UI
    setUser({ username });
  };

  const logout = () => {
    signOut(auth).then(() => setUser(null));
  };

  // Add a ref to track previous level for highlights
  const prevLevelRef = useRef(profile.level);

  // Monitor for Level Ups to broadcast Rank Up highlights
  useEffect(() => {
    if (profile.level > prevLevelRef.current) {
      if (user?.uid && user.username) {
        publishHighlight({
          userId: user.uid,
          username: user.username,
          avatar: profile.avatar || { type: 'avatar', style: 'default' } as any,
          type: 'RANK_UP',
          data: {
            level: profile.level,
            oldLevel: prevLevelRef.current
          },
          timestamp: Date.now()
        }).catch(err => console.error("Failed to publish rank up highlight:", err));
      }
    }
    prevLevelRef.current = profile.level;
  }, [profile.level, user, profile.avatar]);

  const updateUsername = async (newUsername: string) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: newUsername });
      setUser(prev => prev ? { ...prev, username: newUsername } : null);
    }
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

  const resetOnboarding = () => {
    setHasCompletedOnboarding(false);
  };

  const cancelRecalibration = () => {
    setHasCompletedOnboarding(true);
  };

  const updateNutrition = (macros: DailyNutrition) => {
    setNutrition(macros);
  };

  const logWeight = (weightLbs: number, dateStr?: string) => {
    const targetDate = dateStr || getLocalDateString();
    setWeightHistory(prev => {
      let next = [...prev];
      const existing = next.findIndex(entry => entry.date === targetDate);
      if (existing !== -1) {
        next[existing] = { date: targetDate, weightLbs };
      } else {
        next.push({ date: targetDate, weightLbs });
        next.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
      
      // Calculate 7-day average and update biometrics
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const recentLogs = next.filter(entry => new Date(entry.date).getTime() >= sevenDaysAgo.getTime());
      if (recentLogs.length > 0) {
        const sum = recentLogs.reduce((acc, curr) => acc + curr.weightLbs, 0);
        const avg = Math.round((sum / recentLogs.length) * 10) / 10;
        setBiometrics(b => b ? { ...b, weightLbs: avg } : null);
      } else {
        setBiometrics(b => b ? { ...b, weightLbs } : null);
      }
      
      return next;
    });
  };

  const logBodyFat = (bodyFatPercent: number, dateStr?: string) => {
    const targetDate = dateStr || getLocalDateString();
    setBodyFatHistory(prev => {
      let next = [...prev];
      const existing = next.findIndex(entry => entry.date === targetDate);
      if (existing !== -1) {
        next[existing] = { date: targetDate, bodyFatPercent };
      } else {
        next.push({ date: targetDate, bodyFatPercent });
        next.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
      setBiometrics(b => b ? { ...b, bodyFat: bodyFatPercent } : null);
      return next;
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
      
      // Level up
      while (newLp >= getRequiredEpForLevel(newLevel)) {
        newLp -= getRequiredEpForLevel(newLevel);
        newLevel += 1;
      }
      
      // Level down (only if negative, rarely happens but safety)
      while (newLp < 0 && newLevel > 1) {
        newLevel -= 1;
        newLp += getRequiredEpForLevel(newLevel);
      }
      
      if (newLevel < 1) {
        newLevel = 1;
        newLp = 0;
      }
      
      const { tier } = getRankInfo(newLevel);
      const currentWeeklyEp = prev.weeklyEp || 0;
      const newWeeklyEp = Math.max(0, currentWeeklyEp + amount);
      
      return { ...prev, lp: newLp, level: newLevel, rank: tier, weeklyEp: newWeeklyEp };
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
    if (user?.uid && user.username) {
      const avatarConfig = profile.avatar || { type: 'avatar', style: 'default' } as any;

      // Only broadcast S+ Workouts
      if (log.grade === 'S+') {
        publishHighlight({
          userId: user.uid,
          username: user.username,
          avatar: avatarConfig,
          type: 'WORKOUT_COMPLETED',
          data: {
            workoutId: log.id,
            workoutName: log.name,
            grade: log.grade
          },
          timestamp: Date.now()
        }).catch(err => console.error("Failed to publish workout highlight:", err));
      }

      // Broadcast PRs
      if (log.isPr) {
        publishHighlight({
          userId: user.uid,
          username: user.username,
          avatar: avatarConfig,
          type: 'PR_BROKEN',
          data: {
            workoutId: log.id,
            workoutName: log.name
          },
          timestamp: Date.now() + 1 // Add 1ms to ensure uniqueness
        }).catch(err => console.error("Failed to publish PR highlight:", err));
      }

      // Check Streak
      const newHistory = [...workoutHistory, log];
      const newStreak = calculateStreak(newHistory, scheduledWorkoutDays);
      const oldStreak = calculateStreak(workoutHistory, scheduledWorkoutDays);

      // If they crossed a multiple of 10 milestone
      if (newStreak >= 10 && newStreak % 10 === 0 && newStreak > oldStreak) {
        publishHighlight({
          userId: user.uid,
          username: user.username,
          avatar: avatarConfig,
          type: 'STREAK',
          data: {
            streak: newStreak
          },
          timestamp: Date.now() + 2
        }).catch(err => console.error("Failed to publish streak highlight:", err));
      }
    }

    setWorkoutHistory(prev => [...prev, log]);
    if (log.epChange) {
      addEp(log.epChange);
    }
    
    // Analyze workout to update stats
    let strengthGain = 0;
    let enduranceGain = 0;
    let volumeGain = 0;
    let hypertrophyGain = 0;
    let powerGain = 0;

    log.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (!set.completed) return;
        
        // Volume: Total weight * reps (scaled down so it increases slowly)
        volumeGain += (set.weight * set.reps) / 2000;

        if (set.reps > 0 && set.reps <= 5 && set.weight > 0) {
          // Low reps, heavy weight = Strength & Power
          strengthGain += 0.5;
          powerGain += 0.3;
        } else if (set.reps >= 6 && set.reps <= 12) {
          // Mid reps = Hypertrophy
          hypertrophyGain += 0.5;
          strengthGain += 0.2;
        } else if (set.reps > 12) {
          // High reps = Endurance
          enduranceGain += 0.5;
          hypertrophyGain += 0.2;
        }
      });
    });

    setProfile(prev => {
      const currentStats = prev.stats || { strength: 0, endurance: 0, consistency: 0, power: 0, hypertrophy: 0, volume: 0 };
      return {
        ...prev,
        stats: {
          strength: Math.min(100, Math.round((currentStats.strength + strengthGain) * 10) / 10),
          endurance: Math.min(100, Math.round((currentStats.endurance + enduranceGain) * 10) / 10),
          consistency: Math.min(100, currentStats.consistency + 1), // Flat +1 per workout
          power: Math.min(100, Math.round((currentStats.power + powerGain) * 10) / 10),
          hypertrophy: Math.min(100, Math.round((currentStats.hypertrophy + hypertrophyGain) * 10) / 10),
          volume: Math.min(100, Math.round((currentStats.volume + volumeGain) * 10) / 10)
        }
      };
    });
  };

  const deleteWorkout = (id: string) => {
    // Find the workout before deleting
    const workoutToDelete = workoutHistory.find(w => w.id === id);
    if (workoutToDelete?.epChange) {
      addEp(-workoutToDelete.epChange);
    }
    
    // Remove highlights
    deleteHighlightsForWorkout(id).catch(err => console.error("Failed to delete highlights:", err));

    setWorkoutHistory(prev => prev.filter(w => w.id !== id));
  };

  const updateWorkout = (log: WorkoutLog) => {
    let epDiff = 0;
    setWorkoutHistory(prev => {
      const idx = prev.findIndex(w => w.id === log.id);
      if (idx === -1) return prev;
      const newHistory = [...prev];
      
      const oldLog = newHistory[idx];
      epDiff = (log.epChange || 0) - (oldLog.epChange || 0);

      newHistory[idx] = log;
      return newHistory;
    });
    
    if (epDiff !== 0) {
      addEp(epDiff);
    }
  };

  const startWorkout = (preset: WorkoutPreset | null = null) => {
    if (preset) {
      setActiveWorkout({ id: preset.id, name: preset.name, startTime: Date.now(), paused: false, accumulatedPauseMs: 0, lastPauseTime: null });
      
      const mappedExercises: ActiveExercise[] = preset.exercises.map(ex => {
        // Find previous logs for this exercise to prefill weight and reps
        let previousSets: LoggedSet[] | null = null;
        for (let i = workoutHistory.length - 1; i >= 0; i--) {
          const pastWorkout = workoutHistory[i];
          const pastEx = pastWorkout.exercises?.find(e => e.name === ex.name);
          if (pastEx && pastEx.sets && pastEx.sets.length > 0) {
            previousSets = pastEx.sets;
            break;
          }
        }

        let baseNumSets = typeof ex.sets === 'string' ? (parseInt(ex.sets as string) || 3) : ex.sets.length;
        const targetSetsCount = previousSets ? Math.max(baseNumSets, previousSets.length) : baseNumSets;

        const sets: LoggedSet[] = Array.from({ length: targetSetsCount }).map((_, i) => {
          let presetSet: Partial<LoggedSet> = {};
          if (typeof ex.sets !== 'string' && i < ex.sets.length) {
            presetSet = ex.sets[i];
          }

          const lastPrev = previousSets && previousSets[previousSets.length - 1];

          return {
            id: `${Date.now()}-${ex.id}-${i}`,
            reps: (previousSets && previousSets[i]) ? previousSets[i].reps : (lastPrev ? lastPrev.reps : presetSet.reps || 0),
            weight: (previousSets && previousSets[i]) ? previousSets[i].weight : (lastPrev ? lastPrev.weight : presetSet.weight || 0),
            type: (previousSets && previousSets[i]) ? previousSets[i].type : presetSet.type || 'Normal',
            completed: false
          };
        });

        return {
          id: String(ex.id),
          name: ex.name,
          sets
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
      updateUsername,
      hasCompletedOnboarding,
      completeOnboarding,
      resetOnboarding,
      cancelRecalibration,
      markPatchNotesSeen,
      profile,
      nutrition: computedNutrition,
      targetWorkoutsPerWeek,
      scheduledWorkoutDays,
      workoutSplit,
      biometrics,
      weightHistory,
      logWeight,
      bodyFatHistory,
      logBodyFat,
      updateNutrition,
      addNutritionMacros: () => {},
      customPresets,
      saveCustomPreset,
      deleteCustomPreset,
      updateAvatar,
      workoutHistory,
      logWorkout,
      deleteWorkout,
      updateWorkout,
      editingWorkout,
      setEditingWorkout,
      manualQuestCompletions,
      toggleManualQuest,
      addEp,
      healthSyncEnabled,
      toggleHealthSync: () => setHealthSyncEnabled((p: boolean) => !p),
      dailySteps,
      setDailySteps,
      addSteps: (amount: number) => setDailySteps((prev: number) => prev + amount),
      dailyStepsTarget,
      dailyWaterTarget,
      updateChallengeTargets: (stepsTarget: number, waterTarget: string) => {
        setDailyStepsTarget(stepsTarget);
        setDailyWaterTarget(waterTarget);
      },
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
