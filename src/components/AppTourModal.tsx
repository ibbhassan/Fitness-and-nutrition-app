import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Dumbbell,
  Utensils,
  HeartPulse,
  TrendingUp,
  History,
  Users,
  User,
  PlayCircle,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * Optional external video URL (YouTube, Loom, or MP4).
 * When left empty, the built-in interactive Animated Video Walkthrough Player runs automatically!
 */
export const VIDEO_TOUR_URL = '';

interface TourStep {
  id: string;
  tab: string;
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  accentColor: string;
  borderColor: string;
  bgGlow: string;
  highlights: string[];
  proTip: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    tab: 'dashboard',
    badge: 'STEP 1 OF 8 • COMMAND CENTER',
    title: 'Home Dashboard & Daily Missions',
    subtitle: 'Your daily tactical overview, rank progress, and active challenges.',
    icon: LayoutDashboard,
    accentColor: 'text-neon-blue',
    borderColor: 'border-neon-blue/50',
    bgGlow: 'from-neon-blue/20 via-neon-blue/5 to-transparent',
    highlights: [
      'Track your current Rank Tier, Level, and Evolution Points (EP) at the top.',
      'Complete Daily & Weekly Challenges (10k Steps, Workout Minutes, PRs, 7-Day Fuel) for bonus EP — tap "Customize" to adjust your daily targets.',
      'Use the floating "+" Quick Log button in the bottom-right corner to log food, steps, weight, or start a workout from anywhere.'
    ],
    proTip: 'Hitting your scheduled workout days builds your Streak multiplier for huge milestone EP bonuses!'
  },
  {
    id: 'workout',
    tab: 'workout',
    badge: 'STEP 2 OF 8 • TRAINING LOG',
    title: 'Workout Logger & Session Grades',
    subtitle: 'Log sets, track personal records, and earn S+ session grades.',
    icon: Dumbbell,
    accentColor: 'text-neon-gold',
    borderColor: 'border-neon-gold/50',
    bgGlow: 'from-neon-gold/20 via-neon-gold/5 to-transparent',
    highlights: [
      'Start a Freestyle Workout or build reusable Custom Presets for your Push/Pull/Legs or Full Body split.',
      'Your previous weights and reps auto-fill so you always know what to beat for progressive overload.',
      'Expand "Session Notes & Journal" during any workout to jot down form cues or how the session felt.',
      'Finish a workout to receive a performance grade (C to S+) and automatic PR detection!'
    ],
    proTip: 'Completing 4+ exercises or breaking a Personal Record earns an S+ grade and broadcasts to your squad feed.'
  },
  {
    id: 'nutrition',
    tab: 'nutrition',
    badge: 'STEP 3 OF 8 • FUEL & MACROS',
    title: 'Nutrition Tracker & Custom Meals',
    subtitle: 'Hit your daily calorie, protein, carb, and fat targets effortlessly.',
    icon: Utensils,
    accentColor: 'text-neon-green',
    borderColor: 'border-neon-green/50',
    bgGlow: 'from-neon-green/20 via-neon-green/5 to-transparent',
    highlights: [
      'Search thousands of foods, scan barcodes with your camera, or log from Recent & Favorite foods.',
      'Use "Same as Yesterday" or "Saved Meals" to log an entire multi-item meal in one tap — and edit saved meals anytime.',
      'Bulking or eating 5–6 meals a day? Tap "Customize Meals" in the top bar to add, rename, or reorder meal categories (Meal 1, Pre-Workout, etc.).'
    ],
    proTip: 'Logging nutrition all 7 days of the week completes the Weekly Fuel Challenge for +200 EP.'
  },
  {
    id: 'biometrics',
    tab: 'biometrics',
    badge: 'STEP 4 OF 8 • BODY INTEL',
    title: 'Biometrics, Weight & Daily Steps',
    subtitle: 'Monitor your 7-day rolling weight average, body fat %, and step count.',
    icon: HeartPulse,
    accentColor: 'text-neon-purple',
    borderColor: 'border-neon-purple/50',
    bgGlow: 'from-neon-purple/20 via-neon-purple/5 to-transparent',
    highlights: [
      'Log your daily scale weight and body fat percentage — Evoke automatically computes your 7-day rolling weekly average to smooth out water fluctuations.',
      'Log or update your Daily Steps here (or via the "+" button) to complete your Daily Step Challenge.',
      'Swipe left/right or tap the calendar icon to log or review entries for previous days.'
    ],
    proTip: 'Weighing in consistently each morning gives you the most accurate weekly trend.'
  },
  {
    id: 'analytics',
    tab: 'analytics',
    badge: 'STEP 5 OF 8 • PERFORMANCE STATS',
    title: 'Analytics & Consistency Calendar',
    subtitle: 'Visualize strength gains, 6-axis stats, and monthly training consistency.',
    icon: TrendingUp,
    accentColor: 'text-neon-blue',
    borderColor: 'border-neon-blue/50',
    bgGlow: 'from-neon-blue/20 via-neon-blue/5 to-transparent',
    highlights: [
      'View your 6-Axis Stat Radar (Strength, Hypertrophy, Endurance, Volume, Power, Consistency).',
      'Track Estimated 1-Rep Max (1RM) and Max Weight progression for every exercise you perform.',
      'Use the interactive Monthly Consistency Calendar to inspect your workout grades (S+, S, A) and schedule hit rate — tap any day to view session details.'
    ],
    proTip: 'Switch between 1M, 3M, 6M, and 1Y views on your weight trend chart to track long-term progress.'
  },
  {
    id: 'history',
    tab: 'history',
    badge: 'STEP 6 OF 8 • MATCH HISTORY',
    title: 'Workout Match History',
    subtitle: 'Your complete training archive with full session editing.',
    icon: History,
    accentColor: 'text-neon-red',
    borderColor: 'border-neon-red/50',
    bgGlow: 'from-neon-red/20 via-neon-red/5 to-transparent',
    highlights: [
      'Browse every completed workout with its grade badge, total volume, duration, and EP earned.',
      'Forgot to log a set or entered a typo? Tap Edit on any past workout to update sets, weights, or notes anytime.'
    ],
    proTip: 'Every workout in your Match History contributes to your lifetime exercise PRs and volume charts.'
  },
  {
    id: 'social',
    tab: 'social',
    badge: 'STEP 7 OF 8 • SQUAD & LEADERBOARD',
    title: 'Social Hub & Weekly Leaderboard',
    subtitle: 'Compete with friends for weekly podium rewards and hype up PRs.',
    icon: Users,
    accentColor: 'text-neon-gold',
    borderColor: 'border-neon-gold/50',
    bgGlow: 'from-neon-gold/20 via-neon-gold/5 to-transparent',
    highlights: [
      'Add friends by username to compare stats, ranks, and recent workouts.',
      'Compete on the Weekly EP Leaderboard (resets every Friday): 1st Place wins +500 EP, 2nd Place wins +300 EP, and 3rd Place wins +150 EP!',
      'Send reactions and comments on the Squad Highlights Feed whenever friends Rank Up, hit PRs, or drop S+ workouts.'
    ],
    proTip: 'When the weekly leaderboard finishes, a celebration popup will appear so you can claim your podium bonus EP!'
  },
  {
    id: 'profile',
    tab: 'profile',
    badge: 'STEP 8 OF 8 • AGENT PROFILE',
    title: 'Profile, Cosmetics Locker & Plan',
    subtitle: 'Customize your agent identity, unlock borders/titles, and adjust macros.',
    icon: User,
    accentColor: 'text-neon-purple',
    borderColor: 'border-neon-purple/50',
    bgGlow: 'from-neon-purple/20 via-neon-purple/5 to-transparent',
    highlights: [
      'Open "Locker & Cosmetics" to equip animated Rank Borders, Profile Banners, and Agent Titles unlocked by leveling up and hitting streaks.',
      'Switch your active mission (Cut, Bulk, or Maintenance), customize macro targets, or recalibrate your workout schedule anytime.',
      'You can replay this interactive tour or watch the video walkthrough anytime from the top header or right here in your Profile!'
    ],
    proTip: 'Each new Rank Tier (Iron → Challenger) unlocks an exclusive animated cosmetic border in your Locker.'
  }
];

