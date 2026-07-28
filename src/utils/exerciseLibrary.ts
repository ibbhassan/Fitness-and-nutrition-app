import type { ExerciseDefinition } from '../types';

const MUSCLE_GROUP_IMAGES = {
  Chest: '/images/anatomy/chest.svg',
  Back: '/images/anatomy/back.svg',
  Legs: '/images/anatomy/legs.svg',
  Shoulders: '/images/anatomy/shoulders.svg',
  Arms: '/images/anatomy/arms.svg',
  Core: '/images/anatomy/core.svg'
};

export const exerciseLibrary: ExerciseDefinition[] = [
  // Chest
  { id: 'ch-1', name: 'Barbell Bench Press', muscleGroup: 'Chest' },
  { id: 'ch-2', name: 'Incline Dumbbell Press', muscleGroup: 'Chest' },
  { id: 'ch-3', name: 'Chest Flyes', muscleGroup: 'Chest' },
  { id: 'ch-4', name: 'Cable Crossovers', muscleGroup: 'Chest' },
  { id: 'ch-5', name: 'Push-ups', muscleGroup: 'Chest' },
  { id: 'ch-6', name: 'Decline Bench Press', muscleGroup: 'Chest' },
  { id: 'ch-7', name: 'Pec Deck Machine', muscleGroup: 'Chest' },

  // Back
  { id: 'bk-1', name: 'Barbell Deadlift', muscleGroup: 'Back' },
  { id: 'bk-2', name: 'Pull-ups', muscleGroup: 'Back' },
  { id: 'bk-3', name: 'Lat Pulldown', muscleGroup: 'Back' },
  { id: 'bk-4', name: 'Barbell Row', muscleGroup: 'Back' },
  { id: 'bk-5', name: 'Seated Cable Row', muscleGroup: 'Back' },
  { id: 'bk-6', name: 'Dumbbell Row', muscleGroup: 'Back' },
  { id: 'bk-7', name: 'T-Bar Row', muscleGroup: 'Back' },
  { id: 'bk-8', name: 'Face Pulls', muscleGroup: 'Back' },

  // Legs
  { id: 'lg-1', name: 'Barbell Squat', muscleGroup: 'Legs' },
  { id: 'lg-2', name: 'Leg Press', muscleGroup: 'Legs' },
  { id: 'lg-3', name: 'Romanian Deadlift (RDL)', muscleGroup: 'Legs' },
  { id: 'lg-4', name: 'Leg Extensions', muscleGroup: 'Legs' },
  { id: 'lg-5', name: 'Leg Curls', muscleGroup: 'Legs' },
  { id: 'lg-6', name: 'Walking Lunges', muscleGroup: 'Legs' },
  { id: 'lg-7', name: 'Calf Raises', muscleGroup: 'Legs' },
  { id: 'lg-8', name: 'Bulgarian Split Squats', muscleGroup: 'Legs' },

  // Shoulders
  { id: 'sh-1', name: 'Overhead Press (OHP)', muscleGroup: 'Shoulders' },
  { id: 'sh-2', name: 'Lateral Raises', muscleGroup: 'Shoulders' },
  { id: 'sh-3', name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders' },
  { id: 'sh-4', name: 'Front Raises', muscleGroup: 'Shoulders' },
  { id: 'sh-5', name: 'Reverse Pec Deck', muscleGroup: 'Shoulders' },
  { id: 'sh-6', name: 'Arnold Press', muscleGroup: 'Shoulders' },
  { id: 'sh-7', name: 'Upright Row', muscleGroup: 'Shoulders' },

  // Arms
  { id: 'ar-1', name: 'Barbell Bicep Curls', muscleGroup: 'Arms' },
  { id: 'ar-2', name: 'Tricep Pushdowns', muscleGroup: 'Arms' },
  { id: 'ar-3', name: 'Hammer Curls', muscleGroup: 'Arms' },
  { id: 'ar-4', name: 'Skull Crushers', muscleGroup: 'Arms' },
  { id: 'ar-5', name: 'Preacher Curls', muscleGroup: 'Arms' },
  { id: 'ar-6', name: 'Overhead Tricep Extension', muscleGroup: 'Arms' },
  { id: 'ar-7', name: 'Concentration Curls', muscleGroup: 'Arms' },
  { id: 'ar-8', name: 'Tricep Dips', muscleGroup: 'Arms' },

  // Core
  { id: 'co-1', name: 'Crunches', muscleGroup: 'Core' },
  { id: 'co-2', name: 'Plank', muscleGroup: 'Core' },
  { id: 'co-3', name: 'Hanging Leg Raises', muscleGroup: 'Core' },
  { id: 'co-4', name: 'Russian Twists', muscleGroup: 'Core' },
  { id: 'co-5', name: 'Cable Crunches', muscleGroup: 'Core' },
  { id: 'co-6', name: 'Ab Wheel Rollouts', muscleGroup: 'Core' }
].map(ex => ({
  ...ex,
  muscleGroup: ex.muscleGroup as ExerciseDefinition['muscleGroup'],
  imagePath: MUSCLE_GROUP_IMAGES[ex.muscleGroup as keyof typeof MUSCLE_GROUP_IMAGES]
})) as ExerciseDefinition[];
