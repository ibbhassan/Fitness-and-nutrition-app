import { getLocalDateString, getWeekString, getPreviousWeekString, calculateWeeklyEpForWeek } from '../utils/dateUtils';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, WorkoutPreset, WorkoutLog, AvatarConfig, DailyNutrition, ExerciseDefinition, LoggedSet, ActiveExercise, Biometrics, WeightEntry, BodyFatEntry, FoodItem, FoodLogEntry, Meal, CustomMealCategory, LeaderboardRewardData } from '../types';
import { getRequiredEpForLevel, getRankInfo } from '../utils/rankUtils';
import { seedProfile, seedNutrition } from '../utils/seedData';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { publishHighlight, deleteHighlightsForWorkout, getFriendsProfiles } from '../services/socialService';
import { calculateStreak, getStreakMilestoneBonus } from '../utils/streakUtils';

export const DEFAULT_MEAL_CATEGORIES: CustomMealCategory[] = [
  { id: 'breakfast', name: 'Breakfast', iconName: 'Coffee', colorClass: 'text-amber-400' },
  { id: 'lunch', name: 'Lunch', iconName: 'Sun', colorClass: 'text-yellow-400' },
  { id: 'dinner', name: 'Dinner', iconName: 'Moon', colorClass: 'text-purple-400' },
  { id: 'snack', name: 'Snack', iconName: 'Apple', colorClass: 'text-emerald-400' }
];

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
  equipCosmetic: (type: 'border' | 'banner' | 'title', id: string | undefined) => void;
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
  dailyWaterIntake: number;
  addWaterIntake: (ozAmount: number) => void;
  dailyWorkoutDurationTarget: number;
  updateChallengeTargets: (stepsTarget: number, durationTarget: number | string) => void;
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
  updateMeal?: (meal: Meal) => void;
  deleteMeal: (id: string) => void;
  logFood: (food: FoodItem) => void;
  toggleFavoriteFood: (food: FoodItem) => void;
  saveToFavorites: (food: FoodItem) => void;
  removeFavoriteFood: (foodName: string) => void;
  customMealCategories: CustomMealCategory[];
  saveCustomMealCategories: (categories: CustomMealCategory[]) => void;
  pendingLeaderboardReward: LeaderboardRewardData | null;
  claimLeaderboardReward: () => void;
  isAppTourOpen: boolean;
  startAppTour: () => void;
  completeAppTour: () => void;
  currentDate: string;
  devAdvanceDay?: () => void;
  getMacrosForDate: (dateStr: string) => DailyNutrition;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'evoke_user_data_v2';

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state from local storage or fallback to defaults
  const loadState = () => {
    const today = getLocalDateString();
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const stepsByDate: Record<string, number> = parsed.stepsByDate || {};
        const waterByDate: Record<string, number> = parsed.waterByDate || {};
        const todaySteps = stepsByDate[today] ?? 0;
        const todayWater = waterByDate[today] ?? 0;
        return {
          ...parsed,
          stepsByDate,
          waterByDate,
          dailySteps: todaySteps,
          dailyWaterIntake: todayWater,
          lastStepDate: today,
          lastUpdated: parsed.lastUpdated || Date.now()
        };
      } catch (e) {
        console.error("Failed to parse localStorage:", e);
      }
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
      customMealCategories: DEFAULT_MEAL_CATEGORIES,
      stepsByDate: {} as Record<string, number>,
      waterByDate: {} as Record<string, number>,
      lastStepDate: today,
      dailySteps: 0,
      dailyStepsTarget: 10000,
      dailyWaterTarget: '1 Gallon',
      dailyWaterIntake: 0,
      dailyWorkoutDurationTarget: 30,
      lastUpdated: Date.now()
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
  const [stepsByDate, setStepsByDate] = useState<Record<string, number>>(initialState.stepsByDate || {});
  const [waterByDate, setWaterByDate] = useState<Record<string, number>>(initialState.waterByDate || {});
  const [dailySteps, setDailyStepsState] = useState(initialState.dailySteps || 0);
  const [dailyStepsTarget, setDailyStepsTarget] = useState<number>(initialState.dailyStepsTarget || 10000);
  const [dailyWaterTarget, setDailyWaterTarget] = useState<string>(initialState.dailyWaterTarget || '1 Gallon');
  const [dailyWaterIntake, setDailyWaterIntakeState] = useState<number>(initialState.dailyWaterIntake || 0);
  const [dailyWorkoutDurationTarget, setDailyWorkoutDurationTarget] = useState<number>(initialState.dailyWorkoutDurationTarget || 30);
  const [lastStepDate, setLastStepDate] = useState<string>(initialState.lastStepDate || getLocalDateString());
  const [currentDate, setCurrentDate] = useState<string>(getLocalDateString());
  const [activeWorkout, setActiveWorkout] = useState<{id: string, name: string, startTime: number, paused?: boolean, accumulatedPauseMs?: number, lastPauseTime?: number | null} | null>(initialState.activeWorkout || null);
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>(initialState.activeExercises || []);
  const [customExercises, setCustomExercises] = useState<ExerciseDefinition[]>(initialState.customExercises || []);
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>(initialState.recentFoods || []);
  const [favoriteFoods, setFavoriteFoods] = useState<FoodItem[]>(initialState.favoriteFoods || []);
  const [foodLogs, setFoodLogs] = useState<FoodLogEntry[]>(initialState.foodLogs || []);
  const [savedMeals, setSavedMeals] = useState<Meal[]>(initialState.savedMeals || []);
  const [customMealCategories, setCustomMealCategories] = useState<CustomMealCategory[]>(initialState.customMealCategories && initialState.customMealCategories.length > 0 ? initialState.customMealCategories : DEFAULT_MEAL_CATEGORIES);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutLog | null>(null);
  const [pendingLeaderboardReward, setPendingLeaderboardReward] = useState<LeaderboardRewardData | null>(null);
  const [isAppTourOpen, setIsAppTourOpen] = useState<boolean>(false);
  const [isFirestoreSynced, setIsFirestoreSynced] = useState<boolean>(false);

  // Reference holding the absolute latest state synchronously for safe persistence
  const stateRef = useRef({
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
    stepsByDate,
    waterByDate,
    dailySteps,
    lastStepDate,
    activeWorkout,
    activeExercises,
    recentFoods,
    favoriteFoods,
    foodLogs,
    savedMeals,
    customMealCategories,
    dailyStepsTarget,
    dailyWaterTarget,
    dailyWaterIntake,
    dailyWorkoutDurationTarget,
    lastUpdated: initialState.lastUpdated || Date.now()
  });

  stateRef.current = {
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
    stepsByDate,
    waterByDate,
    dailySteps,
    lastStepDate,
    activeWorkout,
    activeExercises,
    recentFoods,
    favoriteFoods,
    foodLogs,
    savedMeals,
    customMealCategories,
    dailyStepsTarget,
    dailyWaterTarget,
    dailyWaterIntake,
    dailyWorkoutDurationTarget,
    lastUpdated: stateRef.current.lastUpdated
  };

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistState = useCallback((overrides?: Record<string, any>, immediate: boolean = false) => {
    const now = Date.now();
    const currentState = {
      ...stateRef.current,
      ...overrides,
      lastUpdated: now
    };
    stateRef.current = currentState;

    // 1. Write synchronously to LocalStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentState));
    } catch (e) {
      console.error("Failed to write to localStorage:", e);
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    const uid = currentState.user?.uid;
    if (!uid) return;

    if (immediate) {
      setDoc(doc(db, 'users', uid), currentState, { merge: true }).catch(err => {
        console.error("Immediate Firestore sync error:", err);
      });
    } else {
      saveTimeoutRef.current = setTimeout(() => {
        setDoc(doc(db, 'users', uid), currentState, { merge: true }).catch(err => {
          console.error("Debounced Firestore sync error:", err);
        });
        saveTimeoutRef.current = null;
      }, 1000);
    }
  }, []);

  // Flush any pending save on backgrounding or before unload
  useEffect(() => {
    const flushSave = () => {
      if (stateRef.current?.user?.uid) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        setDoc(doc(db, 'users', stateRef.current.user.uid), stateRef.current, { merge: true }).catch(err => {
          console.error("Flush save error:", err);
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushSave();
      }
    };

    window.addEventListener('beforeunload', flushSave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', flushSave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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
    const todaySteps = stepsByDate[currentDate] ?? 0;
    const todayWater = waterByDate[currentDate] ?? 0;
    if (lastStepDate !== currentDate) {
      setDailyStepsState(todaySteps);
      setDailyWaterIntakeState(todayWater);
      setLastStepDate(currentDate);
    } else if (dailySteps !== todaySteps) {
      setDailyStepsState(todaySteps);
    }
  }, [currentDate, lastStepDate, stepsByDate, waterByDate, dailySteps]);

  const setDailySteps = useCallback((steps: number) => {
    const today = getLocalDateString();
    const nextStepsByDate = {
      ...(stateRef.current.stepsByDate || {}),
      [today]: steps
    };
    stateRef.current = {
      ...stateRef.current,
      dailySteps: steps,
      stepsByDate: nextStepsByDate,
      lastStepDate: today
    };
    setDailyStepsState(steps);
    setStepsByDate(nextStepsByDate);
    setLastStepDate(today);
    persistState({
      dailySteps: steps,
      stepsByDate: nextStepsByDate,
      lastStepDate: today
    }, true);
  }, [persistState]);

  const addSteps = useCallback((amount: number) => {
    const today = getLocalDateString();
    const current = stateRef.current.stepsByDate?.[today] ?? 0;
    const next = Math.max(0, current + amount);
    setDailySteps(next);
  }, [setDailySteps]);

  const addWaterIntake = useCallback((ozAmount: number) => {
    const today = getLocalDateString();
    const current = stateRef.current.waterByDate?.[today] ?? 0;
    const next = Math.max(0, current + ozAmount);
    const nextWaterByDate = {
      ...(stateRef.current.waterByDate || {}),
      [today]: next
    };
    stateRef.current = {
      ...stateRef.current,
      dailyWaterIntake: next,
      waterByDate: nextWaterByDate,
      lastStepDate: today
    };
    setDailyWaterIntakeState(next);
    setWaterByDate(nextWaterByDate);
    setLastStepDate(today);
    persistState({
      dailyWaterIntake: next,
      waterByDate: nextWaterByDate,
      lastStepDate: today
    }, true);
  }, [persistState]);

  // Sync to local storage & Firestore whenever state changes
  useEffect(() => {
    persistState();
  }, [
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
    stepsByDate,
    waterByDate,
    dailySteps,
    dailyStepsTarget,
    dailyWaterTarget,
    dailyWaterIntake,
    dailyWorkoutDurationTarget,
    lastStepDate,
    activeWorkout,
    activeExercises,
    recentFoods,
    favoriteFoods,
    foodLogs,
    savedMeals,
    customMealCategories,
    persistState
  ]);

  // Fallback timer so slow network doesn't block initial sync flags if local user is already loaded
  useEffect(() => {
    if (user && !isFirestoreSynced) {
      const t = setTimeout(() => setIsFirestoreSynced(true), 1500);
      return () => clearTimeout(t);
    }
  }, [user, isFirestoreSynced]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({ username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User', uid: firebaseUser.uid });
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const remoteLastUpdated = (data.lastUpdated as number) || 0;

            let localData: any = null;
            try {
              const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
              if (saved) localData = JSON.parse(saved);
            } catch (e) {
              console.error("Error reading local state for reconciliation:", e);
            }
            const localLastUpdated = (localData?.lastUpdated as number) || 0;

            // 1. RECONCILE WORKOUT HISTORY (Union by ID - NEVER delete workouts)
            const remoteWorkouts: WorkoutLog[] = Array.isArray(data.workoutHistory) ? data.workoutHistory : [];
            const localWorkouts: WorkoutLog[] = Array.isArray(localData?.workoutHistory) ? localData.workoutHistory : workoutHistory;
            const workoutMap = new Map<string, WorkoutLog>();
            remoteWorkouts.forEach(w => { if (w?.id) workoutMap.set(w.id, w); });
            localWorkouts.forEach(w => { if (w?.id) workoutMap.set(w.id, w); });

            const mergedWorkouts = Array.from(workoutMap.values()).map(w => {
              const completedSets = w.exercises?.reduce((acc, ex) => acc + (ex.sets?.filter(s => s.completed).length || 0), 0) || 0;
              const completedExCount = w.exercises?.filter(ex => ex.sets?.some(s => s.completed)).length || 0;
              const isHeavySession = completedSets >= 12 || completedExCount >= 4;
              if ((w.isPr || isHeavySession) && w.grade !== 'S+') {
                return { ...w, grade: 'S+' as const };
              }
              return w;
            }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            setWorkoutHistory(mergedWorkouts);

            // 2. RECONCILE ACTIVE WORKOUT (Prevent ghost active workouts)
            const remoteActive = data.activeWorkout;
            const localActive = localData?.activeWorkout !== undefined ? localData.activeWorkout : activeWorkout;

            let activeToSet: any = null;
            let activeExToSet: any = [];

            if (remoteActive && remoteActive.id) {
              const isAlreadyFinished = mergedWorkouts.some(w =>
                w.id === remoteActive.id ||
                (w.name === remoteActive.name && Math.abs(new Date(w.date).getTime() - (remoteActive.startTime || 0)) < 24 * 60 * 60 * 1000)
              );
              const isStale24Hours = (Date.now() - (remoteActive.startTime || 0)) > 24 * 60 * 60 * 1000;
              const hasWorkoutAfterStart = mergedWorkouts.some(w => new Date(w.date).getTime() > (remoteActive.startTime || 0));

              if (isAlreadyFinished || isStale24Hours || hasWorkoutAfterStart) {
                activeToSet = null;
              } else if (localActive === null && localLastUpdated >= remoteLastUpdated) {
                activeToSet = null;
              } else if (localActive && localLastUpdated >= remoteLastUpdated) {
                activeToSet = localActive;
                activeExToSet = localData?.activeExercises || activeExercises;
              } else {
                activeToSet = remoteActive;
                activeExToSet = data.activeExercises || [];
              }
            } else {
              if (localActive && localLastUpdated > remoteLastUpdated) {
                const isAlreadyFinished = mergedWorkouts.some(w => w.id === localActive.id);
                const isStale = (Date.now() - (localActive.startTime || 0)) > 24 * 60 * 60 * 1000;
                if (!isAlreadyFinished && !isStale) {
                  activeToSet = localActive;
                  activeExToSet = localData?.activeExercises || activeExercises;
                }
              }
            }

            setActiveWorkout(activeToSet);
            setActiveExercises(activeExToSet);

            // 3. RECONCILE FOOD LOGS (Union by ID - NEVER delete today's food logs)
            const remoteFoodLogs: FoodLogEntry[] = Array.isArray(data.foodLogs) ? data.foodLogs : [];
            const localFoodLogs: FoodLogEntry[] = Array.isArray(localData?.foodLogs) ? localData.foodLogs : foodLogs;
            const foodMap = new Map<string, FoodLogEntry>();
            remoteFoodLogs.forEach(f => { if (f?.id) foodMap.set(f.id, f); });
            localFoodLogs.forEach(f => { if (f?.id) foodMap.set(f.id, f); });
            const mergedFoodLogs = Array.from(foodMap.values());
            setFoodLogs(mergedFoodLogs);

            // 4. RECONCILE FAVORITES & SAVED MEALS
            if (Array.isArray(data.favoriteFoods)) {
              const favMap = new Map<string, FoodItem>();
              data.favoriteFoods.forEach((f: FoodItem) => { if (f?.name) favMap.set(f.name.toLowerCase(), f); });
              (localData?.favoriteFoods || favoriteFoods).forEach((f: FoodItem) => { if (f?.name) favMap.set(f.name.toLowerCase(), f); });
              setFavoriteFoods(Array.from(favMap.values()));
            }
            if (Array.isArray(data.savedMeals)) {
              const mealMap = new Map<string, Meal>();
              data.savedMeals.forEach((m: Meal) => { if (m?.id) mealMap.set(m.id, m); });
              (localData?.savedMeals || savedMeals).forEach((m: Meal) => { if (m?.id) mealMap.set(m.id, m); });
              setSavedMeals(Array.from(mealMap.values()));
            }

            // 5. RECONCILE WEIGHT & BODY FAT HISTORY
            if (Array.isArray(data.weightHistory)) {
              const weightMap = new Map<string, WeightEntry>();
              data.weightHistory.forEach((w: WeightEntry) => { if (w?.date) weightMap.set(w.date, w); });
              (localData?.weightHistory || weightHistory).forEach((w: WeightEntry) => { if (w?.date) weightMap.set(w.date, w); });
              setWeightHistory(Array.from(weightMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            }
            if (Array.isArray(data.bodyFatHistory)) {
              const bfMap = new Map<string, BodyFatEntry>();
              data.bodyFatHistory.forEach((b: BodyFatEntry) => { if (b?.date) bfMap.set(b.date, b); });
              (localData?.bodyFatHistory || bodyFatHistory).forEach((b: BodyFatEntry) => { if (b?.date) bfMap.set(b.date, b); });
              setBodyFatHistory(Array.from(bfMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            }

            // 6. RECONCILE CUSTOM PRESETS & EXERCISES
            if (Array.isArray(data.customPresets)) {
              const presetMap = new Map<string, WorkoutPreset>();
              data.customPresets.forEach((p: WorkoutPreset) => { if (p?.id) presetMap.set(p.id, p); });
              (localData?.customPresets || customPresets).forEach((p: WorkoutPreset) => { if (p?.id) presetMap.set(p.id, p); });
              setCustomPresets(Array.from(presetMap.values()));
            }
            if (Array.isArray(data.customExercises)) {
              const exMap = new Map<string, ExerciseDefinition>();
              data.customExercises.forEach((e: ExerciseDefinition) => { if (e?.id) exMap.set(e.id, e); });
              (localData?.customExercises || customExercises).forEach((e: ExerciseDefinition) => { if (e?.id) exMap.set(e.id, e); });
              setCustomExercises(Array.from(exMap.values()));
            }

            // 7. RECONCILE PROFILE & LEVEL/STATS
            let reconciledProfile: UserProfile | undefined;
            if (data.profile) {
              const localProf = localData?.profile || profile;
              const bestLevel = Math.max(localProf.level || 1, data.profile.level || 1);
              const bestLp = localProf.level > data.profile.level
                ? (localProf.lp || 0)
                : data.profile.level > localProf.level
                  ? (data.profile.lp || 0)
                  : Math.max(localProf.lp || 0, data.profile.lp || 0);

              const mergedStats = {
                strength: Math.max(localProf.stats?.strength || 0, data.profile.stats?.strength || 0),
                endurance: Math.max(localProf.stats?.endurance || 0, data.profile.stats?.endurance || 0),
                consistency: Math.max(localProf.stats?.consistency || 0, data.profile.stats?.consistency || 0),
                power: Math.max(localProf.stats?.power || 0, data.profile.stats?.power || 0),
                hypertrophy: Math.max(localProf.stats?.hypertrophy || 0, data.profile.stats?.hypertrophy || 0),
                volume: Math.max(localProf.stats?.volume || 0, data.profile.stats?.volume || 0),
              };
              const { tier } = getRankInfo(bestLevel);
              const mergedClaimedWeek = [localProf.lastClaimedLeaderboardWeek, data.profile.lastClaimedLeaderboardWeek]
                .filter(Boolean)
                .sort()
                .pop();
              const mergedClaimedWeeks = {
                ...(data.profile.claimedLeaderboardWeeks || {}),
                ...(localProf.claimedLeaderboardWeeks || {})
              };
              const mergedWeeklyEpByWeek = {
                ...(data.profile.weeklyEpByWeek || {}),
                ...(localProf.weeklyEpByWeek || {})
              };

              const nextProfile: UserProfile = {
                ...data.profile,
                ...localProf,
                level: bestLevel,
                lp: bestLp,
                rank: tier,
                stats: mergedStats,
                lastClaimedLeaderboardWeek: mergedClaimedWeek,
                claimedLeaderboardWeeks: mergedClaimedWeeks,
                weeklyEpByWeek: mergedWeeklyEpByWeek,
                unlockedCosmetics: Array.from(new Set([...(localProf.unlockedCosmetics || []), ...(data.profile.unlockedCosmetics || [])]))
              };
              reconciledProfile = nextProfile;
              setProfile(nextProfile);
            }

            const todayStr = getLocalDateString();
            const mergedStepsByDate: Record<string, number> = {
              ...(data.stepsByDate || {}),
              ...(localData?.stepsByDate || {})
            };
            const mergedWaterByDate: Record<string, number> = {
              ...(data.waterByDate || {}),
              ...(localData?.waterByDate || {})
            };
            const reconciledTodaySteps = mergedStepsByDate[todayStr] ?? 0;
            const reconciledTodayWater = mergedWaterByDate[todayStr] ?? 0;
            setStepsByDate(mergedStepsByDate);
            setWaterByDate(mergedWaterByDate);
            setDailyStepsState(reconciledTodaySteps);
            setDailyWaterIntakeState(reconciledTodayWater);
            setLastStepDate(todayStr);

            const preferRemote = remoteLastUpdated >= localLastUpdated;
            if (data.hasCompletedOnboarding !== undefined && (preferRemote || localData?.hasCompletedOnboarding === undefined)) setHasCompletedOnboarding(data.hasCompletedOnboarding);
            if (data.targetWorkoutsPerWeek !== undefined && (preferRemote || !localData?.targetWorkoutsPerWeek)) setTargetWorkoutsPerWeek(data.targetWorkoutsPerWeek);
            if (data.scheduledWorkoutDays !== undefined && (preferRemote || !localData?.scheduledWorkoutDays)) setScheduledWorkoutDays(data.scheduledWorkoutDays);
            if (data.workoutSplit !== undefined && (preferRemote || !localData?.workoutSplit)) setWorkoutSplit(data.workoutSplit);
            if (data.nutrition !== undefined && (preferRemote || !localData?.nutrition)) setNutrition(data.nutrition);
            if (data.biometrics !== undefined && (preferRemote || !localData?.biometrics)) setBiometrics(data.biometrics);
            if (data.manualQuestCompletions !== undefined) {
              const mergedQuests = { ...(data.manualQuestCompletions || {}), ...(localData?.manualQuestCompletions || {}) };
              if (reconciledTodaySteps < (data.dailyStepsTarget || localData?.dailyStepsTarget || 10000)) {
                delete mergedQuests[`daily-steps-${todayStr}`];
              }
              setManualQuestCompletions(mergedQuests);
            }
            if (data.healthSyncEnabled !== undefined) setHealthSyncEnabled(preferRemote ? data.healthSyncEnabled : (localData?.healthSyncEnabled ?? data.healthSyncEnabled));
            if (data.dailyStepsTarget !== undefined) setDailyStepsTarget(data.dailyStepsTarget);
            if (data.dailyWaterTarget !== undefined) setDailyWaterTarget(data.dailyWaterTarget);
            if (data.dailyWorkoutDurationTarget !== undefined) setDailyWorkoutDurationTarget(data.dailyWorkoutDurationTarget);
            if (data.recentFoods !== undefined && Array.isArray(data.recentFoods)) {
              const recMap = new Map();
              data.recentFoods.forEach((f: FoodItem) => recMap.set(f.name, f));
              (localData?.recentFoods || recentFoods).forEach((f: FoodItem) => recMap.set(f.name, f));
              setRecentFoods(Array.from(recMap.values()).slice(0, 50));
            }
            if (data.customMealCategories !== undefined && Array.isArray(data.customMealCategories)) setCustomMealCategories(data.customMealCategories);

            // Persist the reconciled state back to Firestore & LocalStorage immediately
            persistState({
              ...(reconciledProfile ? { profile: reconciledProfile } : {}),
              stepsByDate: mergedStepsByDate,
              waterByDate: mergedWaterByDate,
              dailySteps: reconciledTodaySteps,
              dailyWaterIntake: reconciledTodayWater,
              lastStepDate: todayStr,
              workoutHistory: mergedWorkouts,
              activeWorkout: activeToSet,
              activeExercises: activeExToSet,
              foodLogs: mergedFoodLogs
            }, true);
          }
        } catch (err) {
          console.error("Error fetching and reconciling user data from Firestore:", err);
        } finally {
          setIsFirestoreSynced(true);
        }
      } else {
        setUser(null);
        setIsFirestoreSynced(true);
      }
    });
    return () => unsubscribe();
  }, [persistState]);

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
    setProfile((prev: UserProfile) => {
      if (!prev.hasCompletedAppTour) {
        setIsAppTourOpen(true);
      }
      return { ...prev, currentMode: goal as 'Cut' | 'Bulk' | 'Maintenance' };
    });
    setTargetWorkoutsPerWeek(workoutsPerWeek);
    setScheduledWorkoutDays(scheduledDays);
    setWorkoutSplit(split);
    setNutrition(macros);
    setBiometrics(bio);
    setHasCompletedOnboarding(true);
  };

  const startAppTour = () => {
    setIsAppTourOpen(true);
  };

  const completeAppTour = () => {
    setIsAppTourOpen(false);
    setProfile(prev => {
      const updated = { ...prev, hasCompletedAppTour: true };
      stateRef.current = { ...stateRef.current, profile: updated };
      persistState({ profile: updated }, true);
      return updated;
    });
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
    const currentLogs = stateRef.current.foodLogs || [];
    const nextLogs = [...currentLogs, log];
    const currentRecent = stateRef.current.recentFoods || [];
    const filtered = currentRecent.filter((f: FoodItem) => f.name !== log.food.name);
    const nextRecent = [log.food, ...filtered].slice(0, 50);

    stateRef.current = {
      ...stateRef.current,
      foodLogs: nextLogs,
      recentFoods: nextRecent
    };

    setFoodLogs(prev => [...prev, log]);
    setRecentFoods(prev => {
      const f = prev.filter(item => item.name !== log.food.name);
      return [log.food, ...f].slice(0, 50);
    });
    persistState({ foodLogs: nextLogs, recentFoods: nextRecent }, true);
  };

  const updateFoodLog = (id: string, updatedFood: FoodItem) => {
    const currentLogs = stateRef.current.foodLogs || [];
    const nextLogs = currentLogs.map((log: FoodLogEntry) => 
      log.id === id ? { ...log, food: updatedFood } : log
    );
    stateRef.current = { ...stateRef.current, foodLogs: nextLogs };
    setFoodLogs(prev => prev.map(log => 
      log.id === id ? { ...log, food: updatedFood } : log
    ));
    persistState({ foodLogs: nextLogs }, true);
  };

  const removeFoodLog = (id: string) => {
    const currentLogs = stateRef.current.foodLogs || [];
    const nextLogs = currentLogs.filter((log: FoodLogEntry) => log.id !== id);
    stateRef.current = { ...stateRef.current, foodLogs: nextLogs };
    setFoodLogs(prev => prev.filter(log => log.id !== id));
    persistState({ foodLogs: nextLogs }, true);
  };

  const saveMeal = (meal: Meal) => {
    const currentMeals = stateRef.current.savedMeals || [];
    const exists = currentMeals.some((m: Meal) => m.id === meal.id);
    const nextMeals = exists
      ? currentMeals.map((m: Meal) => m.id === meal.id ? meal : m)
      : [...currentMeals, meal];
    stateRef.current = { ...stateRef.current, savedMeals: nextMeals };
    setSavedMeals(prev => {
      const ex = prev.some(m => m.id === meal.id);
      return ex ? prev.map(m => m.id === meal.id ? meal : m) : [...prev, meal];
    });
    persistState({ savedMeals: nextMeals }, true);
  };

  const deleteMeal = (id: string) => {
    const currentMeals = stateRef.current.savedMeals || [];
    const nextMeals = currentMeals.filter((m: Meal) => m.id !== id);
    stateRef.current = { ...stateRef.current, savedMeals: nextMeals };
    setSavedMeals(prev => prev.filter(m => m.id !== id));
    persistState({ savedMeals: nextMeals }, true);
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

  const equipCosmetic = (type: 'border' | 'banner' | 'title', id: string | undefined) => {
    setProfile(prev => ({
      ...prev,
      equippedCosmetics: {
        ...(prev?.equippedCosmetics || {}),
        [type]: id
      }
    }));
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
      const currentWeek = getWeekString();
      const baseWeeklyEp = prev.weeklyEpWeek === currentWeek ? (prev.weeklyEp || 0) : calculateWeeklyEpForWeek(stateRef.current.workoutHistory, stateRef.current.manualQuestCompletions, currentWeek, prev);
      const newWeeklyEp = Math.max(0, baseWeeklyEp + amount);
      const updatedByWeek = {
        ...(prev.weeklyEpByWeek || {}),
        [currentWeek]: newWeeklyEp
      };
      
      return {
        ...prev,
        lp: newLp,
        level: newLevel,
        rank: tier,
        weeklyEp: newWeeklyEp,
        weeklyEpWeek: currentWeek,
        weeklyEpByWeek: updatedByWeek
      };
    });
  };

  // Sync current week's weeklyEp on week rollover and evaluate completed week's leaderboard placement
  const checkingLeaderboardWeekRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isFirestoreSynced || !user) return;
    const currentWeek = getWeekString(currentDate);
    const prevWeek = getPreviousWeekString(currentDate);

    const computedCurrentWeekEp = calculateWeeklyEpForWeek(workoutHistory, manualQuestCompletions, currentWeek, profile);
    const computedPrevWeekEp = calculateWeeklyEpForWeek(workoutHistory, manualQuestCompletions, prevWeek, profile);

    if (profile.weeklyEpWeek !== currentWeek || profile.weeklyEp !== computedCurrentWeekEp) {
      setProfile(prev => {
        const legacyFallback = (!prev.weeklyEpWeek && computedPrevWeekEp === 0 && (prev.weeklyEp || 0) > 0)
          ? (prev.weeklyEp || 0)
          : computedPrevWeekEp;
        const updatedByWeek = {
          ...(prev.weeklyEpByWeek || {}),
          ...(legacyFallback > 0 ? { [prevWeek]: Math.max(prev.weeklyEpByWeek?.[prevWeek] || 0, legacyFallback) } : {}),
          [currentWeek]: computedCurrentWeekEp
        };
        return {
          ...prev,
          weeklyEp: computedCurrentWeekEp,
          weeklyEpWeek: currentWeek,
          weeklyEpByWeek: updatedByWeek
        };
      });
    }
  }, [isFirestoreSynced, user, currentDate, workoutHistory, manualQuestCompletions, profile.weeklyEpWeek, profile.weeklyEp]);

  useEffect(() => {
    if (!isFirestoreSynced || !user) return;
    const prevWeek = getPreviousWeekString(currentDate);

    if (profile.claimedLeaderboardWeeks?.[prevWeek]) return;
    if (pendingLeaderboardReward?.weekStr === prevWeek) return;
    if (checkingLeaderboardWeekRef.current === prevWeek) return;

    checkingLeaderboardWeekRef.current = prevWeek;

    const evaluateWeeklyLeaderboard = async () => {
      try {
        const friendsList = profile.friends && profile.friends.length > 0
          ? await getFriendsProfiles(profile.friends)
          : [];

        const currentWeek = getWeekString(currentDate);
        const myPrevWeekEp = calculateWeeklyEpForWeek(workoutHistory, manualQuestCompletions, prevWeek, profile);
        const myCurrentWeekEp = calculateWeeklyEpForWeek(workoutHistory, manualQuestCompletions, currentWeek, profile);
        const myTotalWorkoutEp = workoutHistory.reduce((sum, w) => sum + Math.max(0, w.epChange || 0), 0);
        const myOverallEp = Math.max(profile.weeklyEp || 0, myTotalWorkoutEp, (profile.level - 1) * 100 + (profile.lp || 0));

        const hasNeverClaimed = !profile.claimedLeaderboardWeeks || Object.keys(profile.claimedLeaderboardWeeks).length === 0;
        const uid = user.uid || user.username || 'me';

        const rankParticipants = (myEp: number, getFriendEp: (f: any) => number) => {
          const list = [
            { uid, ep: myEp },
            ...friendsList.map((f: any) => ({ uid: f.uid, ep: getFriendEp(f) }))
          ];
          const uniqueMap = new Map<string, { uid: string; ep: number }>();
          list.forEach(p => uniqueMap.set(p.uid, p));
          const sorted = Array.from(uniqueMap.values()).sort((a, b) => b.ep - a.ep);
          const idx = sorted.findIndex(p => p.uid === uid);
          return { place: idx + 1, ep: myEp };
        };

        let result = rankParticipants(myPrevWeekEp, (f: any) => f.prevWeeklyEp || 0);

        if (hasNeverClaimed && (result.ep === 0 || result.place > 3)) {
          const candidates = [
            result,
            rankParticipants(myCurrentWeekEp, (f: any) => f.profile?.weeklyEp || 0),
            rankParticipants(myOverallEp, (f: any) => Math.max(f.rawWeeklyEp || 0, f.totalWorkoutEp || 0, ((f.profile?.level || 1) - 1) * 100 + (f.profile?.lp || 0)))
          ].filter(c => c.ep > 0 && c.place >= 1 && c.place <= 3);

          if (candidates.length > 0) {
            candidates.sort((a, b) => a.place - b.place || b.ep - a.ep);
            result = candidates[0];
          }
        }

        const myPlace = result.place;
        const myEffectiveEp = result.ep;

        if (myEffectiveEp > 0 && (myPlace === 1 || myPlace === 2 || myPlace === 3)) {
          const bonusEp = myPlace === 1 ? 500 : myPlace === 2 ? 300 : 150;
          const placeLabel = myPlace === 1 ? '1st' : myPlace === 2 ? '2nd' : '3rd';
          setPendingLeaderboardReward({
            weekStr: prevWeek,
            place: myPlace as 1 | 2 | 3,
            placeLabel,
            bonusEp,
            weeklyEpEarned: myEffectiveEp
          });
        } else if (!hasNeverClaimed) {
          setProfile(prev => {
            const updated: UserProfile = {
              ...prev,
              lastClaimedLeaderboardWeek: prevWeek,
              claimedLeaderboardWeeks: {
                ...(prev.claimedLeaderboardWeeks || {}),
                [prevWeek]: true
              }
            };
            stateRef.current = { ...stateRef.current, profile: updated };
            persistState({ profile: updated }, true);
            return updated;
          });
        }
      } catch (err) {
        console.error('Failed to evaluate weekly leaderboard reward:', err);
        checkingLeaderboardWeekRef.current = null;
      }
    };

    evaluateWeeklyLeaderboard();
  }, [isFirestoreSynced, user, currentDate, profile.claimedLeaderboardWeeks, profile.friends, pendingLeaderboardReward, workoutHistory, manualQuestCompletions, persistState]);

  const claimLeaderboardReward = () => {
    if (!pendingLeaderboardReward) return;
    const { bonusEp, weekStr } = pendingLeaderboardReward;
    setPendingLeaderboardReward(null);

    setProfile(prev => {
      let newLp = prev.lp + bonusEp;
      let newLevel = prev.level;

      while (newLp >= getRequiredEpForLevel(newLevel)) {
        newLp -= getRequiredEpForLevel(newLevel);
        newLevel += 1;
      }

      const { tier } = getRankInfo(newLevel);
      const updatedProfile: UserProfile = {
        ...prev,
        lp: newLp,
        level: newLevel,
        rank: tier,
        lastClaimedLeaderboardWeek: weekStr,
        claimedLeaderboardWeeks: {
          ...(prev.claimedLeaderboardWeeks || {}),
          [weekStr]: true
        }
      };

      stateRef.current = { ...stateRef.current, profile: updatedProfile };
      persistState({ profile: updatedProfile }, true);
      return updatedProfile;
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
    // 1. Immediately terminate active workout state
    setActiveWorkout(null);
    setActiveExercises([]);

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

      // Check Streak & Major Milestones
      const newHistory = [...workoutHistory, log];
      const newStreak = calculateStreak(newHistory, scheduledWorkoutDays);
      const oldStreak = calculateStreak(workoutHistory, scheduledWorkoutDays);

      const milestone = getStreakMilestoneBonus(newStreak, oldStreak);
      if (milestone) {
        // Award instant milestone bonus EP!
        addEp(milestone.bonusEp);
        publishHighlight({
          userId: user.uid,
          username: user.username,
          avatar: avatarConfig,
          type: 'STREAK',
          data: {
            streak: newStreak,
            milestoneTitle: milestone.title,
            badge: milestone.badge,
            bonusEp: milestone.bonusEp
          },
          timestamp: Date.now() + 2
        }).catch(err => console.error("Failed to publish streak milestone highlight:", err));
      } else if (newStreak >= 10 && newStreak % 10 === 0 && newStreak > oldStreak) {
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

    const nextHistory = [...workoutHistory, log];
    setWorkoutHistory(nextHistory);
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
      const updatedProfile = {
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
      // Immediately write to LocalStorage & Firestore
      persistState({
        activeWorkout: null,
        activeExercises: [],
        workoutHistory: nextHistory,
        profile: updatedProfile
      }, true);
      return updatedProfile;
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

    const updated = workoutHistory.filter(w => w.id !== id);
    setWorkoutHistory(updated);
    persistState({ workoutHistory: updated }, true);
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
      persistState({ workoutHistory: newHistory }, true);
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
    persistState({
      activeWorkout: null,
      activeExercises: []
    }, true);
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
      equipCosmetic,
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
      addSteps,
      dailyStepsTarget,
      dailyWaterTarget,
      dailyWaterIntake,
      addWaterIntake,
      dailyWorkoutDurationTarget,
      updateChallengeTargets: (stepsTarget: number, durationTarget: number | string) => {
        setDailyStepsTarget(stepsTarget);
        if (typeof durationTarget === 'number') {
          setDailyWorkoutDurationTarget(durationTarget);
        } else if (typeof durationTarget === 'string') {
          setDailyWaterTarget(durationTarget);
        }
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
      updateMeal: saveMeal,
      deleteMeal,
      logFood,
      toggleFavoriteFood,
      saveToFavorites,
      removeFavoriteFood,
      customMealCategories,
      saveCustomMealCategories: (categories: CustomMealCategory[]) => setCustomMealCategories(categories),
      pendingLeaderboardReward,
      claimLeaderboardReward,
      isAppTourOpen,
      startAppTour,
      completeAppTour,
      currentDate,
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