interface VideoScene {
  id: string;
  timeLabel: string;
  durationSec: number;
  tab: string;
  title: string;
  narration: string;
  accent: string;
  badge: string;
  metrics: { label: string; value: string; sub: string }[];
  actionCallout: string;
}

const VIDEO_SCENES: VideoScene[] = [
  {
    id: 'scene-dashboard',
    timeLabel: '0:00',
    durationSec: 12,
    tab: 'dashboard',
    title: 'Welcome to Evoke & Rank Progression',
    narration: 'Every workout, daily step goal, and nutrition streak earns Evolution Points (EP) to rank you up from Iron V all the way to Challenger.',
    accent: 'neon-blue',
    badge: 'CHAPTER 1 • RANK & DAILY CHALLENGES',
    metrics: [
      { label: 'Rank Progression', value: 'Iron → Challenger', sub: '10 Competitive Tiers' },
      { label: 'Daily Step Goal', value: '+10 EP / Day', sub: 'Customizable 5k–15k' },
      { label: 'Quick Log "+" FAB', value: '1-Tap Logging', sub: 'Food, Steps, Weight, Gym' }
    ],
    actionCallout: 'Tap "Customize" on Active Challenges to set your daily step & workout duration goals.'
  },
  {
    id: 'scene-workout',
    timeLabel: '0:12',
    durationSec: 12,
    tab: 'workout',
    title: 'Logging Workouts, Presets & S+ Grades',
    narration: 'Start a Freestyle session or load your saved Push, Pull, or Legs preset. Your previous weights auto-fill so you can beat your numbers and earn an S+ grade.',
    accent: 'neon-gold',
    badge: 'CHAPTER 2 • WORKOUT LOGGER',
    metrics: [
      { label: 'Auto-Prefill Sets', value: 'Last Weight/Reps', sub: 'Progressive Overload' },
      { label: 'Session Grades', value: 'S+ / S / A / B / C', sub: 'Based on sets & PRs' },
      { label: 'Session Journal', value: 'Dropdown Notes', sub: 'Save cues per workout' }
    ],
    actionCallout: 'Complete 4+ exercises or hit a Personal Record to lock in an S+ Rank Grade!'
  },
  {
    id: 'scene-nutrition',
    timeLabel: '0:24',
    durationSec: 12,
    tab: 'nutrition',
    title: 'Nutrition, Barcode Scanner & Custom Meals',
    narration: 'Log macros in seconds with food search, camera barcode scanning, Same as Yesterday, or Saved Meals. Customize your meal slots to fit any bulk or cut.',
    accent: 'neon-green',
    badge: 'CHAPTER 3 • FUEL & CUSTOM MEALS',
    metrics: [
      { label: 'Meal Categories', value: '100% Customizable', sub: 'Rename or add Meal 1–6+' },
      { label: 'Saved Meals', value: '1-Tap Multi-Log', sub: 'Edit items & amounts' },
      { label: 'Weekly Fuel Quest', value: '+200 EP Bonus', sub: 'Log 7 days in a week' }
    ],
    actionCallout: 'Use "Customize Meals" in the top header to add extra meals or rename Breakfast/Lunch/Dinner.'
  },
  {
    id: 'scene-biometrics',
    timeLabel: '0:36',
    durationSec: 10,
    tab: 'biometrics',
    title: 'Biometrics, 7-Day Weight Average & Steps',
    narration: 'Log your morning scale weight and body fat percentage. Evoke calculates your 7-day rolling weekly average so daily water fluctuations never throw you off.',
    accent: 'neon-purple',
    badge: 'CHAPTER 4 • BODY INTEL',
    metrics: [
      { label: 'Weekly Weight Avg', value: '7-Day Rolling', sub: 'Filters water weight noise' },
      { label: 'Body Composition', value: 'LBM & Fat Mass', sub: 'Auto-calculated' },
      { label: 'Daily Step Sync', value: 'Resets Midnight', sub: 'Tracks daily step quest' }
    ],
    actionCallout: 'Swipe left or right on the date bar to log or inspect weight entries from earlier in the week.'
  },
  {
    id: 'scene-analytics',
    timeLabel: '0:46',
    durationSec: 10,
    tab: 'analytics',
    title: 'Analytics, 1RM Charts & Consistency Calendar',
    narration: 'Track your Estimated 1-Rep Max for every lift, inspect your 6-axis Stat Radar, and click any date on the Monthly Consistency Calendar to review your grades.',
    accent: 'neon-blue',
    badge: 'CHAPTER 5 • ANALYTICS & CALENDAR',
    metrics: [
      { label: 'Strength Curves', value: 'Est. 1RM & Max', sub: 'Per-exercise progression' },
      { label: 'Consistency Grid', value: 'Monthly Calendar', sub: 'Shows S+/S/A grades' },
      { label: '6-Axis Radar', value: 'Live Attribute Hex', sub: 'Grows with every session' }
    ],
    actionCallout: 'Tap any date in the Monthly Consistency Calendar to see the exact workouts logged that day.'
  },
  {
    id: 'scene-social',
    timeLabel: '0:56',
    durationSec: 12,
    tab: 'social',
    title: 'Squad Feed & Weekly Leaderboard Rewards',
    narration: 'Add friends to compete on the Weekly EP Leaderboard. Every Friday the leaderboard resets and awards +500 EP for 1st, +300 EP for 2nd, and +150 EP for 3rd place!',
    accent: 'neon-gold',
    badge: 'CHAPTER 6 • SOCIAL & LEADERBOARD',
    metrics: [
      { label: '1st Place Reward', value: '+500 Bonus EP', sub: 'Weekly Podium Crown' },
      { label: '2nd & 3rd Place', value: '+300 / +150 EP', sub: 'Claim via popup modal' },
      { label: 'Highlights Feed', value: 'PRs & Rank Ups', sub: 'React & comment on squad' }
    ],
    actionCallout: 'Finish in the Top 3 by Friday to trigger the Weekly Leaderboard Reward celebration popup!'
  },
  {
    id: 'scene-profile',
    timeLabel: '1:08',
    durationSec: 12,
    tab: 'profile',
    title: 'Cosmetics Locker, Rank Borders & Recalibration',
    narration: 'Visit your Profile to equip animated Rank Borders, Banners, and Titles in the Cosmetics Locker, or recalibrate your Cut, Bulk, and Maintenance macros anytime.',
    accent: 'neon-purple',
    badge: 'CHAPTER 7 • PROFILE & COSMETICS',
    metrics: [
      { label: 'Cosmetics Locker', value: 'Borders & Titles', sub: 'Unlocked via Ranks/Streaks' },
      { label: 'Macro Calculator', value: 'Cut / Bulk / Maint', sub: 'Mifflin-St Jeor TDEE' },
      { label: 'Tour & Guide', value: 'Replay Anytime', sub: 'Header & Profile buttons' }
    ],
    actionCallout: 'Open "Locker & Cosmetics" in your Profile to equip your highest unlocked Rank Border!'
  }
];

