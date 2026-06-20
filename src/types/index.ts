export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Masters';

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

export interface AvatarConfig {
  seed: string;
  skinColor: string;
  top: string;
  hairColor: string;
  clothingColor: string;
  accessories?: string;
  facialHair?: string;
  eyes?: string;
  mouth?: string;
  body?: string;
}

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
}

export interface WeightEntry {
  date: string; // YYYY-MM-DD
  weightLbs: number;
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
export interface PresetExercise {
  id: string | number;
  name: string;
  sets: string;
  reps: string;
  weight?: string | number;
}

export interface WorkoutPreset {
  id: string;
  name: string;
  exercises: PresetExercise[];
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
}
