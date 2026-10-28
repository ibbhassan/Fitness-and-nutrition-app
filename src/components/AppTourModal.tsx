import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Compass
} from 'lucide-react';
import { clsx } from 'clsx';

/**
 * Configure your in-depth video tour URL here (YouTube, Loom, or direct video link).
 * Example: 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID'
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

const VIDEO_CHAPTERS = [
  { time: '0:00', title: 'Welcome to Evoke & Rank/EP System Overview', tab: 'dashboard' },
  { time: '1:15', title: 'Logging Workouts, Presets, Grades & PRs', tab: 'workout' },
  { time: '2:45', title: 'Nutrition Tracking, Barcode Scanner & Custom Meals', tab: 'nutrition' },
  { time: '4:10', title: 'Biometrics, 7-Day Weight Average & Daily Steps', tab: 'biometrics' },
  { time: '5:05', title: 'Analytics, 1RM Charts & Consistency Calendar', tab: 'analytics' },
  { time: '6:00', title: 'Friends, Highlights Feed & Weekly Leaderboard Rewards', tab: 'social' },
  { time: '7:00', title: 'Cosmetics Locker, Rank Borders & Plan Recalibration', tab: 'profile' }
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

  const currentStep = TOUR_STEPS[currentStepIndex];

  useEffect(() => {
    if (isOpen && !showVideoModal) {
      const targetTab = TOUR_STEPS[currentStepIndex]?.tab;
      if (targetTab) {
        setActiveTab(targetTab);
      }
    }
  }, [isOpen, currentStepIndex, showVideoModal, setActiveTab]);

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
    setActiveTab('dashboard');
    setCurrentStepIndex(0);
    setShowVideoModal(false);
    onClose();
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes('loom.com/share/')) {
      return url.replace('loom.com/share/', 'loom.com/embed/');
    }
    return url;
  };

  const embedUrl = getEmbedUrl(VIDEO_TOUR_URL);
  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-[110] pointer-events-none flex flex-col justify-end sm:justify-center items-center p-3 sm:p-6">
      {/* Backdrop: lighter so user can see the live tab changing behind the tour card */}
      <div
        onClick={handleSkip}
        className="fixed inset-0 bg-black/65 backdrop-blur-[2px] pointer-events-auto transition-opacity animate-in fade-in duration-200"
      />

      {showVideoModal ? (
        /* In-Depth Video Tour Modal */
        <div className="relative z-10 w-full max-w-2xl bg-tactical-900 border-2 border-neon-blue/60 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200 max-h-[90dvh] flex flex-col">
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
              onClick={() => setShowVideoModal(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-tactical-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
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
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-tactical-700 bg-gradient-to-br from-tactical-950 via-tactical-900 to-tactical-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-neon-blue/15 border-2 border-neon-blue flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(0,240,255,0.3)]">
                  <PlayCircle className="w-8 h-8 text-neon-blue" />
                </div>
                <h4 className="font-rajdhani font-bold text-xl uppercase tracking-wider text-white mb-1">
                  Full Video Walkthrough Player Ready
                </h4>
                <p className="text-xs sm:text-sm text-gray-400 max-w-md font-inter">
                  Tap any chapter below to jump directly to that feature in the interactive tour, or link your recorded walkthrough video in <code className="text-neon-blue bg-tactical-800 px-1.5 py-0.5 rounded">VIDEO_TOUR_URL</code>.
                </p>
              </div>
            )}

            {/* Interactive Video Chapters / Feature Jump List */}
            <div>
              <h4 className="text-xs font-rajdhani font-bold uppercase tracking-widest text-gray-400 mb-2.5">
                Walkthrough Chapters (Tap to Jump to Feature)
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {VIDEO_CHAPTERS.map((chapter, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const stepIdx = TOUR_STEPS.findIndex(s => s.tab === chapter.tab);
                      if (stepIdx !== -1) setCurrentStepIndex(stepIdx);
                      setShowVideoModal(false);
                    }}
                    className="w-full text-left bg-tactical-950/80 hover:bg-tactical-800 border border-tactical-800 hover:border-neon-blue/40 rounded-lg px-3.5 py-2.5 flex items-center justify-between transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-neon-blue bg-neon-blue/10 border border-neon-blue/30 px-2 py-0.5 rounded">
                        {chapter.time}
                      </span>
                      <span className="text-sm font-medium text-gray-200 group-hover:text-white">
                        {chapter.title}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-neon-blue transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-tactical-950 border-t border-tactical-800 flex justify-between items-center">
            <button
              onClick={() => setShowVideoModal(false)}
              className="px-4 py-2 rounded-lg bg-tactical-800 hover:bg-tactical-700 text-gray-200 text-sm font-rajdhani font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              ← Back to Interactive Tour
            </button>
            <button
              onClick={handleSkip}
              className="px-5 py-2 rounded-lg bg-neon-blue text-tactical-950 text-sm font-rajdhani font-extrabold uppercase tracking-wider hover:bg-[#00d8e6] transition-colors cursor-pointer"
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
          <div className={clsx(' inset-x-0 top-0 h-1.5 bg-gradient-to-r', currentStep.bgGlow)} />

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
              onClick={() => setShowVideoModal(true)}
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
                    Full video walkthrough & chapter guide of every Evoke feature
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