interface AppTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AppTourModal: React.FC<AppTourModalProps> = ({
  isOpen,
  onClose,
  setActiveTab
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Built-in Animated Video Player State
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sceneElapsed, setSceneElapsed] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const speechSynthRef = useRef<SpeechSynthesis | null>(
    typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null
  );

  const currentStep = TOUR_STEPS[currentStepIndex];
  const currentScene = VIDEO_SCENES[sceneIndex];

  // Switch live background tab during interactive tour OR video tour
  useEffect(() => {
    if (!isOpen) return;
    if (showVideoModal) {
      const targetTab = VIDEO_SCENES[sceneIndex]?.tab;
      if (targetTab) setActiveTab(targetTab);
    } else {
      const targetTab = TOUR_STEPS[currentStepIndex]?.tab;
      if (targetTab) setActiveTab(targetTab);
    }
  }, [isOpen, showVideoModal, sceneIndex, currentStepIndex, setActiveTab]);

  // Optional Web Speech narration when voiceEnabled is toggled on
  useEffect(() => {
    if (!speechSynthRef.current) return;
    speechSynthRef.current.cancel();

    if (isOpen && showVideoModal && isPlaying && voiceEnabled && currentScene) {
      const utterance = new SpeechSynthesisUtterance(`${currentScene.title}. ${currentScene.narration}`);
      utterance.rate = 1.02;
      speechSynthRef.current.speak(utterance);
    }
    return () => {
      speechSynthRef.current?.cancel();
    };
  }, [isOpen, showVideoModal, isPlaying, voiceEnabled, sceneIndex, currentScene]);

  // Auto-advance timer for the built-in video walkthrough player
  useEffect(() => {
    if (!isOpen || !showVideoModal || !isPlaying) return;

    const interval = setInterval(() => {
      setSceneElapsed(prev => {
        const next = prev + 0.2;
        if (next >= currentScene.durationSec) {
          if (sceneIndex < VIDEO_SCENES.length - 1) {
            setSceneIndex(s => s + 1);
            return 0;
          } else {
            setIsPlaying(false);
            return currentScene.durationSec;
          }
        }
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isOpen, showVideoModal, isPlaying, sceneIndex, currentScene.durationSec]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setActiveTab('dashboard');
      setCurrentStepIndex(0);
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    speechSynthRef.current?.cancel();
    setActiveTab('dashboard');
    setCurrentStepIndex(0);
    setShowVideoModal(false);
    setIsPlaying(false);
    onClose();
  };

  const openVideoWalkthrough = (startIdx: number = 0) => {
    setSceneIndex(startIdx);
    setSceneElapsed(0);
    setIsPlaying(true);
    setShowVideoModal(true);
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
    }
    if (url.includes('loom.com/share/')) {
      return url.replace('loom.com/share/', 'loom.com/embed/');
    }
    return url;
  };

  const embedUrl = getEmbedUrl(VIDEO_TOUR_URL);
  const StepIcon = currentStep.icon;

  const totalDurationSec = VIDEO_SCENES.reduce((acc, s) => acc + s.durationSec, 0);
  const elapsedBeforeCurrentScene = VIDEO_SCENES.slice(0, sceneIndex).reduce((acc, s) => acc + s.durationSec, 0);
  const totalElapsedSec = Math.min(totalDurationSec, elapsedBeforeCurrentScene + sceneElapsed);
  const overallProgressPercent = Math.min(100, (totalElapsedSec / totalDurationSec) * 100);

  const formatTime = (sec: number) => {
    const s = Math.max(0, Math.floor(sec));
    const mins = Math.floor(s / 60);
    const rem = s % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="fixed inset-0 z-[110] pointer-events-none flex flex-col justify-end sm:justify-center items-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        onClick={handleSkip}
        className="fixed inset-0 bg-black/65 backdrop-blur-[2px] pointer-events-auto transition-opacity animate-in fade-in duration-200"
      />

      {showVideoModal ? (
        /* In-Depth Video Tour Player Modal */
        <div className="relative z-10 w-full max-w-2xl bg-tactical-900 border-2 border-neon-blue/60 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200 max-h-[92dvh] flex flex-col">
          <div className="p-4 sm:p-5 bg-tactical-950 border-b border-tactical-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-neon-blue/15 border border-neon-blue/40 flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-neon-blue" />
              </div>
              <div>
                <span className="text-[10px] font-rajdhani font-bold uppercase tracking-widest text-neon-blue block">
                  EVOKE ACADEMY • VIDEO BRIEFING
                </span>
                <h3 className="font-rajdhani font-bold text-lg sm:text-xl text-white uppercase tracking-wider leading-none">
                  In-Depth Video Walkthrough
                </h3>
              </div>
            </div>
            <button
              onClick={() => {
                speechSynthRef.current?.cancel();
                setShowVideoModal(false);
              }}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-tactical-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            {embedUrl ? (
              <div className="space-y-3">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-tactical-700 bg-black shadow-inner">
                  <iframe
                    src={embedUrl}
                    title="Evoke In-Depth Video Tour"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="flex justify-end">
                  <a
                    href={VIDEO_TOUR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-rajdhani font-bold uppercase tracking-wider text-neon-blue hover:underline"
                  >
                    Open Video in New Tab <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              /* Built-In Animated Interactive Walkthrough Player */
              <div className="rounded-xl overflow-hidden border-2 border-tactical-700 bg-tactical-950 shadow-2xl flex flex-col">
                {/* Video Viewport */}
                <div
                  onClick={() => setIsPlaying(p => !p)}
                  className="relative w-full min-h-[250px] sm:min-h-[280px] p-5 sm:p-6 bg-gradient-to-br from-tactical-950 via-tactical-900 to-black flex flex-col justify-between cursor-pointer select-none overflow-hidden"
                >
                  {/* Animated Ambient Glow */}
                  <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-neon-blue/10 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-neon-gold/10 blur-3xl pointer-events-none" />

                  {/* Top HUD Row */}
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded bg-neon-blue/15 border border-neon-blue/40 text-neon-blue text-[10px] font-rajdhani font-extrabold uppercase tracking-widest">
                      {currentScene.badge}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/60 border border-tactical-700 text-gray-300">
                        <span className={clsx('w-2 h-2 rounded-full', isPlaying ? 'bg-neon-green animate-pulse' : 'bg-neon-gold')} />
                        {isPlaying ? 'PLAYING' : 'PAUSED'}
                      </span>
                    </div>
                  </div>

                  {/* Animated Scene Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentScene.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className="relative z-10 my-4 space-y-4"
                    >
                      <div>
                        <h4 className="font-rajdhani font-extrabold text-xl sm:text-2xl text-white uppercase tracking-wide">
                          {currentScene.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-300 font-inter mt-1 leading-relaxed">
                          {currentScene.narration}
                        </p>
                      </div>

                      {/* 3 Animated Feature Metric Cards */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {currentScene.metrics.map((m, i) => (
                          <motion.div
                            key={m.label}
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.08 }}
                            className="bg-tactical-900/90 border border-tactical-700 rounded-lg p-2.5 text-left"
                          >
                            <span className="text-[9px] sm:text-[10px] font-rajdhani uppercase tracking-wider text-gray-400 block truncate">
                              {m.label}
                            </span>
                            <span className="text-xs sm:text-sm font-rajdhani font-extrabold text-neon-blue block truncate mt-0.5">
                              {m.value}
                            </span>
                            <span className="text-[9px] text-gray-500 font-inter block truncate">
                              {m.sub}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Bottom Callout Strip inside Video */}
                  <div className="relative z-10 bg-black/60 border border-tactical-800 rounded-lg px-3 py-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-neon-gold shrink-0" />
                    <span className="text-[11px] sm:text-xs text-gray-200 font-inter">
                      {currentScene.actionCallout}
                    </span>
                  </div>
                </div>

                {/* Video Player Controls Bar */}
                <div className="bg-tactical-950 border-t border-tactical-800 p-3 space-y-2">
                  {/* Scrubber Bar */}
                  <div className="w-full h-1.5 bg-tactical-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-neon-blue to-neon-green transition-all duration-200"
                      style={{ width: `${overallProgressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (totalElapsedSec >= totalDurationSec) {
                            setSceneIndex(0);
                            setSceneElapsed(0);
                            setIsPlaying(true);
                          } else {
                            setIsPlaying(p => !p);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-neon-blue text-tactical-950 font-rajdhani font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#00d8e6] transition-colors cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isPlaying ? 'Pause' : 'Play'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSceneIndex(0);
                          setSceneElapsed(0);
                          setIsPlaying(true);
                        }}
                        className="p-1.5 rounded-lg bg-tactical-800 hover:bg-tactical-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
                        title="Restart Video Tour"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      {speechSynthRef.current && (
                        <button
                          type="button"
                          onClick={() => setVoiceEnabled(v => !v)}
                          className={clsx(
                            'px-2.5 py-1.5 rounded-lg border text-xs font-rajdhani font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer',
                            voiceEnabled
                              ? 'bg-neon-green/15 border-neon-green/50 text-neon-green'
                              : 'bg-tactical-800 border-tactical-700 text-gray-400 hover:text-white'
                          )}
                          title="Toggle Voiceover Narration"
                        >
                          {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
                        </button>
                      )}

                      <span className="text-xs font-mono text-gray-400 ml-1">
                        {formatTime(totalElapsedSec)} / {formatTime(totalDurationSec)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={sceneIndex === 0}
                        onClick={() => {
                          setSceneIndex(s => Math.max(0, s - 1));
                          setSceneElapsed(0);
                        }}
                        className="px-2 py-1 rounded bg-tactical-800 hover:bg-tactical-700 disabled:opacity-40 text-xs font-rajdhani font-bold uppercase text-gray-300 cursor-pointer"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        disabled={sceneIndex === VIDEO_SCENES.length - 1}
                        onClick={() => {
                          setSceneIndex(s => Math.min(VIDEO_SCENES.length - 1, s + 1));
                          setSceneElapsed(0);
                        }}
                        className="px-2 py-1 rounded bg-tactical-800 hover:bg-tactical-700 disabled:opacity-40 text-xs font-rajdhani font-bold uppercase text-gray-300 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Video Chapters List */}
            <div>
              <h4 className="text-xs font-rajdhani font-bold uppercase tracking-widest text-gray-400 mb-2">
                Walkthrough Chapters (Tap to Play Chapter)
              </h4>
              <div className="grid grid-cols-1 gap-1.5">
                {VIDEO_SCENES.map((scene, idx) => {
                  const isActiveScene = idx === sceneIndex;
                  return (
                    <button
                      key={scene.id}
                      type="button"
                      onClick={() => {
                        setSceneIndex(idx);
                        setSceneElapsed(0);
                        setIsPlaying(true);
                      }}
                      className={clsx(
                        'w-full text-left border rounded-lg px-3 py-2 flex items-center justify-between transition-all cursor-pointer',
                        isActiveScene
                          ? 'bg-neon-blue/15 border-neon-blue text-white shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                          : 'bg-tactical-950/80 hover:bg-tactical-800 border-tactical-800 text-gray-300'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={clsx(
                          'text-[11px] font-mono font-bold px-2 py-0.5 rounded shrink-0',
                          isActiveScene ? 'bg-neon-blue text-tactical-950' : 'bg-tactical-800 text-neon-blue'
                        )}>
                          {scene.timeLabel}
                        </span>
                        <span className="text-xs sm:text-sm font-medium truncate">
                          {scene.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-rajdhani font-bold uppercase tracking-wider text-neon-blue shrink-0 ml-2">
                        {isActiveScene && isPlaying ? 'Playing' : 'Play'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4 bg-tactical-950 border-t border-tactical-800 flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                speechSynthRef.current?.cancel();
                setShowVideoModal(false);
              }}
              className="px-4 py-2 rounded-lg bg-tactical-800 hover:bg-tactical-700 text-gray-200 text-xs sm:text-sm font-rajdhani font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              ← Back to Step-by-Step Tour
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="px-5 py-2 rounded-lg bg-neon-blue text-tactical-950 text-xs sm:text-sm font-rajdhani font-extrabold uppercase tracking-wider hover:bg-[#00d8e6] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        /* Interactive Step-by-Step Live Tab Tour HUD */
        <div
          className={clsx(
            'relative z-10 w-full max-w-xl bg-tactical-900/95 border-2 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.85)] overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[88dvh]',
            currentStep.borderColor
          )}
        >
          {/* Ambient Top Gradient */}
          <div className={clsx('inset-x-0 top-0 h-1.5 bg-gradient-to-r', currentStep.bgGlow)} />

          {/* Header */}
          <div className="p-4 sm:p-5 bg-tactical-950/90 border-b border-tactical-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-tactical-900 border border-tactical-700 flex items-center justify-center shrink-0">
                <StepIcon className={clsx('w-5 h-5', currentStep.accentColor)} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={clsx('text-[10px] font-rajdhani font-bold uppercase tracking-widest', currentStep.accentColor)}>
                    {currentStep.badge}
                  </span>
                </div>
                <h3 className="font-rajdhani font-extrabold text-lg sm:text-xl text-white uppercase tracking-wider leading-tight">
                  {currentStep.title}
                </h3>
              </div>
            </div>

            <button
              onClick={handleSkip}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-tactical-800 transition-colors cursor-pointer shrink-0"
              title="Close Tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Dots Bar */}
          <div className="px-5 pt-3 flex items-center gap-1.5">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={clsx(
                  'h-1.5 rounded-full transition-all cursor-pointer',
                  idx === currentStepIndex
                    ? 'flex-[2] bg-neon-blue shadow-[0_0_8px_#00f0ff]'
                    : idx < currentStepIndex
                      ? 'flex-1 bg-neon-blue/40'
                      : 'flex-1 bg-tactical-700 hover:bg-tactical-600'
                )}
                title={s.title}
              />
            ))}
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            <p className="text-xs sm:text-sm text-gray-300 font-inter">
              {currentStep.subtitle}
            </p>

            <div className="space-y-2.5">
              {currentStep.highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-tactical-950/80 border border-tactical-800 rounded-xl p-3 flex items-start gap-3"
                >
                  <CheckCircle2 className={clsx('w-4 h-4 mt-0.5 shrink-0', currentStep.accentColor)} />
                  <span className="text-xs sm:text-sm text-gray-200 font-inter leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* Pro Tip Box */}
            <div className="bg-neon-gold/10 border border-neon-gold/30 rounded-xl p-3 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-neon-gold shrink-0 mt-0.5" />
              <p className="text-xs text-gray-200 font-inter">
                <span className="font-rajdhani font-bold uppercase tracking-wider text-neon-gold mr-1.5">
                  Pro Tip:
                </span>
                {currentStep.proTip}
              </p>
            </div>

            {/* In-Depth Video Tour Banner Button */}
            <button
              type="button"
              onClick={() => openVideoWalkthrough(0)}
              className="w-full bg-gradient-to-r from-neon-blue/15 via-neon-purple/15 to-neon-blue/15 hover:from-neon-blue/25 hover:to-neon-purple/25 border border-neon-blue/40 rounded-xl p-3 flex items-center justify-between transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neon-blue/20 border border-neon-blue/40 flex items-center justify-center shrink-0">
                  <PlayCircle className="w-4 h-4 text-neon-blue" />
                </div>
                <div className="text-left">
                  <span className="text-xs sm:text-sm font-rajdhani font-bold uppercase tracking-wider text-white block group-hover:text-neon-blue transition-colors">
                    Watch In-Depth Video Tour
                  </span>
                  <span className="text-[11px] text-gray-400 font-inter block">
                    Play animated 7-chapter walkthrough with optional voiceover
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neon-blue group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          </div>

          {/* Footer Navigation */}
          <div className="p-4 bg-tactical-950 border-t border-tactical-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {currentStepIndex > 0 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3 py-2 rounded-lg bg-tactical-800 hover:bg-tactical-700 text-gray-200 text-xs sm:text-sm font-rajdhani font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-3 py-2 rounded-lg text-gray-400 hover:text-white text-xs sm:text-sm font-rajdhani font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Skip Tour
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && currentStepIndex < TOUR_STEPS.length - 1 && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-3 py-2 rounded-lg text-gray-400 hover:text-white text-xs font-rajdhani font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Skip
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-lg bg-neon-blue hover:bg-[#00d8e6] text-tactical-950 font-rajdhani font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.35)] transition-all cursor-pointer"
              >
                {currentStepIndex === TOUR_STEPS.length - 1 ? (
                  <>
                    <Compass className="w-4 h-4" /> Finish Tour
                  </>
                ) : (
                  <>
                    Next Step <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
