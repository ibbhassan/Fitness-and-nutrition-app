import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { searchUsersByUsername, sendFriendRequest, getPendingRequests, respondToRequest, getFriendsProfiles, removeFriend } from '../services/socialService';
import { Search, UserPlus, UserMinus, Check, X, Users, Dumbbell } from 'lucide-react';
import type { FriendRequest } from '../types';
import { getRankInfo } from '../utils/rankUtils';
import clsx from 'clsx';

export const Social: React.FC = () => {
  const { user, profile } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [friendsProfiles, setFriendsProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in pb-24">
      <div className="esports-panel flex items-center gap-4 border-l-4 border-neon-blue relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-transparent pointer-events-none"></div>
        <div className="w-12 h-12 rounded-xl bg-tactical-800 flex items-center justify-center border border-neon-blue/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <Users className="w-6 h-6 text-neon-blue" />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-rajdhani font-bold tracking-widest text-white uppercase">Friends List</h1>
          <p className="text-gray-400 text-sm font-inter">Manage your roster, compare ranks, and dominate together.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Friends List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="esports-panel space-y-4">
            <h2 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-tactical-700 pb-4">
              <Users className="w-5 h-5 text-neon-blue" /> Your Friends
            </h2>
            
            {friendsProfiles.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-tactical-900 border border-tactical-700 rounded-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-rajdhani uppercase tracking-wider text-sm">No friends yet</p>
                <p className="text-xs mt-1 text-gray-500">Search for agents to add to your roster!</p>
              </div>
            ) : (
              <div className="space-y-4 mt-2">
                {friendsProfiles.map(friend => {
                  const rankInfo = getRankInfo(friend.level);
                  return (
                    <div key={friend.uid} className="bg-tactical-900 p-0 rounded-xl border border-tactical-700 flex flex-col sm:flex-row items-center gap-4 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(0,240,255,0.15)] transition-all relative overflow-hidden group">
                      {/* Rank-colored left border & gradient background */}
                      <div className="absolute left-0 top-0 bottom-0 w-2 z-20" style={{backgroundColor: rankInfo.color}}></div>
                      <div className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20 pointer-events-none" style={{ background: `linear-gradient(90deg, ${rankInfo.color}, transparent)` }}></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"></div>
                      
                      <div className="flex items-center gap-4 p-4 pl-6 relative z-30 w-full sm:w-auto">
                        {/* Avatar & Level Badge */}
                        <div className="relative shrink-0">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.avatar?.seed || friend.username}`} alt="Avatar" className="w-16 h-16 rounded-full bg-tactical-800 border-2 border-tactical-600 shadow-lg" />
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded border border-tactical-900 flex items-center justify-center shadow-md whitespace-nowrap" style={{backgroundColor: rankInfo.color}}>
                            <span className="text-[10px] font-black text-black">LVL {friend.level || 1}</span>
                          </div>
                        </div>
                        
                        <div className="flex-1 text-left">
                          <h3 className="font-rajdhani font-bold text-xl text-white uppercase tracking-wider drop-shadow-md">{friend.username}</h3>
                          
                          {/* Rank Display with Crest */}
                          <div className="flex items-center gap-2 mt-1">
                            <img src={rankInfo.crestUrl} alt={rankInfo.tier} className="w-5 h-5 object-contain" />
                            <p className="text-sm font-bold uppercase tracking-wider drop-shadow-md" style={{color: rankInfo.color}}>{rankInfo.tier} {rankInfo.division}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right Side Stats / Actions */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 p-4 sm:ml-auto relative z-30 w-full sm:w-auto border-t sm:border-t-0 border-tactical-700 bg-black/20">
                        {friend.recentWorkout ? (
                          <div className="flex items-center gap-3 text-xs">
                            <div className="w-10 h-10 rounded-lg bg-tactical-800 border border-tactical-600 flex items-center justify-center">
                              <Dumbbell className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-400 font-inter text-[10px] uppercase tracking-wider">Last Mission</span>
                              <span className="text-white font-rajdhani font-bold truncate max-w-[120px]">{friend.recentWorkout.name}</span>
                              <span className={clsx("font-black font-rajdhani text-sm tracking-widest", friend.recentWorkout.grade?.includes('S') ? "text-neon-gold drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]" : "text-neon-blue")}>
                                {friend.recentWorkout.grade || 'N/A'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-xs opacity-50">
                            <div className="w-10 h-10 rounded-lg bg-tactical-800 border border-tactical-600 flex items-center justify-center">
                              <Dumbbell className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-500 font-inter text-[10px] uppercase tracking-wider">Last Mission</span>
                              <span className="text-gray-400 font-rajdhani font-bold">No Intel</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="sm:ml-4 sm:pl-4 sm:border-l border-tactical-700">
                          <button 
                            onClick={() => handleRemoveFriend(friend.uid, friend.username)} 
                            className="p-2.5 text-gray-500 hover:text-neon-red bg-tactical-800 border border-transparent hover:border-neon-red/30 rounded-lg transition-all hover:bg-neon-red/10 group-hover:shadow-[0_0_10px_rgba(255,0,0,0.1)]"
                            title="Remove Friend"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Search & Requests */}
        <div className="space-y-6">
          
          {/* Friend Requests */}
          <div className="esports-panel space-y-4">
            <h2 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider flex items-center justify-between border-b border-tactical-700 pb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-neon-gold" /> Requests
              </div>
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

          {/* Search Users */}
          <div className="esports-panel space-y-4">
            <h2 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-tactical-700 pb-4">
              <Search className="w-5 h-5 text-neon-blue" /> Search Agents
            </h2>
            <form onSubmit={handleSearch} className="flex gap-2 mt-2">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Username" 
                className="flex-1 bg-tactical-900 border border-tactical-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all font-inter"
              />
              <button type="submit" disabled={isSearching} className="bg-neon-blue text-black font-bold p-3 rounded-lg hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(0,240,255,0.6)] transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)] flex items-center justify-center">
                <Search className="w-5 h-5" />
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="space-y-3 mt-4">
                {searchResults.map(res => (
                  <div key={res.uid} className="bg-tactical-900 p-3 rounded-lg border border-tactical-700 flex items-center justify-between group hover:border-neon-blue/50 transition-colors">
                    <div>
                      <h4 className="font-rajdhani font-bold text-sm tracking-wider uppercase text-white">{res.username}</h4>
                      <p className="text-xs text-gray-400 font-inter">Level {res.level} • {res.rank}</p>
                    </div>
                    {profile.friends?.includes(res.uid) ? (
                      <span className="text-xs text-neon-green font-bold bg-neon-green/10 px-2 py-1 rounded border border-neon-green/30">FRIENDS</span>
                    ) : (
                      <button onClick={() => handleSendRequest(res.uid)} className="p-2 bg-tactical-800 border border-neon-blue/30 text-neon-blue rounded-lg transition-all hover:bg-neon-blue hover:text-black hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                        <UserPlus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};
