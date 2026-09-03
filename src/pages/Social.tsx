import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { searchUsersByUsername, sendFriendRequest, getPendingRequests, respondToRequest, getFriendsProfiles, removeFriend, getNetworkHighlights, toggleFistBump, getGlobalLeaderboard } from '../services/socialService';
import { Search, UserPlus, Check, X, Users, Trophy, Activity, Flame, Shield, Crosshair, ArrowUpCircle, Zap } from 'lucide-react';
import type { FriendRequest, HighlightEvent } from '../types';
import { getRankInfo } from '../utils/rankUtils';
import { getTimeUntilNextReset } from '../utils/dateUtils';
import { clsx } from 'clsx';

import { FriendProfile } from '../components/social/FriendProfile';

export const Social: React.FC = () => {
  const { user, profile } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [friendsProfiles, setFriendsProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFriendUid, setSelectedFriendUid] = useState<string | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'community' | 'roster'>('community');
  const [highlights, setHighlights] = useState<HighlightEvent[]>([]);

  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState<'friends' | 'global'>('friends');
  const [globalLeaderboard, setGlobalLeaderboard] = useState<any[]>([]);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  const currentUid = user?.uid;
  const userIdentifier = user?.uid || user?.username || 'me';

  const currentUserProfile = useMemo(() => ({
    uid: currentUid || 'me',
    username: user?.username || profile.name || 'You',
    profile: profile
  }), [currentUid, user, profile]);

  const sortedFriendsLeaderboard = useMemo(() => {
    const combined = [currentUserProfile, ...friendsProfiles];
    const uniqueMap = new Map();
    combined.forEach(u => uniqueMap.set(u.uid, u));
    const list = Array.from(uniqueMap.values());
    list.sort((a, b) => (b.profile?.weeklyEp || 0) - (a.profile?.weeklyEp || 0));
    return list;
  }, [currentUserProfile, friendsProfiles]);

  const handleFistBump = (highlightId: string) => {
    setHighlights(prev => prev.map(h => {
      if (h.id !== highlightId) return h;
      const bumps = h.fistBumps || [];
      const hasBumped = bumps.includes(userIdentifier);
      const newBumps = hasBumped 
        ? bumps.filter(id => id !== userIdentifier)
        : [...bumps, userIdentifier];
      return { ...h, fistBumps: newBumps };
    }));
    toggleFistBump(highlightId, userIdentifier).catch(err => console.error("Failed to update fist bump:", err));
  };

  const loadSocialData = async () => {
    if (!currentUid) return;
    try {
      setIsLoading(true);
      const [requestsResult, friendsResult, highlightsResult] = await Promise.allSettled([
        getPendingRequests(currentUid),
        getFriendsProfiles(profile.friends || []),
        getNetworkHighlights(currentUid ? [currentUid, ...(profile.friends || [])] : profile.friends || [])
      ]);
      
      if (requestsResult.status === 'fulfilled') {
        setPendingRequests(requestsResult.value);
      }
      
      if (friendsResult.status === 'fulfilled') {
        setFriendsProfiles(friendsResult.value);
      }
      
      if (highlightsResult.status === 'fulfilled') {
        setHighlights(highlightsResult.value);
      } else {
        console.warn("Failed to load highlights, likely due to missing Firestore rules.", highlightsResult.reason);
      }
    } catch (err) {
      console.error('Failed to load social data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSocialData();
  }, [currentUid, profile.friends]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !currentUid) return;
    
    setIsSearching(true);
    try {
      const results = await searchUsersByUsername(searchQuery, currentUid);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (targetUid: string) => {
    if (!currentUid || !user?.username) return;
    try {
      await sendFriendRequest(currentUid, user.username, targetUid);
      alert('Friend request sent!');
    } catch (err: any) {
      alert(err.message || 'Failed to send request');
    }
  };

  const handleRespond = async (requestId: string, senderUid: string, accept: boolean) => {
    if (!currentUid) return;
    try {
      await respondToRequest(requestId, currentUid, senderUid, accept);
      loadSocialData();
    } catch (err) {
      console.error('Failed to respond to request', err);
    }
  };

  const handleRemoveFriend = async (targetUid: string, username: string) => {
    if (!currentUid) return;
    if (window.confirm(`Are you sure you want to remove ${username} from your friends?`)) {
      try {
        await removeFriend(currentUid, targetUid);
        // Optimistically update the UI to avoid needing to wait for a context refresh
        setFriendsProfiles(prev => prev.filter(f => f.uid !== targetUid));
      } catch (err) {
        console.error('Failed to remove friend', err);
        alert('Failed to remove friend.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (selectedFriendUid) {
    return (
      <div className="max-w-6xl mx-auto pb-24">
        <FriendProfile 
          friendUid={selectedFriendUid} 
          onBack={() => setSelectedFriendUid(null)} 
          onRemoveFriend={() => {
            const friend = friendsProfiles.find(f => f.uid === selectedFriendUid);
            if (friend) {
              handleRemoveFriend(selectedFriendUid, friend.username);
              setSelectedFriendUid(null);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 fade-in pb-24">
      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 bg-tactical-900/50 p-2 rounded-xl border border-tactical-800 backdrop-blur-sm relative z-20">
        <button 
          onClick={() => setActiveTab('community')}
          className={clsx(
            "flex-1 py-3 px-2 sm:px-4 rounded-lg font-rajdhani font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 text-sm sm:text-base",
            activeTab === 'community' ? "bg-neon-blue text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]" : "text-gray-400 hover:text-white hover:bg-tactical-800"
          )}
        >
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5" /> Community
        </button>
        <button 
          onClick={() => setActiveTab('roster')}
          className={clsx(
            "flex-1 py-3 px-2 sm:px-4 rounded-lg font-rajdhani font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 text-sm sm:text-base",
            activeTab === 'roster' ? "bg-neon-blue text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]" : "text-gray-400 hover:text-white hover:bg-tactical-800"
          )}
        >
          <Shield className="w-4 h-4 sm:w-5 sm:h-5" /> Friends
          {(pendingRequests.length > 0) && (
             <span className={clsx("w-5 h-5 rounded-full flex items-center justify-center text-[10px]", activeTab === 'roster' ? "bg-black text-neon-blue" : "bg-neon-gold text-black")}>
               {pendingRequests.length}
             </span>
          )}
        </button>
      </div>

      {activeTab === 'community' ? (
         <div className="space-y-6 animate-fade-in-up">
            {/* Top Half: Ranked Ladder */}
            <div className="esports-panel p-6 border-t-4 border-neon-gold relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-neon-gold/5 to-transparent pointer-events-none"></div>
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                 <h2 className="text-2xl font-rajdhani font-bold text-white uppercase tracking-wider flex items-center gap-2">
                   <Trophy className="w-6 h-6 text-neon-gold" /> Weekly Ranked Ladder
                 </h2>
                 <span className="text-xs text-gray-500 font-mono border border-tactical-700 bg-tactical-900 px-3 py-1 rounded-full">RESETS IN: {getTimeUntilNextReset()}</span>
               </div>
               
                <div className="flex items-end justify-center gap-2 sm:gap-6 mt-4 mb-2 relative z-10 px-2">
                  {[
                    { 
                      place: 2, 
                      height: 'h-28 sm:h-36', 
                      color: 'bg-gradient-to-t from-tactical-800 to-tactical-700 border-2 border-tactical-600', 
                      text: 'text-gray-300', 
                      reward: '+300 EP', 
                      rewardColor: 'text-slate-300 bg-slate-900/90 border-slate-600',
                      badge: '🥈',
                      friend: sortedFriendsLeaderboard[1] 
                    },
                    { 
                      place: 1, 
                      height: 'h-36 sm:h-44', 
                      color: 'bg-gradient-to-t from-amber-600/40 via-neon-gold/20 to-neon-gold border-2 border-neon-gold shadow-[0_0_25px_rgba(255,215,0,0.3)]', 
                      text: 'text-black', 
                      reward: '+500 EP', 
                      rewardColor: 'text-yellow-300 bg-black/90 border-neon-gold shadow-[0_0_10px_rgba(255,215,0,0.4)]',
                      badge: '👑',
                      friend: sortedFriendsLeaderboard[0] 
                    },
                    { 
                      place: 3, 
                      height: 'h-24 sm:h-28', 
                      color: 'bg-gradient-to-t from-tactical-800 to-amber-950/60 border-2 border-amber-800/60', 
                      text: 'text-amber-600', 
                      reward: '+150 EP', 
                      rewardColor: 'text-amber-400 bg-amber-950/90 border-amber-700',
                      badge: '🥉',
                      friend: sortedFriendsLeaderboard[2] 
                    }
                  ].map((podium) => (
                    <div key={podium.place} className="flex flex-col items-center w-full max-w-[120px]">
                       {podium.friend ? (
                         <div className="flex flex-col items-center mb-3">
                           <div className="relative mb-2">
                             <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl z-20 drop-shadow-md">{podium.badge}</span>
                             <img 
                               src={typeof podium.friend.profile?.avatar === 'string' ? podium.friend.profile.avatar : '/images/avatar_3d.png'} 
                               className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-tactical-500 object-cover bg-tactical-800 shadow-[0_0_15px_rgba(0,0,0,0.5)]" 
                               alt={podium.friend.username}
                             />
                             <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded border border-tactical-600 whitespace-nowrap">LVL {podium.friend.profile?.level||1}</span>
                           </div>
                           <span className="font-rajdhani font-bold text-white truncate w-full text-center tracking-wider text-xs sm:text-sm px-1">{podium.friend.username}</span>
                           <span className="text-[10px] sm:text-xs font-mono font-bold text-neon-green mt-0.5">{(podium.friend.profile?.weeklyEp || 0).toLocaleString()} EP</span>
                         </div>
                       ) : (
                         <div className="flex flex-col items-center mb-3 opacity-30">
                           <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-tactical-500 mb-2 flex items-center justify-center">
                              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                           </div>
                           <span className="font-rajdhani font-bold text-white tracking-wider text-xs sm:text-sm">Empty</span>
                         </div>
                       )}
                       <div className={clsx("w-full rounded-t-xl flex flex-col items-center justify-between py-2 font-black shadow-inner relative overflow-hidden", podium.height, podium.color)}>
                         <span className={clsx("text-xl sm:text-2xl", podium.text)}>#{podium.place}</span>
                         <span className={clsx("text-[9px] sm:text-[10px] font-rajdhani uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border shadow-sm mb-1", podium.rewardColor)}>
                           {podium.reward}
                         </span>
                       </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mt-6 relative z-10">
                  <button
                    onClick={async () => {
                      setShowLeaderboardModal(true);
                      if (globalLeaderboard.length === 0) {
                        setIsGlobalLoading(true);
                        try {
                          const globalList = await getGlobalLeaderboard(50);
                          setGlobalLeaderboard(globalList);
                        } catch (err) {
                          console.error("Failed to load global leaderboard", err);
                        } finally {
                          setIsGlobalLoading(false);
                        }
                      }
                    }}
                    className="bg-tactical-800 hover:bg-tactical-700 border border-tactical-600 hover:border-neon-gold text-white font-rajdhani font-bold text-xs sm:text-sm uppercase tracking-wider px-5 py-2.5 rounded-lg transition-all shadow-md flex items-center gap-2 group cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 text-neon-gold group-hover:scale-110 transition-transform" />
                    <span>View Full Leaderboard</span>
                  </button>
                </div>
             </div>

            {/* Bottom Half: Activity Feed */}
            <div className="esports-panel p-6 border-l-4 border-neon-purple relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-transparent pointer-events-none"></div>
               <h2 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-6 relative z-10 border-b border-tactical-800 pb-4">
                 <Activity className="w-5 h-5 text-neon-purple" /> Highlights
               </h2>
               
               <div className="space-y-3 relative z-10">
                  {highlights.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500 font-inter text-sm">No highlights yet. Start dominating to populate the feed!</p>
                    </div>
                  ) : (
                    highlights.map(highlight => {
                      let Icon = Activity;
                      let iconColor = 'text-neon-blue';
                      let bgColor = 'bg-neon-blue/10';
                      let borderColor = 'border-neon-blue/30';
                      let hoverBg = 'group-hover:bg-neon-blue/20';
                      let hoverShadow = 'group-hover:shadow-[0_0_10px_rgba(0,240,255,0.2)]';
                      let hoverBorder = 'hover:border-neon-blue/50';
                      
                      if (highlight.type === 'WORKOUT_COMPLETED') {
                        Icon = Flame;
                        iconColor = 'text-neon-purple';
                        bgColor = 'bg-neon-purple/10';
                        borderColor = 'border-neon-purple/30';
                        hoverBg = 'group-hover:bg-neon-purple/20';
                        hoverShadow = 'group-hover:shadow-[0_0_10px_rgba(176,38,255,0.2)]';
                        hoverBorder = 'hover:border-neon-purple/50';
                      } else if (highlight.type === 'PR_BROKEN') {
                        Icon = Crosshair;
                        iconColor = 'text-neon-gold';
                        bgColor = 'bg-neon-gold/10';
                        borderColor = 'border-neon-gold/30';
                        hoverBg = 'group-hover:bg-neon-gold/20';
                        hoverShadow = 'group-hover:shadow-[0_0_10px_rgba(255,184,0,0.2)]';
                        hoverBorder = 'hover:border-neon-gold/50';
                      }

                      let isMajorPromotion = false;
                      let oldRankInfo = null;
                      let newRankInfo = null;

                      if (highlight.type === 'RANK_UP') {
                        const newLevel = highlight.data.level;
                        const oldLevel = highlight.data.oldLevel || Math.max(1, newLevel - 1); // fallback if oldLevel wasn't tracked
                        newRankInfo = getRankInfo(newLevel);
                        oldRankInfo = getRankInfo(oldLevel);
                        
                        isMajorPromotion = newRankInfo.tier !== oldRankInfo.tier;

                        Icon = ArrowUpCircle;
                        if (isMajorPromotion) {
                          // Make it look legendary
                          iconColor = newRankInfo.color;
                          bgColor = `bg-tactical-900/50`;
                          borderColor = `border-${newRankInfo.color.split('-')[1]}-500/50`;
                          hoverBg = `group-hover:bg-tactical-800`;
                          hoverShadow = `group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]`;
                          hoverBorder = `hover:border-${newRankInfo.color.split('-')[1]}-400`;
                        } else {
                          // Standard promotion
                          iconColor = 'text-neon-blue';
                          bgColor = 'bg-neon-blue/10';
                          borderColor = 'border-neon-blue/30';
                          hoverBg = 'group-hover:bg-neon-blue/20';
                          hoverShadow = 'group-hover:shadow-[0_0_10px_rgba(0,240,255,0.2)]';
                          hoverBorder = 'hover:border-neon-blue/50';
                        }
                      } else if (highlight.type === 'STREAK') {
                        Icon = Zap;
                        iconColor = 'text-yellow-400';
                        bgColor = 'bg-yellow-400/10';
                        borderColor = 'border-yellow-400/30';
                        hoverBg = 'group-hover:bg-yellow-400/20';
                        hoverShadow = 'group-hover:shadow-[0_0_10px_rgba(250,204,21,0.2)]';
                        hoverBorder = 'hover:border-yellow-400/50';
                      }
                      
                      return (
                      <div key={highlight.id} className={`bg-tactical-900/80 border border-tactical-800 rounded-lg p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-colors group ${hoverBorder}`}>
                         <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded flex items-center justify-center shrink-0 border transition-all overflow-hidden ${bgColor} ${borderColor} ${hoverBg} ${hoverShadow}`}>
                           <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
                         </div>
                         <div className="flex-1">
                            <p className="font-inter text-xs sm:text-sm text-gray-300">
                              <strong className="text-white font-rajdhani tracking-wider text-sm sm:text-base uppercase">{highlight.username}</strong> 
                              {highlight.type === 'WORKOUT_COMPLETED' && (
                                <> achieved an <span className="text-neon-purple font-bold">{highlight.data.grade} Grade</span> on {highlight.data.workoutName}!</>
                              )}
                              {highlight.type === 'PR_BROKEN' && (
                                <> hit a <span className="text-neon-gold font-bold">New PR</span> on {highlight.data.workoutName}!</>
                              )}
                              {highlight.type === 'RANK_UP' && (
                                isMajorPromotion ? (
                                  <> hit a <span className={clsx("font-bold text-lg", newRankInfo?.color)}>MAJOR PROMOTION</span> to <span className={newRankInfo?.color}>{newRankInfo?.tier} {newRankInfo?.division}</span>!</>
                                ) : (
                                  <> promoted to <span className="text-neon-blue font-bold">{newRankInfo?.tier} {newRankInfo?.division}</span>!</>
                                )
                              )}
                              {highlight.type === 'STREAK' && (
                                <> hit a massive <span className="text-yellow-400 font-bold">{highlight.data.streak}-Day Streak</span>!</>
                              )}
                            </p>
                            <span className="text-[9px] sm:text-[10px] text-gray-500 font-mono mt-1 block">
                              {new Date(highlight.timestamp).toLocaleString()}
                            </span>
                         </div>
                         {(() => {
                           const bumps = highlight.fistBumps || [];
                           const hasBumped = bumps.includes(userIdentifier);
                           const count = bumps.length;

                           return (
                             <button 
                               onClick={() => handleFistBump(highlight.id)}
                               className={clsx(
                                 "px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg transition-all border flex items-center gap-1.5 font-rajdhani font-bold text-xs sm:text-sm select-none active:scale-95 cursor-pointer shrink-0",
                                 hasBumped 
                                   ? "bg-neon-purple/20 border-neon-purple text-white shadow-[0_0_12px_rgba(181,53,245,0.4)]" 
                                   : "bg-tactical-800 hover:bg-tactical-700 border-tactical-600 text-gray-400 hover:text-white"
                               )}
                               title={hasBumped ? "Remove Fist Bump" : "Fist Bump!"}
                             >
                               <span className={clsx("text-base sm:text-lg transition-transform", hasBumped ? "scale-110" : "grayscale hover:grayscale-0")}>👊</span>
                               {count > 0 && <span className="text-neon-purple font-bold font-mono">{count}</span>}
                             </button>
                           );
                         })()}
                      </div>
                    )})
                  )}
               </div>
            </div>
         </div>
      ) : (
         <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-fade-in-up">
            <div className="xl:col-span-3 space-y-6">
              <div className="esports-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-neon-blue relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-transparent pointer-events-none"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div>
                    <h1 className="text-2xl font-rajdhani font-bold tracking-widest text-white uppercase">Friends List</h1>
                    <p className="text-gray-400 text-sm font-inter">Manage your friends and dominate together.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSearchModal(true)}
                  className="relative z-10 bg-neon-blue text-black px-6 py-3 rounded-lg font-rajdhani font-bold uppercase tracking-wider hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" /> Find Friends
                </button>
              </div>

              <div className="esports-panel p-6 space-y-4">
                <h2 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider border-b border-tactical-700 pb-4">
                  Friends
                </h2>
                
                {friendsProfiles.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 bg-tactical-900 border border-tactical-700 rounded-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-rajdhani uppercase tracking-wider text-sm">No friends yet</p>
                    <p className="text-xs mt-1 text-gray-500">Search for agents to add to your friends list!</p>
                  </div>
                ) : (
                  <div className="space-y-4 mt-2 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {friendsProfiles.map(friend => {
                      const rankInfo = getRankInfo(friend.profile?.level);
                      return (
                        <div 
                          key={friend.uid} 
                          onClick={() => setSelectedFriendUid(friend.uid)}
                          className="bg-tactical-900 rounded-xl border border-tactical-700 flex items-center justify-between p-3 hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(0,240,255,0.15)] transition-all cursor-pointer group relative overflow-hidden min-w-max"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 z-20" style={{backgroundColor: rankInfo.color}}></div>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" style={{ background: `linear-gradient(90deg, ${rankInfo.color}, transparent)` }}></div>
                          
                          <div className="flex items-center gap-3 pl-3 relative z-30 flex-1">
                            <div className="relative shrink-0">
                              <img src={typeof friend.profile?.avatar === 'string' ? friend.profile.avatar : '/images/avatar_3d.png'} alt="Avatar" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-tactical-800 border-2 border-tactical-600 shadow-md object-cover" />
                            </div>
                            <div className="flex-1 pr-2">
                              <h3 className={clsx(
                                "font-rajdhani font-bold text-white uppercase tracking-wider drop-shadow-md whitespace-nowrap",
                                (friend.username || '').length > 20 ? "text-[10px] leading-tight" : (friend.username || '').length > 15 ? "text-xs sm:text-sm" : (friend.username || '').length > 10 ? "text-sm sm:text-base" : "text-base sm:text-lg"
                              )}>
                                {friend.username || 'Unknown Agent'}
                              </h3>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 pr-3 relative z-30 shrink-0">
                            <div className="flex items-center gap-2 sm:gap-4 bg-black/20 px-3 sm:px-4 py-2 rounded-lg border border-tactical-700">
                              <span className="text-sm sm:text-base font-black text-white" style={{color: rankInfo.color}}>LVL {friend.profile?.level || 1}</span>
                              <div className="w-px h-6 bg-tactical-600"></div>
                              <div className="flex items-center gap-2">
                                <img src={rankInfo.crestUrl} alt={rankInfo.tier} className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-md" />
                                <span className="text-sm sm:text-base font-bold uppercase tracking-wider hidden sm:inline" style={{color: rankInfo.color}}>{rankInfo.tier} {rankInfo.division}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="esports-panel p-6 space-y-4">
                <h2 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider flex items-center justify-between border-b border-tactical-700 pb-4">
                  <span>Friend Requests</span>
                  {pendingRequests.length > 0 && (
                    <span className="bg-neon-gold text-black font-bold text-xs px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
                  )}
                </h2>
                
                {pendingRequests.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4 font-inter">No pending requests</p>
                ) : (
                  <div className="space-y-3 mt-2">
                    {pendingRequests.map(req => (
                      <div key={req.id} className="bg-tactical-900 p-3 rounded-lg border border-tactical-700 flex items-center justify-between">
                        <span className="font-rajdhani font-bold text-sm tracking-wider uppercase truncate max-w-[100px]">{req.fromUsername}</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleRespond(req.id, req.fromUid, true)} className="p-2 bg-tactical-800 border border-neon-green/30 hover:bg-neon-green/20 hover:border-neon-green text-neon-green rounded-lg transition-all shadow-[0_0_10px_rgba(0,255,100,0.1)] hover:shadow-[0_0_15px_rgba(0,255,100,0.3)]">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleRespond(req.id, req.fromUid, false)} className="p-2 bg-tactical-800 border border-neon-red/30 hover:bg-neon-red/20 hover:border-neon-red text-neon-red rounded-lg transition-all shadow-[0_0_10px_rgba(255,0,60,0.1)] hover:shadow-[0_0_15px_rgba(255,0,60,0.3)]">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
         </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-tactical-900 border border-tactical-700 rounded-xl max-w-md w-full p-6 space-y-6 relative shadow-2xl">
            <button 
              onClick={() => setShowSearchModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-rajdhani font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Search className="w-6 h-6 text-neon-blue" /> Search Agents
            </h2>
            
            <form onSubmit={handleSearch} className="flex gap-2">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Username" 
                className="flex-1 bg-tactical-800 border border-tactical-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all font-inter text-lg"
                autoFocus
              />
              <button type="submit" disabled={isSearching} className="bg-neon-blue text-black font-bold p-3 rounded-lg hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(0,240,255,0.6)] transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)] flex items-center justify-center">
                <Search className="w-6 h-6" />
              </button>
            </form>

            <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {isSearching && (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {!isSearching && searchResults.length === 0 && searchQuery && (
                <p className="text-gray-500 text-center py-4 font-inter">No agents found matching "{searchQuery}"</p>
              )}
              {searchResults.map(res => (
                <div key={res.uid} className="bg-tactical-800 p-3 rounded-lg border border-tactical-600 flex items-center justify-between group hover:border-neon-blue/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={typeof res.avatar === 'string' ? res.avatar : '/images/avatar_3d.png'} alt="Avatar" className="w-10 h-10 rounded-full bg-tactical-900 border border-tactical-700 object-cover" />
                    <div>
                      <h4 className="font-rajdhani font-bold text-base tracking-wider uppercase text-white">{res.username}</h4>
                      <p className="text-xs text-gray-400 font-inter">Level {res.level} • {res.rank}</p>
                    </div>
                  </div>
                  {profile.friends?.includes(res.uid) ? (
                    <span className="text-xs text-neon-green font-bold bg-neon-green/10 px-2 py-1 rounded border border-neon-green/30">FRIENDS</span>
                  ) : (
                    <button onClick={() => handleSendRequest(res.uid)} className="p-2.5 bg-tactical-900 border border-neon-blue/30 text-neon-blue rounded-lg transition-all hover:bg-neon-blue hover:text-black hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                      <UserPlus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Modal */}
      {showLeaderboardModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-tactical-900 border border-tactical-700 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-tactical-800 bg-tactical-950 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-neon-gold/10 border border-neon-gold/30 rounded-lg">
                  <Trophy className="w-6 h-6 text-neon-gold" />
                </div>
                <div>
                  <h2 className="font-rajdhani font-bold text-xl sm:text-2xl uppercase tracking-wider text-white">Weekly Leaderboard</h2>
                  <p className="text-xs text-gray-400 font-mono">RESETS IN: {getTimeUntilNextReset()}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowLeaderboardModal(false)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-tactical-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Leaderboard Tabs */}
            <div className="flex border-b border-tactical-800 bg-tactical-900 px-4 sm:px-6 pt-3 shrink-0">
              <button
                onClick={() => setLeaderboardTab('friends')}
                className={clsx(
                  "pb-3 px-4 font-rajdhani font-bold uppercase tracking-wider text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer",
                  leaderboardTab === 'friends' ? "border-neon-gold text-neon-gold" : "border-transparent text-gray-400 hover:text-gray-200"
                )}
              >
                <Users className="w-4 h-4" /> Friends ({sortedFriendsLeaderboard.length})
              </button>
              <button
                onClick={() => setLeaderboardTab('global')}
                className={clsx(
                  "pb-3 px-4 font-rajdhani font-bold uppercase tracking-wider text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer",
                  leaderboardTab === 'global' ? "border-neon-gold text-neon-gold" : "border-transparent text-gray-400 hover:text-gray-200"
                )}
              >
                <Trophy className="w-4 h-4" /> Global Community
              </button>
            </div>

            {/* Leaderboard List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
              {isGlobalLoading && leaderboardTab === 'global' ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-neon-gold border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                (leaderboardTab === 'friends' ? sortedFriendsLeaderboard : globalLeaderboard).map((item, index) => {
                  const rankNum = index + 1;
                  const isMe = item.uid === currentUid || item.uid === 'me';
                  const rankInfo = getRankInfo(item.profile?.level || 1);
                  const weeklyEp = item.profile?.weeklyEp || 0;

                  let rewardTag = null;
                  if (rankNum === 1) rewardTag = { label: '+500 EP Bonus', color: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10', icon: '👑' };
                  else if (rankNum === 2) rewardTag = { label: '+300 EP Bonus', color: 'text-slate-300 border-slate-400/40 bg-slate-400/10', icon: '🥈' };
                  else if (rankNum === 3) rewardTag = { label: '+150 EP Bonus', color: 'text-amber-400 border-amber-600/40 bg-amber-600/10', icon: '🥉' };

                  return (
                    <div 
                      key={item.uid || index}
                      className={clsx(
                        "p-3 sm:p-4 rounded-xl border flex items-center justify-between gap-3 sm:gap-4 transition-all",
                        isMe 
                          ? "bg-neon-gold/10 border-neon-gold/60 shadow-[0_0_15px_rgba(255,215,0,0.15)]" 
                          : "bg-tactical-800/80 border-tactical-700 hover:border-tactical-600"
                      )}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        {/* Rank Place */}
                        <div className={clsx(
                          "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-rajdhani font-black text-base sm:text-xl shrink-0",
                          rankNum === 1 ? "bg-neon-gold text-black shadow-[0_0_10px_rgba(255,215,0,0.4)]" :
                          rankNum === 2 ? "bg-slate-300 text-black" :
                          rankNum === 3 ? "bg-amber-700 text-white" :
                          "bg-tactical-900 text-gray-400 border border-tactical-700"
                        )}>
                          #{rankNum}
                        </div>

                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <img 
                            src={typeof item.profile?.avatar === 'string' ? item.profile.avatar : '/images/avatar_3d.png'} 
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-tactical-600 object-cover bg-tactical-900"
                            alt={item.username}
                          />
                          <span className="absolute -bottom-1 -right-1 bg-black text-white text-[9px] font-bold px-1 rounded border border-tactical-600">
                            L{item.profile?.level || 1}
                          </span>
                        </div>

                        {/* User Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={clsx("font-rajdhani font-bold text-sm sm:text-lg truncate tracking-wider", isMe ? "text-neon-gold" : "text-white")}>
                              {item.username}
                            </span>
                            {isMe && <span className="bg-neon-gold text-black text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded font-rajdhani uppercase shrink-0">YOU</span>}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                            <span className={rankInfo.color}>{rankInfo.tier} {rankInfo.division}</span>
                          </div>
                        </div>
                      </div>

                      {/* EP & Rewards */}
                      <div className="text-right shrink-0">
                        <span className="block text-base sm:text-xl font-rajdhani font-bold text-neon-green">
                          {weeklyEp.toLocaleString()} <span className="text-xs font-normal text-gray-400">EP</span>
                        </span>
                        {rewardTag && (
                          <span className={clsx("text-[9px] sm:text-[10px] font-rajdhani font-bold uppercase px-2 py-0.5 rounded border inline-flex items-center gap-1 mt-0.5", rewardTag.color)}>
                            <span>{rewardTag.icon}</span> {rewardTag.label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};