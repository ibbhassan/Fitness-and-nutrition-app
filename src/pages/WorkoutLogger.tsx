import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, Check, Save, X, Trash2, Trophy, Dumbbell, ArrowLeft } from 'lucide-react';
import { useUser } from '../context/UserContext';
import type { WorkoutPreset, LoggedSet, PresetExercise } from '../types';
import { exerciseLibrary } from '../utils/exerciseLibrary';
import { RestTimer } from '../components/RestTimer';
import { clsx } from 'clsx';

export const WorkoutLogger: React.FC = () => {
  const { customPresets, saveCustomPreset, logWorkout, activeWorkout, activeExercises: exercises, startWorkout: handleStartWorkout, abortWorkout, setActiveExercises: setExercises } = useUser();
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastCompletedSetTime, setLastCompletedSetTime] = useState(0);
  // Custom Preset Creator State
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetExercises, setNewPresetExercises] = useState<PresetExercise[]>([
    { id: Date.now(), name: '', sets: '', reps: '' }
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

  const filteredLibrary = exerciseLibrary.filter(ex => 
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
                  <div className="col-span-full py-12 text-center text-gray-500 font-inter">
                    No exercises found matching "{librarySearchTerm}".
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
    return [
      { id: 'rec-1', name: 'Push', exercises: [{ id: 1, name: 'Bench Press', sets: '4', reps: '5-8' }, { id: 2, name: 'Overhead Press', sets: '3', reps: '8-10' }, { id: 3, name: 'Tricep Extensions', sets: '3', reps: '10-12' }] },
      { id: 'rec-2', name: 'Pull', exercises: [{ id: 1, name: 'Barbell Row', sets: '4', reps: '5-8' }, { id: 2, name: 'Pull-ups', sets: '3', reps: '8-10' }, { id: 3, name: 'Bicep Curls', sets: '3', reps: '10-12' }] },
      { id: 'rec-3', name: 'Legs', exercises: [{ id: 1, name: 'Squat', sets: '4', reps: '5-8' }, { id: 2, name: 'Leg Press', sets: '3', reps: '10-12' }, { id: 3, name: 'Calf Raises', sets: '4', reps: '15-20' }] }
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

    logWorkout({
      id: `log-${Date.now()}`,
      date: new Date().toISOString(),
      name: activeWorkout.name,
      durationMinutes: 45, // Hardcoded for now
      exercises: exercises,
      volume: totalVolume
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
      id: `custom-${Date.now()}`,
      name: newPresetName,
      exercises: newPresetExercises
    };
    saveCustomPreset(newPreset);
    setIsCreatingPreset(false);
    setNewPresetName('');
    setNewPresetExercises([{ id: Date.now(), name: '', sets: '', reps: '' }]);
  };

  const toggleSetComplete = (exIndex: number, setIndex: number) => {
    const newEx = [...exercises];
    const isNowCompleted = !newEx[exIndex].sets[setIndex].completed;
    newEx[exIndex].sets[setIndex].completed = isNowCompleted;
    setExercises(newEx);

    if (isNowCompleted) {
      setLastCompletedSetTime(Date.now());
    }
  };

  const addSetToExercise = (exIndex: number) => {
    const newEx = [...exercises];
    newEx[exIndex].sets.push({
      id: String(Date.now()),
      reps: 0,
      weight: 0,
      type: 'Normal',
      completed: false
    });
    setExercises(newEx);
  };

  const removeSetFromExercise = (exIndex: number, setIndex: number) => {
    const newEx = [...exercises];
    newEx[exIndex].sets.splice(setIndex, 1);
    setExercises(newEx);
  };

  const updateSet = (exIndex: number, setIndex: number, field: keyof LoggedSet, value: any) => {
    const newEx = [...exercises];
    newEx[exIndex].sets[setIndex] = { ...newEx[exIndex].sets[setIndex], [field]: value };
    setExercises(newEx);
  };

  if (isCreatingPreset) {
    return (
      <div className="max-w-3xl mx-auto fade-in">
        <div className="esports-panel p-6">
          <div className="flex justify-between items-center mb-6 border-b border-tactical-700 pb-4">
            <div>
              <h1 className="esports-heading text-2xl text-white">Create Custom Preset</h1>
              <p className="text-gray-400 text-sm mt-1">Design your own blueprint for combat.</p>
            </div>
            <button 
              onClick={() => setIsCreatingPreset(false)}
              className="text-gray-400 hover:text-white transition-colors flex items-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-xs text-gray-400 font-rajdhani uppercase mb-2">Preset Name</label>
            <input 
              type="text" 
              placeholder="e.g. Heavy Legs" 
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="w-full bg-tactical-800 border border-tactical-600 rounded p-3 text-white focus:outline-none focus:border-neon-gold focus:ring-1 focus:ring-neon-gold transition-all text-lg font-rajdhani font-bold"
            />
          </div>

          <div className="space-y-4">
            {newPresetExercises.map((exercise, index) => (
              <div key={exercise.id} className="bg-tactical-900 border border-tactical-700 p-4 rounded-lg flex flex-wrap gap-4 items-end relative">
                {newPresetExercises.length > 1 && (
                  <button 
                    onClick={() => setNewPresetExercises(newPresetExercises.filter(e => e.id !== exercise.id))}
                    className="absolute top-2 right-2 text-gray-500 hover:text-neon-red transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs text-gray-400 font-rajdhani uppercase mb-1">Exercise</label>
                  <button 
                    onClick={() => openLibrary(index, 'preset')}
                    className="w-full bg-tactical-800 border border-tactical-600 rounded p-2 text-white hover:border-neon-gold transition-colors text-left flex justify-between items-center"
                  >
                    <span>{exercise.name || 'Select Exercise...'}</span>
                  </button>
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-400 font-rajdhani uppercase mb-1">Sets</label>
                  <input 
                    type="text" 
                    value={exercise.sets}
                    onChange={(e) => {
                      const newEx = [...newPresetExercises];
                      newEx[index].sets = e.target.value;
                      setNewPresetExercises(newEx);
                    }}
                    placeholder="e.g. 4" 
                    className="w-full bg-tactical-800 border border-tactical-600 rounded p-2 text-white focus:outline-none focus:border-neon-gold"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-400 font-rajdhani uppercase mb-1">Reps</label>
                  <input 
                    type="text" 
                    value={exercise.reps}
                    onChange={(e) => {
                      const newEx = [...newPresetExercises];
                      newEx[index].reps = e.target.value;
                      setNewPresetExercises(newEx);
                    }}
                    placeholder="e.g. 8-12" 
                    className="w-full bg-tactical-800 border border-tactical-600 rounded p-2 text-white focus:outline-none focus:border-neon-gold"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => setNewPresetExercises([...newPresetExercises, { id: Date.now(), name: '', sets: '', reps: '' }])}
              className="flex-1 py-3 border-2 border-dashed border-tactical-600 rounded-lg text-gray-400 hover:text-neon-gold hover:border-neon-gold transition-colors font-rajdhani font-bold uppercase tracking-wider flex justify-center items-center"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Exercise
            </button>
            <div className="mt-6 pt-6 border-t border-tactical-700 flex justify-end">
              <button 
                onClick={saveNewPreset}
                disabled={!newPresetName || newPresetExercises.some(e => !e.name)}
                className="bg-neon-gold text-tactical-900 px-6 py-3 rounded-lg font-rajdhani font-bold uppercase hover:bg-[#ffc100] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Save className="w-5 h-5 mr-2" /> Save Preset
              </button>
            </div>
          </div>
          {renderLibraryModal()}
        </div>
      </div>
    );
  }

  if (!activeWorkout) {
    return (
      <div className="max-w-4xl mx-auto fade-in">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="esports-heading text-3xl text-white">The Armory</h1>
            <p className="text-gray-400 mt-2">Select a saved preset or start a freestyle workout.</p>
          </div>
          <button 
            onClick={() => handleStartWorkout(null)}
            className="bg-tactical-800 border border-tactical-600 text-white px-6 py-2 rounded font-rajdhani font-bold hover:bg-tactical-700 transition-colors"
          >
            Start Empty Workout
          </button>
        </div>

        <div className="mb-10">
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

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-rajdhani font-bold text-neon-gold uppercase tracking-wider flex items-center">
              <Save className="w-5 h-5 mr-2" /> Your Custom Presets
            </h2>
            <button 
              onClick={() => setIsCreatingPreset(true)}
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
                <div key={preset.id} className="bg-tactical-900 border border-tactical-700 rounded-xl p-5 hover:border-neon-gold transition-colors group">
                  <h3 className="font-rajdhani font-bold text-xl text-white mb-2">{preset.name}</h3>
                  <p className="text-xs text-gray-400 font-inter mb-4">{preset.exercises.length} Exercises</p>
                  <button 
                    onClick={() => handleStartWorkout(preset)}
                    className="w-full bg-tactical-800 text-gray-300 border border-tactical-600 py-2 rounded font-rajdhani font-bold uppercase tracking-wider group-hover:bg-neon-gold group-hover:text-tactical-900 group-hover:border-neon-gold transition-all flex items-center justify-center"
                  >
                    <Play className="w-4 h-4 mr-2" /> Start
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto fade-in relative">
      <div className="esports-panel p-4 sm:p-6 mb-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-tactical-700 pb-4">
          <div>
            <h1 className="esports-heading text-2xl text-white">{activeWorkout.name}</h1>
            <p className="text-neon-blue font-bold text-sm mt-1 flex items-center">
              <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse mr-2"></span> ACTIVE WORKOUT
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={abortWorkout}
              className="flex-1 sm:flex-none text-gray-500 hover:text-white px-4 py-2 border border-tactical-600 rounded sm:border-none sm:py-0 transition-colors font-rajdhani font-bold uppercase"
            >
              Abort
            </button>
            <button 
              onClick={handleFinishWorkout}
              className="flex-1 sm:flex-none bg-neon-blue text-tactical-900 px-6 py-2 rounded font-rajdhani font-bold hover:bg-[#00d0dd] transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            >
              Finish
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {exercises.map((exercise, exIndex) => (
            <div key={exercise.id} className="bg-tactical-900 border border-tactical-700 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-tactical-700 bg-tactical-800 flex justify-between items-center">
                <button 
                  onClick={() => openLibrary(exIndex, 'active')}
                  className="text-white hover:text-neon-blue transition-colors font-rajdhani font-bold text-lg"
                >
                  {exercise.name || 'Select Exercise...'}
                </button>
                <button 
                  onClick={() => {
                    const newEx = [...exercises];
                    newEx.splice(exIndex, 1);
                    setExercises(newEx);
                  }}
                  className="text-gray-500 hover:text-neon-red"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 text-xs font-rajdhani uppercase text-gray-500 font-bold mb-2 px-2 hidden sm:grid">
                  <div className="col-span-1 text-center">Set</div>
                  <div className="col-span-3">Type</div>
                  <div className="col-span-2 text-center">Weight</div>
                  <div className="col-span-2 text-center">Reps</div>
                  <div className="col-span-4 text-center">Actions</div>
                </div>

                {exercise.sets.map((set, setIndex) => (
                  <div 
                    key={set.id} 
                    className={clsx(
                      "grid grid-cols-12 gap-2 items-center p-2 rounded transition-colors mb-2 sm:mb-0",
                      set.completed ? "bg-neon-green/10" : "hover:bg-tactical-800"
                    )}
                  >
                    <div className="col-span-12 sm:col-span-1 text-center font-inter text-gray-400 text-sm mb-2 sm:mb-0 flex justify-between sm:block">
                      <span className="sm:hidden font-rajdhani uppercase text-xs">Set</span>
                      <span className="bg-tactical-800 sm:bg-transparent px-2 sm:px-0 rounded">{setIndex + 1}</span>
                    </div>
                    
                    <div className="col-span-12 sm:col-span-3 mb-2 sm:mb-0">
                      <select 
                        value={set.type}
                        onChange={(e) => updateSet(exIndex, setIndex, 'type', e.target.value)}
                        className={clsx(
                          "w-full bg-tactical-800 border-none rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-neon-blue appearance-none cursor-pointer",
                          set.type === 'Warmup' ? "text-neon-gold" : 
                          set.type === 'Drop' ? "text-neon-purple" :
                          set.type === 'Failure' ? "text-neon-red" : "text-white"
                        )}
                      >
                        <option value="Normal">Normal</option>
                        <option value="Warmup">Warmup</option>
                        <option value="Drop">Drop Set</option>
                        <option value="Failure">Failure</option>
                      </select>
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <span className="sm:hidden block text-xs font-rajdhani uppercase text-gray-500 mb-1">Weight</span>
                      <input 
                        type="number" 
                        value={set.weight || ''}
                        onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                        className="w-full bg-tactical-800 border border-tactical-600 rounded p-2 text-white text-center focus:outline-none focus:border-neon-blue"
                        placeholder="0"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <span className="sm:hidden block text-xs font-rajdhani uppercase text-gray-500 mb-1">Reps</span>
                      <input 
                        type="number" 
                        value={set.reps || ''}
                        onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                        className="w-full bg-tactical-800 border border-tactical-600 rounded p-2 text-white text-center focus:outline-none focus:border-neon-blue"
                        placeholder="0"
                      />
                    </div>

                    <div className="col-span-12 sm:col-span-4 flex justify-center gap-2 mt-2 sm:mt-0">
                      <button 
                        onClick={() => toggleSetComplete(exIndex, setIndex)}
                        className={clsx(
                          "flex-1 sm:flex-none sm:w-12 h-10 rounded flex items-center justify-center transition-all",
                          set.completed 
                            ? "bg-neon-green text-tactical-900 shadow-[0_0_10px_rgba(0,255,100,0.5)]" 
                            : "bg-tactical-800 border border-tactical-600 text-transparent hover:border-neon-green"
                        )}
                      >
                        <Check className={clsx("w-6 h-6", set.completed ? "text-tactical-900" : "hidden")} />
                        {!set.completed && <span className="sm:hidden text-gray-400 font-rajdhani uppercase text-sm">Complete</span>}
                      </button>

                      <button
                        onClick={() => removeSetFromExercise(exIndex, setIndex)}
                        className="w-10 h-10 bg-tactical-800 border border-tactical-600 hover:border-neon-red hover:text-neon-red rounded flex items-center justify-center text-gray-500 transition-colors"
                        title="Delete Set"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => addSetToExercise(exIndex)}
                  className="w-full mt-2 py-2 text-xs font-rajdhani font-bold uppercase tracking-wider text-gray-400 hover:text-white bg-tactical-800/50 hover:bg-tactical-800 rounded transition-colors"
                >
                  + Add Set
                </button>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setExercises([...exercises, { id: String(Date.now()), name: '', sets: [{ id: String(Date.now() + 1), reps: 0, weight: 0, type: 'Normal', completed: false }] }])}
          className="mt-6 flex items-center justify-center w-full py-4 border-2 border-dashed border-tactical-600 rounded-lg text-gray-400 hover:text-neon-blue hover:border-neon-blue transition-colors font-rajdhani font-bold uppercase tracking-wider"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Exercise
        </button>
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

              <div className="bg-tactical-900 p-4 rounded-lg border border-tactical-700 mb-8 flex justify-between items-center">
                <span className="text-gray-400 font-rajdhani uppercase">Evoke Points</span>
                <span className="text-2xl font-rajdhani font-bold text-neon-green">+18 EP</span>
              </div>

              <button 
                onClick={closeCelebration}
                className="w-full bg-white text-tactical-900 py-3 rounded font-rajdhani font-bold text-lg hover:bg-gray-200 transition-colors"
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
