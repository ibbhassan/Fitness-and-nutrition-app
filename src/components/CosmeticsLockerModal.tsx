import React, { useState } from 'react';
import { X, Lock, Sparkles, Flame } from 'lucide-react';
import { clsx } from 'clsx';
import { useUser } from '../context/UserContext';
import { COSMETIC_ITEMS, isCosmeticUnlocked, getCosmeticItem } from '../utils/cosmeticsRegistry';
import type { CosmeticType } from '../utils/cosmeticsRegistry';
import { calculateStreak } from '../utils/streakUtils';
import { getRankInfo } from '../utils/rankUtils';

interface CosmeticsLockerModalProps {
  onClose: () => void;
}

export const CosmeticsLockerModal: React.FC<CosmeticsLockerModalProps> = ({ onClose }) => {
  const { profile, workoutHistory, scheduledWorkoutDays, equipCosmetic, user } = useUser();
  const [activeTab, setActiveTab] = useState<CosmeticType>('border');

  // Preview state (allows previewing ANY cosmetic before equipping or even if locked!)
  const [previewBorderId, setPreviewBorderId] = useState<string | null>(null);
  const [previewBannerId, setPreviewBannerId] = useState<string | null>(null);
  const [previewTitleId, setPreviewTitleId] = useState<string | null>(null);

  const currentStreak = calculateStreak(workoutHistory, scheduledWorkoutDays);
  const currentRank = profile ? getRankInfo(profile.level) : getRankInfo(1);

  // Active items being shown in the Live Agent Card Preview (previews override equipped)
  const activeBorder = getCosmeticItem(previewBorderId || profile?.equippedCosmetics?.border) || getCosmeticItem('border_default');
  const activeBanner = getCosmeticItem(previewBannerId || profile?.equippedCosmetics?.banner) || getCosmeticItem('banner_default');
  const activeTitle = previewTitleId !== null 
    ? (previewTitleId ? getCosmeticItem(previewTitleId) : undefined)
    : getCosmeticItem(profile?.equippedCosmetics?.title);

  const isPreviewActive = (previewBorderId && previewBorderId !== profile?.equippedCosmetics?.border) ||
                          (previewBannerId && previewBannerId !== profile?.equippedCosmetics?.banner) ||
                          (previewTitleId !== null && previewTitleId !== profile?.equippedCosmetics?.title);

  const handleResetPreview = () => {
    setPreviewBorderId(null);
    setPreviewBannerId(null);
    setPreviewTitleId(null);
  };

  const itemsForTab = COSMETIC_ITEMS.filter(item => item.type === activeTab);

  const avatarUrl = typeof profile?.avatar === 'string' ? profile.avatar : '/images/avatar_3d.png';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 pb-safe">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative w-full max-w-3xl bg-tactical-950 border border-tactical-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-tactical-900/80 border-b border-tactical-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-neon-purple/20 border border-neon-purple/50 flex items-center justify-center text-neon-purple">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider">Cosmetics & Customization Locker</h2>
              <p className="text-xs text-gray-400 font-inter">Click any item to preview borders, banners, and titles on your agent card</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-tactical-800 p-2 rounded-md transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="p-4 sm:p-5 bg-tactical-900/40 border-b border-tactical-800 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-rajdhani uppercase font-bold tracking-widest text-gray-400 flex items-center gap-2">
              <span>Live Agent Card Preview</span>
              {isPreviewActive && (
                <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[9px] font-bold uppercase animate-pulse">
                  Preview Active
                </span>
              )}
            </span>
            {isPreviewActive && (
              <button 
                onClick={handleResetPreview}
                className="text-[10px] font-rajdhani font-bold uppercase text-neon-blue hover:underline cursor-pointer"
              >
                Reset Preview
              </button>
            )}
          </div>
          
          <div className={clsx("p-4 rounded-xl border relative overflow-hidden transition-all duration-300", activeBanner?.cssClass || 'bg-tactical-900 border-tactical-700')}>
            <div className="flex items-center gap-4 relative z-10">
              {/* Avatar with Active Border */}
              <div className={clsx("w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shrink-0 transition-all duration-300 bg-tactical-900 flex items-center justify-center", activeBorder?.cssClass || 'border-2 border-neon-blue')}>
                <img src={avatarUrl} alt="Preview Avatar" className="w-full h-full object-cover scale-110" />
              </div>

              {/* Username & Title */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="esports-heading text-xl sm:text-2xl text-white tracking-wider truncate">{user?.username || 'AGENT'}</h3>
                  {activeTitle && (
                    <span className={clsx("px-2.5 py-0.5 rounded font-rajdhani font-bold text-xs uppercase tracking-widest shrink-0", activeTitle.badgeClass || 'bg-neon-blue/20 border border-neon-blue text-neon-blue')}>
                      {activeTitle.badgeText || activeTitle.name}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-xs font-rajdhani font-bold text-gray-300 mt-1">
                  <span className="text-neon-blue">Level {profile?.level || 1}</span>
                  <span>•</span>
                  <span className={currentRank.color}>{currentRank.tier} {currentRank.division}</span>
                  <span>•</span>
                  <span className="text-yellow-400 flex items-center gap-1"><Flame className="w-3.5 h-3.5 fill-yellow-400" /> {currentStreak} Day Streak</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-tactical-800 bg-tactical-900/60 px-4 pt-2">
          {(['border', 'banner', 'title'] as CosmeticType[]).map((tab) => {
            const label = tab === 'border' ? 'Avatar Borders' : tab === 'banner' ? 'Profile Banners' : 'Player Titles';
            const count = COSMETIC_ITEMS.filter(i => i.type === tab).length;
            const isSelected = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "px-4 py-3 text-sm font-rajdhani uppercase font-bold tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2",
                  isSelected 
                    ? "border-neon-blue text-neon-blue bg-tactical-800/50" 
                    : "border-transparent text-gray-400 hover:text-white hover:bg-tactical-800/30"
                )}
              >
                <span>{label}</span>
                <span className={clsx("px-1.5 py-0.5 rounded-full text-[10px] font-mono", isSelected ? "bg-neon-blue/20 text-neon-blue" : "bg-tactical-800 text-gray-500")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Item Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {itemsForTab.map((item) => {
              const unlocked = isCosmeticUnlocked(item, profile, currentStreak);
              const isEquipped = 
                (activeTab === 'border' && (profile?.equippedCosmetics?.border === item.id || (!profile?.equippedCosmetics?.border && item.id === 'border_default'))) ||
                (activeTab === 'banner' && (profile?.equippedCosmetics?.banner === item.id || (!profile?.equippedCosmetics?.banner && item.id === 'banner_default'))) ||
                (activeTab === 'title' && profile?.equippedCosmetics?.title === item.id);

              const isCurrentlyPreviewed = 
                (activeTab === 'border' && previewBorderId === item.id) ||
                (activeTab === 'banner' && previewBannerId === item.id) ||
                (activeTab === 'title' && previewTitleId === item.id);

              return (
                <div 
                  key={item.id}
                  onClick={() => {
                    if (item.type === 'border') setPreviewBorderId(item.id);
                    else if (item.type === 'banner') setPreviewBannerId(item.id);
                    else if (item.type === 'title') setPreviewTitleId(item.id);
                  }}
                  className={clsx(
                    "p-3.5 rounded-xl border transition-all flex flex-col justify-between relative overflow-hidden cursor-pointer group",
                    isEquipped 
                      ? "border-neon-blue bg-neon-blue/10 shadow-[0_0_15px_rgba(0,240,255,0.2)]" 
                      : isCurrentlyPreviewed
                        ? "border-yellow-400 bg-yellow-500/10 shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                        : unlocked 
                          ? "border-tactical-700 bg-tactical-900 hover:border-tactical-600" 
                          : "border-tactical-800/80 bg-tactical-950/60 opacity-75 hover:opacity-100"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-rajdhani font-bold text-base text-white uppercase tracking-wider flex items-center gap-1.5">
                        {item.name}
                      </span>
                      {isEquipped ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-rajdhani font-bold uppercase bg-neon-blue text-tactical-950 shrink-0">
                          Equipped
                        </span>
                      ) : isCurrentlyPreviewed ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-rajdhani font-bold uppercase bg-yellow-400 text-black shrink-0 animate-pulse">
                          Previewing
                        </span>
                      ) : !unlocked ? (
                        <Lock className="w-4 h-4 text-gray-500 shrink-0" />
                      ) : null}
                    </div>
                    <p className="text-xs text-gray-400 font-inter mb-3 line-clamp-2">{item.description}</p>
                    
                    {/* Visual Preview Badge if Title */}
                    {item.type === 'title' && (
                      <div className="mb-3">
                        <span className={clsx("inline-block px-2.5 py-0.5 rounded font-rajdhani font-bold text-xs uppercase tracking-widest", item.badgeClass || 'bg-tactical-800 text-gray-300')}>
                          {item.badgeText || item.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-tactical-800/50 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-gray-500 uppercase">
                      {item.category === 'streak' ? `${item.requiredStreak}d Streak` : item.category === 'rank' ? `${item.requiredRank} Tier` : 'Default'}
                    </span>

                    <div className="flex items-center gap-2">
                      {unlocked ? (
                        isEquipped ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              equipCosmetic(item.type, activeTab === 'border' ? 'border_default' : activeTab === 'banner' ? 'banner_default' : undefined);
                              if (activeTab === 'border') setPreviewBorderId(null);
                              if (activeTab === 'banner') setPreviewBannerId(null);
                              if (activeTab === 'title') setPreviewTitleId(null);
                            }}
                            className="px-3 py-1 bg-tactical-800 hover:bg-tactical-700 text-gray-300 rounded text-xs font-rajdhani font-bold uppercase transition-colors cursor-pointer"
                          >
                            Unequip
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              equipCosmetic(item.type, item.id);
                              if (activeTab === 'border') setPreviewBorderId(null);
                              if (activeTab === 'banner') setPreviewBannerId(null);
                              if (activeTab === 'title') setPreviewTitleId(null);
                            }}
                            className="px-3 py-1 bg-neon-blue text-tactical-950 hover:bg-[#00d0dd] rounded text-xs font-rajdhani font-bold uppercase transition-colors cursor-pointer shadow-sm"
                          >
                            Equip
                          </button>
                        )
                      ) : (
                        <span className="text-[11px] font-rajdhani font-bold text-yellow-400/90 uppercase flex items-center gap-1">
                          <Lock className="w-3 h-3 text-yellow-400" /> {item.category === 'streak' ? `Reach ${item.requiredStreak}d` : `Reach ${item.requiredRank}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
