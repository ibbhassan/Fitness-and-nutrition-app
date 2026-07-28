import type { ExerciseDefinition } from '../types';

export const exerciseLibrary: ExerciseDefinition[] = [
  // Chest
  { id: 'ch-1', name: 'Barbell Bench Press', muscleGroup: 'Chest', imagePath: '/images/anatomy_bench_1780847028088.png' },
  { id: 'ch-2', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', imagePath: '/images/anatomy_incline_db_press_1780847279978.png' },
  { id: 'ch-3', name: 'Chest Flyes', muscleGroup: 'Chest', imagePath: '/images/anatomy_chest_flyes_1780847289317.png' },
  { id: 'ch-4', name: 'Cable Crossovers', muscleGroup: 'Chest', imagePath: '/images/anatomy_cable_crossovers_1780847299725.png' },
  { id: 'ch-5', name: 'Push-ups', muscleGroup: 'Chest', imagePath: '/images/anatomy_pushups_1780847311252.png' },
  { id: 'ch-6', name: 'Decline Bench Press', muscleGroup: 'Chest', imagePath: '/images/anatomy_decline_bench_1780847321456.png' },
  { id: 'ch-7', name: 'Pec Deck Machine', muscleGroup: 'Chest', imagePath: '/images/anatomy_pec_deck_1780847331738.png' },

  // Back
  { id: 'bk-1', name: 'Barbell Deadlift', muscleGroup: 'Back', imagePath: '/images/anatomy_deadlift_1780847045291.png' },
  { id: 'bk-2', name: 'Pull-ups', muscleGroup: 'Back', imagePath: '/images/anatomy_pullups_1780847385190.png' },
  { id: 'bk-3', name: 'Lat Pulldown', muscleGroup: 'Back', imagePath: '/images/anatomy_lat_pulldown_1780847395878.png' },
  { id: 'bk-4', name: 'Barbell Row', muscleGroup: 'Back', imagePath: '/images/anatomy_barbell_row_1780847405830.png' },
  { id: 'bk-5', name: 'Seated Cable Row', muscleGroup: 'Back', imagePath: '/images/anatomy_seated_cable_row_v2_1785266887631.jpg' },
  { id: 'bk-6', name: 'Dumbbell Row', muscleGroup: 'Back', imagePath: '/images/anatomy_dumbbell_row_v2_1785266896504.jpg' },
  { id: 'bk-7', name: 'T-Bar Row', muscleGroup: 'Back', imagePath: '/images/anatomy_t_bar_row_v2_1785266905763.jpg' },
  { id: 'bk-8', name: 'Face Pulls', muscleGroup: 'Back', imagePath: '/images/anatomy_face_pulls_1781365717245.png' },

  // Legs
  { id: 'lg-1', name: 'Barbell Squat', muscleGroup: 'Legs', imagePath: '/images/anatomy_squat_1780847015192.png' },
  { id: 'lg-2', name: 'Leg Press', muscleGroup: 'Legs', imagePath: '/images/anatomy_leg_press_1781365657257.png' },
  { id: 'lg-3', name: 'Romanian Deadlift (RDL)', muscleGroup: 'Legs', imagePath: '/images/anatomy_rdl_1781365728265.png' },
  { id: 'lg-4', name: 'Leg Extensions', muscleGroup: 'Legs', imagePath: '/images/anatomy_leg_extensions_1781365738376.png' },
  { id: 'lg-5', name: 'Leg Curls', muscleGroup: 'Legs', imagePath: '/images/anatomy_leg_curls_1781365746342.png' },
  { id: 'lg-6', name: 'Walking Lunges', muscleGroup: 'Legs', imagePath: '/images/anatomy_walking_lunges_1781365755881.png' },
  { id: 'lg-7', name: 'Calf Raises', muscleGroup: 'Legs', imagePath: '/images/anatomy_calf_raises_1781365767316.png' },
  { id: 'lg-8', name: 'Bulgarian Split Squats', muscleGroup: 'Legs', imagePath: '/images/anatomy_bulgarian_split_squats_1781365777584.png' },

  // Shoulders
  { id: 'sh-1', name: 'Overhead Press (OHP)', muscleGroup: 'Shoulders', imagePath: '/images/anatomy_overhead_press_1781365669127.png' },
  { id: 'sh-2', name: 'Lateral Raises', muscleGroup: 'Shoulders', imagePath: '/images/anatomy_lateral_raises_1781365788971.png' },
  { id: 'sh-3', name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', imagePath: '/images/anatomy_dumbbell_shoulder_press_1781365799380.png' },
  { id: 'sh-4', name: 'Front Raises', muscleGroup: 'Shoulders', imagePath: '/images/anatomy_front_raises_1781365880098.png' },
  { id: 'sh-5', name: 'Reverse Pec Deck', muscleGroup: 'Shoulders', imagePath: '/images/anatomy_reverse_pec_deck_1785266913063.jpg' },
  { id: 'sh-6', name: 'Arnold Press', muscleGroup: 'Shoulders', imagePath: '/images/anatomy_arnold_press_1785266920824.jpg' },
  { id: 'sh-7', name: 'Upright Row', muscleGroup: 'Shoulders', imagePath: '/images/anatomy_upright_row_1785266928616.jpg' },

  // Arms
  { id: 'ar-1', name: 'Barbell Bicep Curls', muscleGroup: 'Arms', imagePath: '/images/anatomy_barbell_bicep_curls_1781365683915.png' },
  { id: 'ar-2', name: 'Tricep Pushdowns', muscleGroup: 'Arms', imagePath: '/images/anatomy_tricep_pushdowns_1785266951117.jpg' },
  { id: 'ar-3', name: 'Hammer Curls', muscleGroup: 'Arms', imagePath: '/images/anatomy_hammer_curls_1785266960008.jpg' },
  { id: 'ar-4', name: 'Skull Crushers', muscleGroup: 'Arms', imagePath: '/images/anatomy_skull_crushers_1785266971136.jpg' },
  { id: 'ar-5', name: 'Preacher Curls', muscleGroup: 'Arms', imagePath: '/images/anatomy_preacher_curls_1785266979289.jpg' },
  { id: 'ar-6', name: 'Overhead Tricep Extension', muscleGroup: 'Arms', imagePath: '/images/anatomy_overhead_tricep_extension_1785266987133.jpg' },
  { id: 'ar-7', name: 'Concentration Curls', muscleGroup: 'Arms', imagePath: '/images/anatomy_concentration_curls_1785266994354.jpg' },
  { id: 'ar-8', name: 'Tricep Dips', muscleGroup: 'Arms', imagePath: '/images/anatomy_tricep_dips_1785267030578.jpg' },

  // Core
  { id: 'co-1', name: 'Crunches', muscleGroup: 'Core', imagePath: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800' },
  { id: 'co-2', name: 'Plank', muscleGroup: 'Core', imagePath: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&q=80&w=800' },
  { id: 'co-3', name: 'Hanging Leg Raises', muscleGroup: 'Core', imagePath: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800' },
  { id: 'co-4', name: 'Russian Twists', muscleGroup: 'Core', imagePath: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800' },
  { id: 'co-5', name: 'Cable Crunches', muscleGroup: 'Core', imagePath: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800' },
  { id: 'co-6', name: 'Ab Wheel Rollouts', muscleGroup: 'Core', imagePath: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&q=80&w=800' }
];
