import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { Plus, Play, Pause, Check, Save, X, Trash2, Trophy, Dumbbell, ArrowLeft, GripVertical, ChevronLeft, ChevronRight, Calendar, ChevronDown, Clock } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { getLocalDateString } from '../utils/dateUtils';
import { calculateStreak } from '../utils/streakUtils';
import { CalendarModal } from '../components/CalendarModal';
import type { WorkoutPreset, LoggedSet, ActiveExercise, WorkoutLog } from '../types';
import { exerciseLibrary } from '../utils/exerciseLibrary';
import { RestTimer } from '../components/RestTimer';
import { clsx } from 'clsx';
import { LiveWorkoutTimer } from '../components/LiveWorkoutTimer';

const ExerciseCard = ({
  exercise,
  exIndex,
  isPreset,
  exerciseList,
  setExerciseList,
  openLibrary,
  getPreviousSetData,
  setLastCompletedSetTime
}: {
  exercise: ActiveExercise;
  exIndex: number;
  isPreset: boolean;
  exerciseList: ActiveExercise[];
  setExerciseList: (list: ActiveExercise[]) => void;
  openLibrary: (index: number, target: 'preset' | 'active') => void;
  getPreviousSetData: (name: string, setIndex: number) => any;
  setLastCompletedSetTime?: (time: number) => void;
}) => {
  const controls = useDragControls();

  const updateSet = (setIndex: number, field: keyof LoggedSet, value: any) => {
    const newEx = [...exerciseList];
    newEx[exIndex].sets[setIndex] = { ...newEx[exIndex].sets[setIndex], [field]: value };
    setExerciseList(newEx);
  };

  const addSet = () => {
    const newEx = [...exerciseList];
    const prevSet = newEx[exIndex].sets[newEx[exIndex].sets.length - 1];
    newEx[exIndex].sets.push({
      id: `${Date.now()}-${newEx[exIndex].sets.length}`,
      reps: prevSet ? prevSet.reps : 0,
      weight: prevSet ? prevSet.weight : 0,
      type: 'Normal',
      completed: false
    });
    setExerciseList(newEx);
  };

  const removeSet = (setIndex: number) => {
    const newEx = [...exerciseList];
    newEx[exIndex].sets.splice(setIndex, 1);
    setExerciseList(newEx);
  };

  const cycleSetType = (setIndex: number, currentType: string) => {
    const types: Array<'Normal' | 'Warmup' | 'Drop' | 'Failure'> = ['Normal', 'Warmup', 'Drop', 'Failure'];
    const nextIndex = (types.indexOf(currentType as 'Normal' | 'Warmup' | 'Drop' | 'Failure') + 1) % types.length;
    updateSet(setIndex, 'type', types[nextIndex]);
  };

  const toggleSetComplete = (setIndex: number) => {
    if (isPreset) return;
    const newEx = [...exerciseList];
    const isNowCompleted = !newEx[exIndex].sets[setIndex].completed;
    newEx[exIndex].sets[setIndex].completed = isNowCompleted;
    setExerciseList(newEx);
    if (isNowCompleted && setLastCompletedSetTime) {
      setLastCompletedSetTime(Date.now());
    }
  };

  return (
    <Reorder.Item 
      value={exercise}
      dragListener={false}
      dragControls={controls}
      className="bg-black border border-tactical-800/30 rounded-2xl p-4 sm:p-5 mb-4 relative shadow-2xl"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-1">
          <div 
            className="cursor-grab active:cursor-grabbing text-tactical-600 hover:text-white p-2 flex items-center justify-center -ml-3"
            onPointerDown={(e) => controls.start(e)}
            style={{ touchAction: "none" }}
          >
            <GripVertical className="w-5 h-5" />
          </div>
          <button 
            onClick={() => openLibrary(exIndex, isPreset ? 'preset' : 'active')}
            className="text-white hover:text-neon-blue transition-colors font-rajdhani font-bold text-xl uppercase tracking-wider text-left"
          >
            {exercise.name || 'Select Exercise...'}
          </button>
        </div>
        <button 
          onClick={() => {
            const newEx = [...exerciseList];
            newEx.splice(exIndex, 1);
            setExerciseList(newEx);
          }}
          className="text-gray-600 hover:text-neon-red transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div>
        <Reorder.Group 
          axis="y" 
          values={exercise.sets} 
          onReorder={(newSets) => {
            const newEx = [...exerciseList];
            newEx[exIndex].sets = newSets;
            setExerciseList(newEx);
          }}
          className="space-y-2"
        >
          {exercise.sets.map((set, setIndex) => {
            const prevData = getPreviousSetData(exercise.name, setIndex);
            
            const dotColor = set.type === 'Warmup' ? "bg-neon-gold shadow-[0_0_5px_rgba(255,215,0,0.5)]" : 
                           set.type === 'Drop' ? "bg-neon-purple shadow-[0_0_5px_rgba(176,38,255,0.5)]" :
                           set.type === 'Failure' ? "bg-neon-red shadow-[0_0_5px_rgba(255,51,102,0.5)]" : 
                           "bg-neon-blue shadow-[0_0_5px_rgba(0,240,255,0.5)]";

            return (
              <Reorder.Item 
                key={set.id} 
                value={set}
                className={clsx(
                  "flex items-center gap-2 sm:gap-3 p-2 rounded-xl transition-all border",
                  set.completed 
                    ? "bg-neon-green/5 border-neon-green/20" 
                    : "bg-tactical-900/30 border-transparent hover:bg-tactical-800/40"
                )}
              >
                {/* Drag Handle for Set */}
                <div className="cursor-grab active:cursor-grabbing text-tactical-600 hover:text-gray-400 p-1 flex items-center justify-center shrink-0">
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Set Indicator */}
                <button
                  onClick={() => cycleSetType(setIndex, set.type)}
                  className="flex items-center gap-2 w-10 shrink-0 group"
                  title="Click to change set type"
                >
                  <span className="text-gray-500 font-mono text-sm group-hover:text-white transition-colors">{setIndex + 1}.</span>
                  <div className={clsx("w-1.5 h-1.5 rounded-full", dotColor)}></div>
                </button>
                
                {/* Inputs & Prev Data */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  
                  {/* Prev Data */}
                  <div className="flex items-center sm:w-20 shrink-0">
                    <span className="text-[10px] text-gray-600 font-mono">
                      {prevData ? `P: ${prevData.weight}x${prevData.reps}` : 'P: -'}
                    </span>
                  </div>

                  {/* Lbs x Reps */}
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1 max-w-[80px]">
                      <input 
                        type="number" 
                        step="any"
                        value={set.weight === 0 ? '' : set.weight}
                        onChange={(e) => updateSet(setIndex, 'weight', e.target.value)}
                        className="w-full bg-tactical-900/50 rounded-lg p-2 text-white font-bold text-sm text-center focus:outline-none focus:ring-1 focus:ring-neon-blue placeholder-gray-700 transition-all"
                        placeholder="lbs"
                      />
                    </div>
                    <span className="text-gray-600 font-bold text-sm">×</span>
                    <div className="relative flex-1 max-w-[80px]">
                      <input 
                        type="number" 
                        step="any"
                        value={set.reps === 0 ? '' : set.reps}
                        onChange={(e) => updateSet(setIndex, 'reps', e.target.value)}
                        className="w-full bg-tactical-900/50 rounded-lg p-2 text-white font-bold text-sm text-center focus:outline-none focus:ring-1 focus:ring-neon-blue placeholder-gray-700 transition-all"
                        placeholder="reps"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <button
                    onClick={() => removeSet(setIndex)}
                    className="w-8 h-8 hover:text-neon-red rounded-lg flex items-center justify-center text-gray-600 transition-colors"
                    title="Delete Set"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  {!isPreset && (
                    <button 
                      onClick={() => toggleSetComplete(setIndex)}
                      className={clsx(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                        set.completed 
                          ? "bg-neon-green text-tactical-900 shadow-[0_0_10px_rgba(0,255,100,0.3)]" 
                          : "bg-tactical-800 text-transparent hover:border hover:border-neon-green/50"
                      )}
                    >
                      <Check className={clsx("w-4 h-4", set.completed ? "text-tactical-900" : "hidden")} />
                    </button>
                  )}
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
        
        <button
          onClick={addSet}
          className="mt-4 w-full py-3 border border-dashed border-tactical-800 hover:border-neon-blue text-gray-500 hover:text-neon-blue bg-transparent rounded-xl transition-all font-rajdhani font-bold text-sm uppercase flex justify-center items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Set
        </button>
      </div>
    </Reorder.Item>
  );
};

type WorkoutCategory = {
  id: string;
  title: string;
  description: string;
  workouts: WorkoutPreset[];
};

const createSets = (numSets: number, reps: number): LoggedSet[] => {
  return Array.from({ length: numSets }).map((_, i) => ({
    id: `${Date.now()}-${i}`,
    reps: reps,
    weight: 0,
    type: 'Normal',
    completed: false
  }));
};

const RECOMMENDED_WORKOUT_CATEGORIES: WorkoutCategory[] = [
  {
    id: 'cat-ppl',
    title: 'Push / Pull / Legs (PPL)',
    description: 'The classic 3-day split, focusing on movement patterns.',
    workouts: [
      { 
        id: 'rec-ppl-1', 
        name: 'Push', 
        exercises: [
          { id: '1', name: 'Bench Press', sets: createSets(4, 8) }, 
          { id: '2', name: 'Overhead Press', sets: createSets(3, 10) }, 
          { id: '3', name: 'Incline Dumbbell Press', sets: createSets(3, 10) },
          { id: '4', name: 'Lateral Raises', sets: createSets(4, 15) },
          { id: '5', name: 'Tricep Extensions', sets: createSets(3, 12) },
          { id: '6', name: 'Skull Crushers', sets: createSets(3, 12) }
        ] 
      },
      { 
        id: 'rec-ppl-2', 
        name: 'Pull', 
        exercises: [
          { id: '1', name: 'Deadlift', sets: createSets(3, 5) }, 
          { id: '2', name: 'Pull-ups', sets: createSets(3, 10) }, 
          { id: '3', name: 'Barbell Row', sets: createSets(3, 8) },
          { id: '4', name: 'Face Pulls', sets: createSets(3, 15) },
          { id: '5', name: 'Bicep Curls', sets: createSets(3, 12) },
          { id: '6', name: 'Hammer Curls', sets: createSets(3, 12) }
        ] 
      },
      { 
        id: 'rec-ppl-3', 
        name: 'Legs', 
        exercises: [
          { id: '1', name: 'Squat', sets: createSets(4, 8) }, 
          { id: '2', name: 'Leg Press', sets: createSets(3, 12) }, 
          { id: '3', name: 'Romanian Deadlift (RDL)', sets: createSets(3, 10) },
          { id: '4', name: 'Leg Extensions', sets: createSets(3, 15) },
          { id: '5', name: 'Leg Curls', sets: createSets(3, 15) },
          { id: '6', name: 'Calf Raises', sets: createSets(4, 20) }
        ] 
      }
    ]
  },
  {
    id: 'cat-ul',
    title: 'Upper / Lower',
    description: 'A 4-day split, alternating upper and lower body.',
    workouts: [
      {
        id: 'rec-ul-1',
        name: 'Upper Body',
        exercises: [
          { id: '1', name: 'Bench Press', sets: createSets(4, 8) },
          { id: '2', name: 'Barbell Row', sets: createSets(4, 8) },
          { id: '3', name: 'Overhead Press', sets: createSets(3, 10) },
          { id: '4', name: 'Lat Pulldown', sets: createSets(3, 10) },
          { id: '5', name: 'Bicep Curls', sets: createSets(3, 12) },
          { id: '6', name: 'Tricep Pushdowns', sets: createSets(3, 12) }
        ]
      },
      {
        id: 'rec-ul-2',
        name: 'Lower Body',
        exercises: [
          { id: '1', name: 'Squat', sets: createSets(4, 8) },
          { id: '2', name: 'Romanian Deadlift (RDL)', sets: createSets(4, 8) },
          { id: '3', name: 'Leg Press', sets: createSets(3, 12) },
          { id: '4', name: 'Leg Curls', sets: createSets(3, 15) },
          { id: '5', name: 'Calf Raises', sets: createSets(4, 20) }
        ]
      }
    ]
  },
  {
    id: 'cat-wf',
    title: 'Women\'s Focus (Glute & Leg Heavy)',
    description: 'A 6-day split designed around lower body development (4x legs, 2x upper).',
    workouts: [
      {
        id: 'rec-wf-1',
        name: 'Legs 1 (Glutes & Hams)',
        exercises: [
          { id: '1', name: 'Hip Thrusts', sets: createSets(4, 10) },
          { id: '2', name: 'Romanian Deadlift (RDL)', sets: createSets(4, 10) },
          { id: '3', name: 'Bulgarian Split Squats', sets: createSets(3, 12) },
          { id: '4', name: 'Leg Curls', sets: createSets(3, 15) },
          { id: '5', name: 'Glute Kickbacks', sets: createSets(3, 15) }
        ]
      },
      {
        id: 'rec-wf-2',
        name: 'Upper 1 (Back & Shoulders)',
        exercises: [
          { id: '1', name: 'Lat Pulldown', sets: createSets(3, 10) },
          { id: '2', name: 'Seated Cable Row', sets: createSets(3, 12) },
          { id: '3', name: 'Overhead Press', sets: createSets(3, 10) },
          { id: '4', name: 'Lateral Raises', sets: createSets(4, 15) },
          { id: '5', name: 'Face Pulls', sets: createSets(3, 15) }
        ]
      },
      {
        id: 'rec-wf-3',
        name: 'Legs 2 (Quads & Calves)',
        exercises: [
          { id: '1', name: 'Squat', sets: createSets(4, 8) },
          { id: '2', name: 'Leg Press', sets: createSets(3, 12) },
          { id: '3', name: 'Leg Extensions', sets: createSets(3, 15) },
          { id: '4', name: 'Walking Lunges', sets: createSets(3, 12) },
          { id: '5', name: 'Calf Raises', sets: createSets(4, 20) }
        ]
      },
      {
        id: 'rec-wf-4',
        name: 'Upper 2 (Chest & Arms)',
        exercises: [
          { id: '1', name: 'Incline Dumbbell Press', sets: createSets(3, 10) },
          { id: '2', name: 'Push-ups', sets: createSets(3, 15) },
          { id: '3', name: 'Bicep Curls', sets: createSets(3, 12) },
          { id: '4', name: 'Tricep Extensions', sets: createSets(3, 12) }
        ]
      },
      {
        id: 'rec-wf-5',
        name: 'Legs 3 (Glutes Focus)',
        exercises: [
          { id: '1', name: 'Hip Thrusts', sets: createSets(4, 10) },
          { id: '2', name: 'Cable Pull-throughs', sets: createSets(3, 15) },
          { id: '3', name: 'Step-ups', sets: createSets(3, 12) },
          { id: '4', name: 'Abductor Machine', sets: createSets(3, 15) }
        ]
      },
      {
        id: 'rec-wf-6',
        name: 'Legs 4 (Full Legs & Plyo)',
        exercises: [
          { id: '1', name: 'Front Squats', sets: createSets(3, 10) },
          { id: '2', name: 'Jump Squats', sets: createSets(3, 15) },
          { id: '3', name: 'Kettlebell Swings', sets: createSets(3, 15) },
          { id: '4', name: 'Calf Raises', sets: createSets(4, 20) }
        ]
      }
    ]
  },
  {
    id: 'cat-fb',
    title: 'Full Body',
    description: 'A 3-day split hitting the entire body each session.',
    workouts: [
      {
        id: 'rec-fb-1',
        name: 'Full Body A',
        exercises: [
          { id: '1', name: 'Squat', sets: createSets(3, 8) },
          { id: '2', name: 'Bench Press', sets: createSets(3, 8) },
          { id: '3', name: 'Barbell Row', sets: createSets(3, 8) },
          { id: '4', name: 'Overhead Press', sets: createSets(3, 10) },
          { id: '5', name: 'Leg Curls', sets: createSets(3, 12) }
        ]
      },
      {
        id: 'rec-fb-2',
        name: 'Full Body B',
        exercises: [
          { id: '1', name: 'Deadlift', sets: createSets(3, 5) },
          { id: '2', name: 'Pull-ups', sets: createSets(3, 10) },
          { id: '3', name: 'Incline Dumbbell Press', sets: createSets(3, 10) },
          { id: '4', name: 'Leg Press', sets: createSets(3, 12) },
          { id: '5', name: 'Lateral Raises', sets: createSets(3, 15) }
        ]
      },
      {
        id: 'rec-fb-3',
        name: 'Full Body C',
        exercises: [
          { id: '1', name: 'Bulgarian Split Squats', sets: createSets(3, 10) },
          { id: '2', name: 'Lat Pulldown', sets: createSets(3, 10) },
          { id: '3', name: 'Push-ups', sets: createSets(3, 15) },
          { id: '4', name: 'Face Pulls', sets: createSets(3, 15) },
          { id: '5', name: 'Calf Raises', sets: createSets(4, 20) }
        ]
      }
    ]
  }
];

interface WorkoutLoggerProps {
  setActiveTab?: (tab: string) => void;
}

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ setActiveTab }) => {
  const { customPresets, saveCustomPreset, deleteCustomPreset, logWorkout, activeWorkout, activeExercises: exercises, startWorkout: handleStartWorkout, abortWorkout, togglePauseWorkout, setActiveExercises: setExercises, workoutHistory, customExercises, saveCustomExercise, getMacrosForDate, scheduledWorkoutDays, editingWorkout, setEditingWorkout, updateWorkout } = useUser();
  const [showCelebration, setShowCelebration] = useState(false);
  const isFinishingRef = useRef(false);
  const [finalDuration, setFinalDuration] = useState<string>('');
  const [lastCompletedSetTime, setLastCompletedSetTime] = useState(0);

  const [viewDate, setViewDate] = useState(getLocalDateString());
  const [showCalendar, setShowCalendar] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const shiftDate = (days: number) => {
    const d = new Date(viewDate + 'T12:00:00');
    d.setDate(d.getDate() + days);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const newDate = new Date(d);
    newDate.setHours(0,0,0,0);
    if (newDate <= today) {
      setViewDate(newDate.toISOString().split('T')[0]);
    }
  };

  const todayStr = getLocalDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let displayDateStr = '';
  if (viewDate === todayStr) displayDateStr = 'Today';
  else if (viewDate === yesterdayStr) displayDateStr = 'Yesterday';
  else {
    const d = new Date(viewDate + 'T12:00:00');
    displayDateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  // Custom Preset Creator State
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetExercises, setNewPresetExercises] = useState<ActiveExercise[]>(() => [
    { 
      id: String(Date.now()), 
      name: '', 
      sets: [{ id: String(Date.now() + 1), reps: 0, weight: 0, type: 'Normal', completed: false }] 
    }
  ]);

  // History Edit State
  const [editExercises, setEditExercises] = useState<ActiveExercise[]>([]);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const isEditingRef = useRef(false);

  React.useEffect(() => {
    if (editingWorkout && !isEditingRef.current) {
      setEditName(editingWorkout.name);
      setEditDate(editingWorkout.date.split('T')[0]);
      setEditDuration(editingWorkout.durationMinutes.toString());
      setEditExercises(JSON.parse(JSON.stringify(editingWorkout.exercises))); // Deep copy
      isEditingRef.current = true;
    }
  }, [editingWorkout]);

  // Exercise Library Selection State
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [librarySearchTerm, setLibrarySearchTerm] = useState('');
  const [targetIndexForLibrary, setTargetIndexForLibrary] = useState<number | null>(null);
  const [targetListForLibrary, setTargetListForLibrary] = useState<'preset' | 'active' | 'edit'>('active');

  const openLibrary = (index: number, target: 'preset' | 'active' | 'edit') => {
    setTargetIndexForLibrary(index);
    setTargetListForLibrary(target);
    setIsLibraryOpen(true);
  };

  const handleAddPresetExercise = () => {
    const newIdx = newPresetExercises.length;
    setNewPresetExercises([...newPresetExercises, { id: String(Date.now()), name: '', sets: [{ id: String(Date.now() + 1), reps: 0, weight: 0, type: 'Normal', completed: false }] }]);
    openLibrary(newIdx, 'preset');
  };

  const handleAddActiveExercise = () => {
    const newIdx = exercises.length;
    setExercises([...exercises, { id: String(Date.now()), name: '', sets: [{ id: String(Date.now() + 1), reps: 0, weight: 0, type: 'Normal', completed: false }] }]);
    openLibrary(newIdx, 'active');
  };

  const handleSelectExercise = (exerciseName: string) => {
    if (targetIndexForLibrary !== null) {
      if (targetListForLibrary === 'preset') {
        const newEx = [...newPresetExercises];
        newEx[targetIndexForLibrary].name = exerciseName;
        setNewPresetExercises(newEx);
      } else if (targetListForLibrary === 'edit') {
        const newEx = [...editExercises];
        newEx[targetIndexForLibrary].name = exerciseName;
        setEditExercises(newEx);
      } else {
        const newEx = [...exercises];
        newEx[targetIndexForLibrary].name = exerciseName;
        setExercises(newEx);
      }
    }
    setIsLibraryOpen(false);
    setLibrarySearchTerm('');
  };

  const allExercises = [...exerciseLibrary, ...customExercises];
  const filteredLibrary = allExercises.filter(ex => 
    ex.name.toLowerCase().includes(librarySearchTerm.toLowerCase()) ||
    ex.muscleGroup.toLowerCase().includes(librarySearchTerm.toLowerCase())
  );

  const renderLibraryModal = () => (
    <AnimatePresence>
      {isLibraryOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-tactical-900/90 backdrop-blur-md p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-tactical-800 border border-tactical-600 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="p-6 border-b border-tactical-700 flex justify-between items-center bg-tactical-900">
              <div>
                <h2 className="esports-heading text-2xl text-white">Exercise Library</h2>
                <p className="text-gray-400 font-inter text-sm mt-1">Select an exercise to add to your plan.</p>
              </div>
              <button 
                onClick={() => setIsLibraryOpen(false)}
                className="text-gray-500 hover:text-white transition-colors bg-tactical-800 p-2 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-tactical-700 bg-tactical-800">
              <input 
                type="text" 
                placeholder="Search by name or muscle group (e.g., 'Chest', 'Squat')..." 
                value={librarySearchTerm}
                onChange={(e) => setLibrarySearchTerm(e.target.value)}
                className="w-full bg-tactical-900 border border-tactical-600 rounded-lg p-3 text-white focus:outline-none focus:border-neon-blue transition-colors font-inter"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredLibrary.map(exercise => (
                  <button 
                    key={exercise.id}
                    onClick={() => handleSelectExercise(exercise.name)}
                    className="group relative rounded-xl overflow-hidden aspect-square border border-tactical-600 hover:border-neon-blue transition-all bg-tactical-900 text-left flex flex-col"
                  >
                    <div className="flex-1 w-full bg-tactical-800 relative overflow-hidden">
                      {exercise.imagePath ? (
                        <img 
                          src={exercise.imagePath} 
                          alt={exercise.name} 
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-tactical-800 group-hover:bg-tactical-700 transition-colors">
                          <Dumbbell className="w-12 h-12 text-gray-600 group-hover:text-neon-blue transition-colors" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-tactical-900 via-tactical-900/50 to-transparent" />
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-rajdhani font-bold uppercase tracking-wider mb-1 bg-tactical-700 text-neon-blue">
                        {exercise.muscleGroup}
                      </span>
                      <h4 className="text-white font-rajdhani font-bold leading-tight group-hover:text-neon-blue transition-colors text-sm sm:text-base">
                        {exercise.name}
                      </h4>
                    </div>
                  </button>
                ))}
                
                {filteredLibrary.length === 0 && (
                  <div className="col-span-full py-12 text-center flex flex-col items-center">
                    <p className="text-gray-500 font-inter mb-4">No exercises found matching "{librarySearchTerm}".</p>
                    {librarySearchTerm && (
                      <button 
                        onClick={() => {
                          const newEx = { id: `custom-${Date.now()}`, name: librarySearchTerm, muscleGroup: 'Full Body' as const };
                          saveCustomExercise(newEx);
                          handleSelectExercise(newEx.name);
                        }}
                        className="bg-tactical-800 border border-tactical-600 text-white px-4 py-2 rounded-lg font-rajdhani uppercase font-bold hover:bg-tactical-700 hover:text-neon-blue transition-colors flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Create "{librarySearchTerm}"
                      </button>
                    )}
                  </div>
                )}
                {filteredLibrary.length > 0 && librarySearchTerm && !filteredLibrary.some(ex => ex.name.toLowerCase() === librarySearchTerm.toLowerCase()) && (
                  <div className="col-span-full mt-4 flex justify-center">
                    <button 
                      onClick={() => {
                        const newEx = { id: `custom-${Date.now()}`, name: librarySearchTerm, muscleGroup: 'Full Body' as const };
                        saveCustomExercise(newEx);
                        handleSelectExercise(newEx.name);
                      }}
                      className="bg-tactical-800 border border-tactical-600 text-gray-400 px-4 py-2 rounded-lg font-rajdhani uppercase font-bold hover:bg-tactical-700 hover:text-neon-blue transition-colors flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Create "{librarySearchTerm}"
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );


  const handleFinishWorkout = () => {
    if (!activeWorkout) return;
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;
    
    // Calculate volume
    let totalVolume = 0;
    exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed) {
          totalVolume += (set.weight || 0) * (set.reps || 0);
        }
      });
    });

    const totalPause = activeWorkout.accumulatedPauseMs || 0;
    const finalPauseMs = activeWorkout.paused && activeWorkout.lastPauseTime 
      ? totalPause + (Date.now() - activeWorkout.lastPauseTime) 
      : totalPause;
      
    const durationMs = (Date.now() - activeWorkout.startTime) - finalPauseMs;
    const durationMinutes = Math.max(1, Math.floor(durationMs / 60000));
    
    const h = Math.floor(durationMs / 3600000);
    const m = Math.floor((durationMs % 3600000) / 60000);
    const s = Math.floor((durationMs % 60000) / 1000);
    let fDuration = '';
    if (h > 0) fDuration = `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    else fDuration = `${m}:${s.toString().padStart(2, '0')}`;
    setFinalDuration(fDuration);


    // Grading Algorithm
    let grade: 'S+' | 'S' | 'A' | 'B' | 'C' = 'A';
    let isPr = false;

    const completedExercises = exercises.filter(ex => ex.sets.some(s => s.completed));
    if (durationMinutes < 15 && completedExercises.length < 3) {
      grade = 'C';
    } else if (durationMinutes < 30 && completedExercises.length < 4) {
      grade = 'B';
    } else {
      grade = 'A';
    }

    // Historical Averages calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentWorkouts = workoutHistory.filter(w => new Date(w.date) >= thirtyDaysAgo);

    let targetVolume = 0;
    exercises.forEach(ex => {
      let totalExVolume = 0;
      let count = 0;
      let maxWeight = 0;
      let maxReps = 0;

      recentWorkouts.forEach(w => {
        const histEx = w.exercises?.find(e => e.name === ex.name);
        if (histEx) {
          count++;
          histEx.sets.forEach(s => {
            if (s.completed) {
              totalExVolume += (s.weight || 0) * (s.reps || 0);
              if ((s.weight || 0) > maxWeight) maxWeight = s.weight || 0;
              if ((s.reps || 0) > maxReps) maxReps = s.reps || 0;
            }
          });
        }
      });

      if (count > 0) {
        targetVolume += (totalExVolume / count);
      }

      // Check PRs
      ex.sets.forEach(s => {
        if (s.completed) {
          if ((s.weight || 0) > maxWeight && (s.weight || 0) > 0) isPr = true;
          if ((s.weight || 0) === maxWeight && (s.reps || 0) > maxReps && (s.weight || 0) > 0) isPr = true;
        }
      });
    });

    if (grade === 'A') {
      if (targetVolume > 0 && totalVolume >= targetVolume * 0.9) {
        grade = 'S';
      } else if (completedExercises.length >= 4) {
        grade = 'S';
      }
    }

    if (grade === 'S' || grade === 'A') {
      const macros = getMacrosForDate(viewDate);
      const nutritionSynergy = macros.protein.current >= macros.protein.target && macros.calories.current <= macros.calories.target;
      
      if (isPr || (targetVolume > 0 && totalVolume > targetVolume * 1.05) || nutritionSynergy) {
        grade = 'S+';
      }
    }

    let baseEp = 20;
    if (grade === 'S+') baseEp = 50;
    else if (grade === 'S') baseEp = 35;
    else if (grade === 'A') baseEp = 25;
    else if (grade === 'B') baseEp = 15;
    else if (grade === 'C') baseEp = 10;

    const workoutNameLower = activeWorkout.name.toLowerCase();
    if (workoutNameLower.includes('leg') || workoutNameLower.includes('lower body')) {
      baseEp += 10;
    }
    
    // Check for streak bonus
    const currentStreak = calculateStreak(workoutHistory, scheduledWorkoutDays);
    if (currentStreak >= 20) {
      baseEp += 10;
    }
    
    const calculatedEp = baseEp;

    logWorkout({
      id: `log-${Date.now()}`,
      date: viewDate === getLocalDateString() ? new Date().toISOString() : new Date(viewDate + 'T12:00:00').toISOString(),
      name: activeWorkout.name,
      durationMinutes,
      exercises: exercises,
      volume: totalVolume,
      grade,
      epChange: calculatedEp,
      isPr
    });
    
    setShowCelebration(true);
  };

  const closeCelebration = () => {
    setShowCelebration(false);
    isFinishingRef.current = false;
    abortWorkout();
  };

  const saveNewPreset = () => {
    if (!newPresetName) return;
    const newPreset: WorkoutPreset = {
      id: editingPresetId || `custom-${Date.now()}`,
      name: newPresetName,
      exercises: newPresetExercises
    };
    saveCustomPreset(newPreset);
    setIsCreatingPreset(false);
    setEditingPresetId(null);
    setNewPresetName('');
    setNewPresetExercises([{ 
      id: String(Date.now()), 
      name: '', 
      sets: [{ id: String(Date.now() + 1), reps: 0, weight: 0, type: 'Normal', completed: false }] 
    }]);
  };

  const editPreset = (preset: WorkoutPreset) => {
    setEditingPresetId(preset.id);
    setNewPresetName(preset.name);
    setNewPresetExercises(preset.exercises);
    setIsCreatingPreset(true);
  };

  const getPreviousSetData = (exerciseName: string, setIndex: number) => {
    if (!exerciseName || !workoutHistory) return null;
    const reversedHistory = [...workoutHistory].reverse();
    for (const log of reversedHistory) {
      const ex = log.exercises.find((e: ActiveExercise) => e.name.toLowerCase() === exerciseName.toLowerCase());
      if (ex && ex.sets[setIndex]) {
        return ex.sets[setIndex];
      }
    }
    return null;
  };



  const renderExerciseTable = (
    exerciseList: ActiveExercise[],
    setExerciseList: (list: ActiveExercise[]) => void,
    isPreset: boolean
  ) => {
    return (
      <Reorder.Group 
        axis="y" 
        values={exerciseList} 
        onReorder={setExerciseList} 
        className="space-y-4"
      >
        {exerciseList.map((exercise, exIndex) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            exIndex={exIndex}
            isPreset={isPreset}
            exerciseList={exerciseList}
            setExerciseList={setExerciseList}
            openLibrary={openLibrary}
            getPreviousSetData={getPreviousSetData}
            setLastCompletedSetTime={isPreset ? undefined : setLastCompletedSetTime}
          />
        ))}
      </Reorder.Group>
    );
  };

  if (isCreatingPreset) {
    return (
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 fade-in pb-24 mt-6">
        <div className="flex justify-between items-start mb-6 border-b border-tactical-700 pb-4">
            <div className="flex-1 mr-4">
              <input 
                type="text" 
                placeholder="Workout Name..." 
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="w-full bg-transparent border-none p-0 text-white focus:outline-none focus:ring-0 text-3xl font-rajdhani font-bold placeholder-tactical-600"
              />
              <p className="text-gray-400 text-sm mt-2">Design your own blueprint for combat.</p>
            </div>
            <button 
              onClick={() => {
                setIsCreatingPreset(false);
                setEditingPresetId(null);
              }}
              className="text-gray-400 hover:text-white transition-colors flex items-center mt-2 whitespace-nowrap"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </button>
          </div>

          <div className="space-y-4">
            {renderExerciseTable(newPresetExercises, setNewPresetExercises, true)}
          </div>

          <button 
            onClick={handleAddPresetExercise}
            className="mt-6 w-full bg-neon-green text-tactical-900 py-2.5 rounded-full font-rajdhani font-bold text-base hover:brightness-110 transition-all shadow-[0_0_15px_rgba(57,255,20,0.4)] uppercase tracking-wider flex items-center justify-center"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Exercise
          </button>

          <div className="mt-4">
            <button 
              onClick={saveNewPreset}
              disabled={!newPresetName || newPresetExercises.some(e => !e.name)}
              className="w-full bg-neon-gold text-tactical-900 py-2.5 rounded-full font-rajdhani font-bold text-base hover:brightness-110 transition-all shadow-[0_0_15px_rgba(255,215,0,0.4)] uppercase tracking-wider flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5 mr-2" /> Save Preset
            </button>
          </div>
          {renderLibraryModal()}
      </div>
    );
  }

  const handleUpdateWorkout = () => {
    if (!editingWorkout) return;

    let totalVolume = 0;
    editExercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed) {
          totalVolume += (set.weight || 0) * (set.reps || 0);
        }
      });
    });

    // We keep the old grade and EP changes since recalculating it requires complex logic with historical averages
    // Actually, the user might want volume to just recalculate, EP isn't purely volume dependent.
    // Let's just update the workout object
    const updatedLog: WorkoutLog = {
      ...editingWorkout,
      name: editName,
      date: new Date(editDate + 'T12:00:00').toISOString(),
      durationMinutes: parseInt(editDuration) || editingWorkout.durationMinutes,
      exercises: editExercises,
      volume: totalVolume
    };

    updateWorkout(updatedLog);
    setEditingWorkout(null);
    isEditingRef.current = false;
    if (setActiveTab) {
      setActiveTab('history');
    }
  };

  if (editingWorkout) {
    return (
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 fade-in pb-24 mt-6">
        <div className="flex flex-col mb-6 border-b border-tactical-700 pb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 mr-4">
                <input 
                  type="text" 
                  placeholder="Workout Name..." 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-white focus:outline-none focus:ring-0 text-3xl font-rajdhani font-bold placeholder-tactical-600"
                />
                <div className="flex items-center gap-4 mt-2">
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="bg-tactical-800 border border-tactical-600 rounded p-1 text-sm text-gray-300"
                  />
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      value={editDuration}
                      onChange={(e) => setEditDuration(e.target.value)}
                      className="bg-tactical-800 border border-tactical-600 rounded p-1 text-sm text-gray-300 w-16"
                    />
                    <span className="text-gray-500 text-sm">min</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setEditingWorkout(null);
                  isEditingRef.current = false;
                  if (setActiveTab) {
                    setActiveTab('history');
                  }
                }}
                className="text-gray-400 hover:text-white transition-colors flex items-center mt-2 whitespace-nowrap"
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Cancel
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {renderExerciseTable(editExercises, setEditExercises, false)}
          </div>

          <button 
            onClick={() => {
              const newIdx = editExercises.length;
              setEditExercises([...editExercises, { id: String(Date.now()), name: '', sets: [{ id: String(Date.now() + 1), reps: 0, weight: 0, type: 'Normal', completed: false }] }]);
              openLibrary(newIdx, 'edit');
            }}
            className="mt-6 w-full bg-neon-green text-tactical-900 py-2.5 rounded-full font-rajdhani font-bold text-base hover:brightness-110 transition-all shadow-[0_0_15px_rgba(57,255,20,0.4)] uppercase tracking-wider flex items-center justify-center"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Exercise
          </button>

          <div className="mt-4">
            <button 
              onClick={handleUpdateWorkout}
              disabled={!editName || editExercises.some(e => !e.name)}
              className="w-full bg-neon-blue text-tactical-900 py-2.5 rounded-full font-rajdhani font-bold text-base hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,255,255,0.4)] uppercase tracking-wider flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5 mr-2" /> Update Past Workout
            </button>
          </div>
          {renderLibraryModal()}
      </div>
    );
  }

  if (!activeWorkout) {
    return (
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 fade-in pb-24 mt-4">
        
        {/* Date Navigator */}
        <div className="flex items-center justify-between bg-tactical-900 border-b border-tactical-700 p-4 -mx-2 sm:-mx-4 mb-6 relative z-10">
          <button onClick={() => shiftDate(-1)} className="p-2 hover:bg-tactical-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div 
            className="text-center cursor-pointer group flex flex-col items-center justify-center"
            onClick={() => setShowCalendar(true)}
          >
            <div className="flex items-center gap-2">
              <h1 className="font-rajdhani font-bold text-2xl text-white tracking-widest uppercase group-hover:text-neon-blue transition-colors">
                {displayDateStr}
              </h1>
              <Calendar className="w-4 h-4 text-gray-500 group-hover:text-neon-blue transition-colors" />
            </div>
            <p className="text-gray-400 text-xs">Log for this date.</p>
          </div>
          <button 
            onClick={() => shiftDate(1)} 
            disabled={viewDate === getLocalDateString()}
            className={clsx("p-2 rounded-full transition-colors", viewDate === getLocalDateString() ? "text-tactical-700 cursor-not-allowed" : "hover:bg-tactical-800 text-gray-400 hover:text-white")}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {showCalendar && (
          <CalendarModal
            onClose={() => setShowCalendar(false)}
            selectedDate={viewDate}
            onSelectDate={(date) => {
              const selected = new Date(date + 'T12:00:00');
              const today = new Date();
              today.setHours(0,0,0,0);
              if (selected <= today) {
                setViewDate(date);
              }
              setShowCalendar(false);
            }}
          />
        )}

        <div className="flex flex-col items-center mb-8 gap-4">
          <h1 className="esports-heading text-2xl sm:text-3xl text-white text-center">Workout Library</h1>
          <button 
            onClick={() => handleStartWorkout(null)}
            className="bg-neon-blue text-tactical-900 px-4 py-2 rounded font-rajdhani font-bold uppercase tracking-wider hover:bg-[#00d0dd] transition-colors text-sm sm:text-base w-full sm:w-auto text-center"
          >
            Empty Workout
          </button>
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-rajdhani font-bold text-neon-gold uppercase tracking-wider flex items-center">
              <Save className="w-5 h-5 mr-2" /> My Presets
            </h2>
            <button 
              onClick={() => {
                setEditingPresetId(null);
                setNewPresetName('');
                setNewPresetExercises([{ 
      id: String(Date.now()), 
      name: '', 
      sets: [{ id: String(Date.now() + 1), reps: 0, weight: 0, type: 'Normal', completed: false }] 
    }]);
                setIsCreatingPreset(true);
              }}
              className="text-neon-gold hover:text-[#ffdf00] text-sm font-bold uppercase flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" /> New Preset
            </button>
          </div>
          
          {customPresets.length === 0 ? (
            <div className="bg-tactical-900 border border-dashed border-tactical-700 rounded-xl p-8 text-center">
              <p className="text-gray-500 font-inter">No custom presets yet. Create your own battle plans to see them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customPresets.map(preset => (
                <div key={preset.id} className="relative overflow-hidden rounded-xl group">
                  {/* Delete Background */}
                  <div className="absolute inset-y-0 right-0 w-24 bg-neon-red flex items-center justify-center rounded-xl">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomPreset(preset.id);
                      }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <Trash2 className="w-6 h-6 text-tactical-900" />
                    </button>
                  </div>

                  {/* Swipeable Foreground */}
                  <motion.div 
                    drag="x"
                    dragConstraints={{ left: -96, right: 0 }}
                    dragElastic={0.1}
                    dragDirectionLock
                    onClick={() => editPreset(preset)}
                    className="relative z-10 bg-tactical-900 border border-tactical-700 rounded-xl p-5 hover:border-neon-gold transition-colors group cursor-pointer h-full flex flex-col"
                  >
                    <h3 className="font-rajdhani font-bold text-xl text-white mb-2">{preset.name}</h3>
                    <p className="text-xs text-gray-400 font-inter mb-4 flex-1">{preset.exercises.length} Exercises</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartWorkout(preset);
                      }}
                      className="w-full bg-tactical-800 text-gray-300 border border-tactical-600 py-2 rounded font-rajdhani font-bold uppercase tracking-wider group-hover:bg-neon-gold group-hover:text-tactical-900 group-hover:border-neon-gold transition-all flex items-center justify-center mt-auto"
                    >
                      <Play className="w-4 h-4 mr-2" /> Start
                    </button>
                  </motion.div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-rajdhani font-bold text-neon-blue uppercase tracking-wider mb-4 flex items-center">
            <Dumbbell className="w-5 h-5 mr-2" /> Recommended For You
          </h2>
          <div className="space-y-4">
            {RECOMMENDED_WORKOUT_CATEGORIES.map(category => {
              const isExpanded = expandedCategory === category.id;
              
              return (
                <div key={category.id} className="bg-tactical-900 border border-tactical-700 rounded-xl overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                    className="w-full p-5 flex items-center justify-between hover:bg-tactical-800 transition-colors text-left"
                  >
                    <div>
                      <h3 className="font-rajdhani font-bold text-xl text-white">{category.title}</h3>
                      <p className="text-sm text-gray-400 font-inter mt-1">{category.description}</p>
                    </div>
                    <div className="text-neon-blue ml-4 flex-shrink-0">
                      {isExpanded ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="p-5 border-t border-tactical-700 bg-tactical-900/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {category.workouts.map(preset => (
                              <div key={preset.id} className="bg-tactical-800 border border-neon-blue/30 rounded-xl p-5 hover:border-neon-blue transition-colors group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-neon-blue/10 rounded-bl-full -mr-8 -mt-8 group-hover:bg-neon-blue/20 transition-colors" />
                                <h4 className="font-rajdhani font-bold text-lg text-white mb-2 relative z-10">{preset.name}</h4>
                                <p className="text-xs text-gray-400 font-inter mb-4 relative z-10">{preset.exercises.length} Exercises</p>
                                <div className="space-y-1 mb-6 relative z-10 text-sm text-gray-400">
                                  {preset.exercises.slice(0, 3).map(ex => (
                                    <div key={ex.id}>• {ex.name}</div>
                                  ))}
                                  {preset.exercises.length > 3 && <div>• +{preset.exercises.length - 3} more</div>}
                                </div>
                                <button 
                                  onClick={() => handleStartWorkout(preset)}
                                  className="w-full bg-neon-blue/10 text-neon-blue border border-neon-blue/50 py-2 rounded font-rajdhani font-bold uppercase tracking-wider group-hover:bg-neon-blue group-hover:text-tactical-900 transition-all flex items-center justify-center relative z-10"
                                >
                                  <Play className="w-4 h-4 mr-2" /> Start
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const portalTarget = document.getElementById('global-header-actions');

  return (
    <div className="w-full relative">
      <div className="w-full max-w-7xl mx-auto px-0 sm:px-2 fade-in relative">
      {portalTarget && createPortal(
        <button 
          onClick={handleFinishWorkout}
          className="bg-neon-blue text-tactical-900 px-4 py-1.5 rounded font-rajdhani font-bold hover:bg-[#00d0dd] transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)] uppercase tracking-wider text-sm mr-2"
        >
          Finish
        </button>,
        portalTarget
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-tactical-700 pb-4">
        <div>
          <h1 className="esports-heading text-2xl text-white">{activeWorkout.name}</h1>
          <p className="text-neon-blue font-bold text-sm mt-1 flex items-center">
            {activeWorkout.paused ? (
              <span className="w-2 h-2 rounded-full bg-neon-gold mr-2"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse mr-2"></span> 
            )}
            {activeWorkout.paused ? 'PAUSED' : 'ACTIVE WORKOUT'}
            {activeWorkout.startTime && (
              <span className="ml-2">
                <LiveWorkoutTimer 
                  startTime={activeWorkout.startTime} 
                  paused={activeWorkout.paused}
                  accumulatedPauseMs={activeWorkout.accumulatedPauseMs}
                  lastPauseTime={activeWorkout.lastPauseTime}
                />
              </span>
            )}
            <button 
              onClick={togglePauseWorkout}
              className="ml-3 p-1 bg-tactical-800 hover:bg-tactical-700 rounded-full transition-colors border border-tactical-600"
            >
              {activeWorkout.paused ? <Play className="w-3.5 h-3.5 text-neon-green" /> : <Pause className="w-3.5 h-3.5 text-neon-gold" />}
            </button>
          </p>
        </div>
      </div>

      <div className="space-y-6 mt-4">
          {renderExerciseTable(exercises, setExercises, false)}
        </div>

        <button 
          onClick={handleAddActiveExercise}
          className="mt-6 w-full bg-neon-green text-tactical-900 py-2.5 rounded-full font-rajdhani font-bold text-base hover:brightness-110 transition-all shadow-[0_0_15px_rgba(57,255,20,0.4)] uppercase tracking-wider flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Exercise
        </button>

        <div className="mt-6">
          <button 
            onClick={abortWorkout}
            className="w-full bg-neon-red text-white py-2.5 rounded-full font-rajdhani font-bold text-base hover:brightness-110 transition-all shadow-[0_0_15px_rgba(255,0,60,0.4)] uppercase tracking-wider flex items-center justify-center"
          >
            <X className="w-5 h-5 mr-2" /> Cancel Workout
          </button>
        </div>
      </div>

      <RestTimer lastCompletedSetTime={lastCompletedSetTime} />

      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-tactical-900/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="bg-tactical-800 border-2 border-neon-gold p-8 rounded-xl shadow-[0_0_50px_rgba(255,215,0,0.3)] max-w-md w-full text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iI2ZmZCIvPjwvc3ZnPg==')] opacity-20 animate-pulse pointer-events-none" />
              
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", damping: 10, delay: 0.2 }}
                className="w-24 h-24 mx-auto bg-neon-gold rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,215,0,0.6)]"
              >
                <Trophy className="w-12 h-12 text-tactical-900" />
              </motion.div>

              <h2 className="esports-heading text-2xl sm:text-3xl text-white mb-2 w-full text-center">Workout Summary</h2>
              <div className="inline-block bg-tactical-900 border border-tactical-600 rounded-full px-4 py-1 mb-6">
                <span className="text-neon-gold font-rajdhani font-bold text-xl">Rank: S+</span>
              </div>
              
              <p className="text-gray-300 font-inter mb-6">
                Incredible consistency! You completed <span className="text-neon-blue font-bold">{activeWorkout?.name || 'Workout'}</span>.
              </p>

              <div className="bg-tactical-900 p-4 rounded-lg border border-tactical-700 mb-3 flex justify-between items-center">
                <span className="text-gray-400 font-rajdhani uppercase">Duration</span>
                <span className="text-xl font-rajdhani font-bold text-white">{finalDuration}</span>
              </div>

              <div className="bg-tactical-900 p-4 rounded-lg border border-tactical-700 mb-8 flex justify-between items-center">
                <span className="text-gray-400 font-rajdhani uppercase">Evoke Points</span>
                <span className="text-2xl font-rajdhani font-bold text-neon-green">+18 EP</span>
              </div>

              <button 
                type="button"
                onClick={closeCelebration}
                className="relative z-10 w-full bg-white text-tactical-900 py-3 rounded font-rajdhani font-bold text-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Continue Grind
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {renderLibraryModal()}
    </div>
  );
};
