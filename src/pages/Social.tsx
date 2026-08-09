import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { searchUsersByUsername, sendFriendRequest, getPendingRequests, respondToRequest, getFriendsProfiles, removeFriend } from '../services/socialService';
import { Search, UserPlus, Check, X, Users, Trophy, Activity, Flame, Shield, Crosshair } from 'lucide-react';
import type { FriendRequest } from '../types';
import { getRankInfo } from '../utils/rankUtils';
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
  const [activeTab, setActiveTab] = useState<'lobby' | 'roster'>('lobby');

  const currentUid = user?.uid;

  const loadSocialData = async () => {
    if (!currentUid) return;
    try {
      setIsLoading(true);
      const [requests, friends] = await Promise.all([
        getPendingRequests(currentUid),
        getFriendsProfiles(profile.friends || [])
      ]);
      setPendingRequests(requests);
      setFriendsProfiles(friends);
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
          onClick={() => setActiveTab('lobby')}
          className={clsx(
            "flex-1 py-3 px-2 sm:px-4 rounded-lg font-rajdhani font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 text-sm sm:text-base",
            activeTab === 'lobby' ? "bg-neon-blue text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]" : "text-gray-400 hover:text-white hover:bg-tactical-800"
          )}
        >
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">HQ</span> Lobby
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

      {activeTab === 'lobby' ? (
         <div className="space-y-6 animate-fade-in-up">
            {/* Top Half: Ranked Ladder */}
            <div className="esports-panel p-6 border-t-4 border-neon-gold relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-neon-gold/5 to-transparent pointer-events-none"></div>
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                 <h2 className="text-2xl font-rajdhani font-bold text-white uppercase tracking-wider flex items-center gap-2">
                   <Trophy className="w-6 h-6 text-neon-gold" /> Weekly Ranked Ladder
                 </h2>
                 <span className="text-xs text-gray-500 font-mono border border-tactical-700 bg-tactical-900 px-3 py-1 rounded-full">RESETS IN: 2D 14H</span>
               </div>
               
               <div className="flex items-end justify-center gap-2 sm:gap-6 mt-4 mb-2 relative z-10 px-2">
                  {[
                     { place: 2, height: 'h-24 sm:h-32', color: 'bg-tactical-700', text: 'text-gray-300', friend: [...friendsProfiles].sort((a,b)=> (b.profile?.level||0) - (a.profile?.level||0))[1] },
                     { place: 1, height: 'h-32 sm:h-40', color: 'bg-neon-gold', text: 'text-black', friend: [...friendsProfiles].sort((a,b)=> (b.profile?.level||0) - (a.profile?.level||0))[0] },
                     { place: 3, height: 'h-20 sm:h-24', color: 'bg-tactical-800', text: 'text-amber-700', friend: [...friendsProfiles].sort((a,b)=> (b.profile?.level||0) - (a.profile?.level||0))[2] }
                  ].map((podium) => (
                    <div key={podium.place} className="flex flex-col items-center w-full max-w-[120px]">
                       {podium.friend ? (
                         <div className="flex flex-col items-center mb-3">
                           <div className="relative mb-2">
                             <img src={typeof podium.friend.profile?.avatar === 'string' ? podium.friend.profile.avatar : '/images/avatar_3d.png'} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-tactical-500 object-cover bg-tactical-800 shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
                             <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded border border-tactical-600 whitespace-nowrap">LVL {podium.friend.profile?.level||1}</span>
                           </div>
                           <span className="font-rajdhani font-bold text-white truncate w-full text-center tracking-wider text-xs sm:text-sm px-1">{podium.friend.username}</span>
                         </div>
                       ) : (
                         <div className="flex flex-col items-center mb-3 opacity-30">
                           <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-tactical-500 mb-2 flex items-center justify-center">
                              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                           </div>
                           <span className="font-rajdhani font-bold text-white tracking-wider text-xs sm:text-sm">Empty</span>
                         </div>
                       )}
                       <div className={clsx("w-full rounded-t-xl flex items-start justify-center pt-2 font-black text-xl sm:text-2xl shadow-inner", podium.height, podium.color, podium.text)}>
                         #{podium.place}
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Bottom Half: Activity Feed */}
            <div className="esports-panel p-6 border-l-4 border-neon-purple relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-transparent pointer-events-none"></div>
               <h2 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-6 relative z-10 border-b border-tactical-800 pb-4">
                 <Activity className="w-5 h-5 text-neon-purple" /> Network Highlights
               </h2>
               
               <div className="space-y-3 relative z-10">
                  <div className="bg-tactical-900/80 border border-tactical-800 rounded-lg p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:border-neon-purple/50 transition-colors group">
                     <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-neon-purple/10 flex items-center justify-center shrink-0 border border-neon-purple/30 group-hover:bg-neon-purple/20 group-hover:shadow-[0_0_10px_rgba(176,38,255,0.2)] transition-all">
                       <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-neon-purple" />
                     </div>
                     <div className="flex-1">
                        <p className="font-inter text-xs sm:text-sm text-gray-300">
                          <strong className="text-white font-rajdhani tracking-wider text-sm sm:text-base uppercase">AURA_FIT</strong> achieved an <span className="text-neon-purple font-bold">S+ Grade</span> on Leg Day!
                        </p>
                        <span className="text-[9px] sm:text-[10px] text-gray-500 font-mono mt-1 block">2 HOURS AGO</span>
                     </div>
                     <button className="p-2 bg-tactical-800 hover:bg-tactical-700 rounded-lg transition-colors border border-tactical-600 text-lg sm:text-xl grayscale hover:grayscale-0" title="Hype">👊</button>
                  </div>
                  
                  <div className="bg-tactical-900/80 border border-tactical-800 rounded-lg p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:border-neon-gold/50 transition-colors group">
                     <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-neon-gold/10 flex items-center justify-center shrink-0 border border-neon-gold/30 group-hover:bg-neon-gold/20 group-hover:shadow-[0_0_10px_rgba(255,215,0,0.2)] transition-all">
                       <Crosshair className="w-4 h-4 sm:w-5 sm:h-5 text-neon-gold" />
                     </div>
                     <div className="flex-1">
                        <p className="font-inter text-xs sm:text-sm text-gray-300">
                          <strong className="text-white font-rajdhani tracking-wider text-sm sm:text-base uppercase">IRON_WOLF</strong> hit a new PR: <span className="text-neon-gold font-bold">315 lbs</span> on Bench Press!
                        </p>
                        <span className="text-[9px] sm:text-[10px] text-gray-500 font-mono mt-1 block">5 HOURS AGO</span>
                     </div>
                     <button className="p-2 bg-tactical-800 hover:bg-tactical-700 rounded-lg transition-colors border border-tactical-600 text-lg sm:text-xl grayscale hover:grayscale-0" title="Hype">👊</button>
                  </div>
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
    </div>
  );
};