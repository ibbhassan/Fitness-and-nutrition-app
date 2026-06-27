import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { Plus, Play, Check, Save, X, Trash2, Trophy, Dumbbell, ArrowLeft, GripVertical } from 'lucide-react';
import { useUser } from '../context/UserContext';
import type { WorkoutPreset, LoggedSet, ActiveExercise } from '../types';
import { exerciseLibrary } from '../utils/exerciseLibrary';
import { RestTimer } from '../components/RestTimer';
import { clsx } from 'clsx';

const LiveWorkoutTimer: React.FC<{ startTime: number }> = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(Date.now() - startTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const totalSeconds = Math.floor(elapsed / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  let timeString = '';
  if (h > 0) {
    timeString = `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  } else {
    timeString = `${m}:${s.toString().padStart(2, '0')}`;
  }

  return <span className="ml-2 tabular-nums">{timeString}</span>;
};

export const WorkoutLogger: React.FC = () => {
  const { customPresets, saveCustomPreset, deleteCustomPreset, logWorkout, activeWorkout, activeExercises: exercises, startWorkout: handleStartWorkout, abortWorkout, setActiveExercises: setExercises, workoutHistory, customExercises, saveCustomExercise } = useUser();
  const [showCelebration, setShowCelebration] = useState(false);
  const [finalDuration, setFinalDuration] = useState<string>('');
  const [lastCompletedSetTime, setLastCompletedSetTime] = useState(0);
  // Custom Preset Creator State
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetExercises, setNewPresetExercises] = useState<ActiveExercise[]>([
    { 
      id: String(Date.now()), 
      name: '', 
      sets: [{ id: String(Date.now() + 1), reps: 0, weight: 0, type: 'Normal', completed: false }] 
    }
  ]);

  // Exercise Library Selection State
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [librarySearchTerm, setLibrarySearchTerm] = useState('');
  const [targetIndexForLibrary, setTargetIndexForLibrary] = useState<number | null>(null);
  const [targetListForLibrary, setTargetListForLibrary] = useState<'preset' | 'active'>('active');

  const openLibrary = (index: number, target: 'preset' | 'active') => {
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

  const getRecommendedPresets = (): WorkoutPreset[] => {
    const createSets = (numSets: number, reps: number): LoggedSet[] => {
      return Array.from({ length: numSets }).map((_, i) => ({
        id: `${Date.now()}-${i}`,
        reps: reps,
        weight: 0,
        type: 'Normal',
        completed: false
      }));
    };

    return [
      { 
        id: 'rec-1', 
        name: 'Push', 
        exercises: [
          { id: '1', name: 'Bench Press', sets: createSets(4, 8) }, 
          { id: '2', name: 'Overhead Press', sets: createSets(3, 10) }, 
          { id: '3', name: 'Tricep Extensions', sets: createSets(3, 12) }
        ] 
      },
      { 
        id: 'rec-2', 
        name: 'Pull', 
        exercises: [
          { id: '1', name: 'Barbell Row', sets: createSets(4, 8) }, 
          { id: '2', name: 'Pull-ups', sets: createSets(3, 10) }, 
          { id: '3', name: 'Bicep Curls', sets: createSets(3, 12) }
        ] 
      },
      { 
        id: 'rec-3', 
        name: 'Legs', 
        exercises: [
          { id: '1', name: 'Squat', sets: createSets(4, 8) }, 
          { id: '2', name: 'Leg Press', sets: createSets(3, 12) }, 
          { id: '3', name: 'Calf Raises', sets: createSets(4, 20) }
        ] 
      }
    ];
  };

  const handleFinishWorkout = () => {
    if (!activeWorkout) return;
    
    // Calculate volume
    let totalVolume = 0;
    exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed) {
          totalVolume += (set.weight || 0) * (set.reps || 0);
        }
      });
    });

    const durationMs = Date.now() - activeWorkout.startTime;
    const durationMinutes = Math.max(1, Math.round(durationMs / 60000));
    
    const h = Math.floor(durationMs / 3600000);
    const m = Math.floor((durationMs % 3600000) / 60000);
    const s = Math.floor((durationMs % 60000) / 1000);
    let fDuration = '';
    if (h > 0) fDuration = `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    else fDuration = `${m}:${s.toString().padStart(2, '0')}`;
    setFinalDuration(fDuration);

    logWorkout({
      id: `log-${Date.now()}`,
      date: new Date().toISOString(),
      name: activeWorkout.name,
      durationMinutes,
      exercises: exercises,
      volume: totalVolume,
      grade: 'S+',
      epChange: 18,
      isPr: true
    });
    
    setShowCelebration(true);
  };

  const closeCelebration = () => {
    setShowCelebration(false);
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
      className="bg-tactical-900 border border-tactical-700/50 rounded-lg p-2 sm:p-4 mb-4 relative"
    >
      <div className="flex justify-between items-center mb-3 px-1">
        <div className="flex items-center gap-2">
          <div 
            className="cursor-grab active:cursor-grabbing text-tactical-600 hover:text-white p-2 flex items-center justify-center -ml-2"
            onPointerDown={(e) => controls.start(e)}
            style={{ touchAction: "none" }}
          >
            <GripVertical className="w-6 h-6" />
          </div>
          <button 
            onClick={() => openLibrary(exIndex, isPreset ? 'preset' : 'active')}
            className="text-neon-blue hover:text-[#00f0ff] transition-colors font-rajdhani font-bold text-xl uppercase tracking-wider text-left"
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
          className="text-gray-500 hover:text-neon-red transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div>
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 text-[10px] sm:text-xs font-rajdhani uppercase text-gray-500 font-bold mb-2 px-1">
          <div className="col-span-2 sm:col-span-1 text-center">Set</div>
          <div className="col-span-3 sm:col-span-3 text-center hidden sm:block">Previous</div>
          <div className="col-span-3 sm:col-span-2 text-center">Lbs</div>
          <div className="col-span-3 sm:col-span-2 text-center">Reps</div>
          <div className="col-span-4 sm:col-span-4 text-center"></div>
        </div>

        <Reorder.Group 
          axis="y" 
          values={exercise.sets} 
          onReorder={(newSets) => {
            const newEx = [...exerciseList];
            newEx[exIndex].sets = newSets;
            setExerciseList(newEx);
          }}
          className="space-y-1"
        >
          {exercise.sets.map((set, setIndex) => {
            const prevData = getPreviousSetData(exercise.name, setIndex);
            return (
              <Reorder.Item 
                key={set.id} 
                value={set}
                className={clsx(
                  "grid grid-cols-12 gap-1 sm:gap-2 items-center p-1 sm:p-2 rounded transition-colors",
                  set.completed ? "bg-neon-green/10" : "hover:bg-tactical-800"
                )}
              >
                {/* Set Number / Type Toggle */}
                <div className="col-span-2 sm:col-span-1 flex justify-center">
                  <button
                    onClick={() => cycleSetType(setIndex, set.type)}
                    className={clsx(
                      "w-6 h-6 sm:w-8 sm:h-8 rounded flex items-center justify-center font-rajdhani font-bold text-xs sm:text-sm transition-colors",
                      set.type === 'Warmup' ? "bg-neon-gold/20 text-neon-gold border border-neon-gold/50" : 
                      set.type === 'Drop' ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/50" :
                      set.type === 'Failure' ? "bg-neon-red/20 text-neon-red border border-neon-red/50" : 
                      "bg-tactical-700 text-white"
                    )}
                  >
                    {set.type === 'Warmup' ? 'W' : set.type === 'Drop' ? 'D' : set.type === 'Failure' ? 'F' : setIndex + 1}
                  </button>
                </div>
                
                {/* Previous Data */}
                <div className="col-span-3 sm:col-span-3 text-center hidden sm:flex items-center justify-center">
                  <span className="text-gray-500 font-inter text-xs">
                    {prevData ? `${prevData.weight} x ${prevData.reps}` : '-'}
                  </span>
                </div>

                {/* Weight */}
                <div className="col-span-3 sm:col-span-2">
                  <input 
                    type="number" 
                    value={set.weight || ''}
                    onChange={(e) => updateSet(setIndex, 'weight', e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                    className="w-full bg-tactical-800 border border-tactical-600 rounded p-1 sm:p-2 text-white text-center focus:outline-none focus:border-neon-blue font-inter text-sm"
                    placeholder="0"
                  />
                </div>

                {/* Reps */}
                <div className="col-span-3 sm:col-span-2">
                  <input 
                    type="number" 
                    value={set.reps || ''}
                    onChange={(e) => updateSet(setIndex, 'reps', e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                    className="w-full bg-tactical-800 border border-tactical-600 rounded p-1 sm:p-2 text-white text-center focus:outline-none focus:border-neon-blue font-inter text-sm"
                    placeholder="0"
                  />
                </div>

                {/* Actions */}
                <div className="col-span-4 sm:col-span-4 flex justify-end sm:justify-center items-center gap-1 sm:gap-2">
                  {!isPreset && (
                    <button 
                      onClick={() => toggleSetComplete(setIndex)}
                      className={clsx(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded flex items-center justify-center transition-all",
                        set.completed 
                          ? "bg-neon-green text-tactical-900 shadow-[0_0_10px_rgba(0,255,100,0.5)]" 
                          : "bg-tactical-800 border border-tactical-600 text-transparent hover:border-neon-green"
                      )}
                    >
                      <Check className={clsx("w-4 h-4 sm:w-5 sm:h-5", set.completed ? "text-tactical-900" : "hidden")} />
                    </button>
                  )}
                  <button
                    onClick={() => removeSet(setIndex)}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-tactical-800 hover:bg-tactical-700 hover:text-neon-red rounded flex items-center justify-center text-gray-500 transition-colors"
                    title="Delete Set"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="cursor-grab active:cursor-grabbing text-tactical-600 hover:text-gray-400 p-1 flex items-center justify-center">
                    <GripVertical className="w-5 h-5" />
                  </div>
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
        
        <button
          onClick={addSet}
          className="mt-2 w-full py-2 text-gray-400 hover:text-white bg-tactical-800 hover:bg-tactical-700 rounded transition-colors font-rajdhani font-bold text-sm uppercase flex justify-center items-center"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Set
        </button>
      </div>
    </Reorder.Item>
  );
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

  if (!activeWorkout) {
    return (
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 fade-in">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getRecommendedPresets().map(preset => (
              <div key={preset.id} className="bg-tactical-900 border border-neon-blue/30 rounded-xl p-5 hover:border-neon-blue transition-colors group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-neon-blue/10 rounded-bl-full -mr-8 -mt-8 group-hover:bg-neon-blue/20 transition-colors" />
                <h3 className="font-rajdhani font-bold text-xl text-white mb-2 relative z-10">{preset.name}</h3>
                <p className="text-xs text-gray-400 font-inter mb-4 relative z-10">{preset.exercises.length} Exercises</p>
                <div className="space-y-1 mb-6 relative z-10 text-sm text-gray-500">
                  {preset.exercises.slice(0, 3).map(ex => (
                    <div key={ex.id}>• {ex.name}</div>
                  ))}
                  {preset.exercises.length > 3 && <div>• +{preset.exercises.length - 3} more</div>}
                </div>
                <button 
                  onClick={() => handleStartWorkout(preset)}
                  className="w-full bg-neon-blue/10 text-neon-blue border border-neon-blue/50 py-2 rounded font-rajdhani font-bold uppercase tracking-wider group-hover:bg-neon-blue group-hover:text-tactical-900 transition-all flex items-center justify-center relative z-10"
                >
                  <Play className="w-4 h-4 mr-2" /> Start Preset
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const portalTarget = document.getElementById('global-header-actions');

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0c] overflow-y-auto pt-[72px] pb-24">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 fade-in relative">
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
            <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse mr-2"></span> 
            ACTIVE WORKOUT
            {activeWorkout.startTime && (
              <LiveWorkoutTimer startTime={activeWorkout.startTime} />
            )}
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
