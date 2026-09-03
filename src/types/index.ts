export type RankTier = 'Iron' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Emerald' | 'Diamond' | 'Master' | 'Grandmaster' | 'Challenger';

export interface UserStats {
  strength: number;
  endurance: number;
  consistency: number;
  power: number;
  hypertrophy: number;
  volume: number;
}

export interface MatchHistoryEntry {
  id: string;
  date: string;
  title: string;
  durationMinutes: number;
  grade: 'S+' | 'S' | 'A' | 'B' | 'C';
  isPr: boolean;
  notes?: string;
  lpChange: number;
}

export type AvatarConfig = string;

export interface UserProfile {
  name: string;
  avatar?: AvatarConfig;
  level: number;
  rank: RankTier;
  lp: number;
  inPromoSeries: boolean;
  promoWins: number;
  promoLosses: number;
  stats: UserStats;
  currentMode: 'Cut' | 'Bulk' | 'Maintenance';
  lastSeenPatchVersion?: string;
  friends?: string[];
  weeklyEp?: number;
}

export interface FriendRequest {
  id: string;
  fromUid: string;
  fromUsername: string;
  toUid: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
}

export interface DailyNutrition {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
}

export interface Biometrics {
  gender: 'Male' | 'Female';
  age: number;
  heightFeet: number;
  heightInches: number;
  weightLbs: number;
  bodyFat?: number;
}

export interface WeightEntry {
  date: string; // YYYY-MM-DD
  weightLbs: number;
}

export interface BodyFatEntry {
  date: string; // YYYY-MM-DD
  bodyFatPercent: number;
}

export interface FoodItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  barcode?: string;
  isFavorite?: boolean;
  timestamp?: number;
  macrosPerUnit: { // Per 1 unit of `unit` (e.g., per 1g or per 1 whole)
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface FoodLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  food: FoodItem;
}

export interface Meal {
  id: string;
  name: string;
  items: FoodItem[];
}
export interface WorkoutPreset {
  id: string;
  name: string;
  exercises: ActiveExercise[];
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body';
  imagePath?: string;
}

export type SetType = 'Warmup' | 'Normal' | 'Drop' | 'Failure';

export interface LoggedSet {
  id: string;
  reps: number;
  weight: number;
  type: SetType;
  completed: boolean;
}

export interface ActiveExercise {
  id: string;
  name: string;
  sets: LoggedSet[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  name: string;
  durationMinutes: number;
  exercises: ActiveExercise[];
  volume: number;
  grade?: 'S+' | 'S' | 'A' | 'B' | 'C';
  epChange?: number;
  isPr?: boolean;
}

export interface HighlightEvent {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  type: 'WORKOUT_COMPLETED' | 'PR_BROKEN' | 'RANK_UP' | 'STREAK';
  data: any;
  timestamp: number;
  fistBumps?: string[];
}
