import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { searchUsersByUsername, sendFriendRequest, getPendingRequests, respondToRequest, getFriendsProfiles } from '../services/socialService';
import { Search, UserPlus, Check, X, Users, Dumbbell } from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in pb-24">
      {/* Header */}
      <div className="esports-panel flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-neon-blue/20 flex items-center justify-center border border-neon-blue/50">
          <Users className="w-6 h-6 text-neon-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-black italic tracking-tight text-white uppercase">Social</h1>
          <p className="text-gray-400 text-sm">Find friends, compare ranks, and dominate together.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Friends List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="esports-panel space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wider">Your Friends</h2>
            
            {friendsProfiles.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No friends yet. Search for agents to add!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {friendsProfiles.map(friend => {
                  const rankInfo = getRankInfo(friend.level);
                  return (
                    <div key={friend.uid} className="bg-dark-bg p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center gap-4">
                      {friend.avatar && (
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.avatar.seed}`} alt="Avatar" className="w-12 h-12 rounded-full bg-gray-800" />
                      )}
                      
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-bold text-lg">{friend.username}</h3>
                        <p className="text-sm text-gray-400">Level {friend.level} • {rankInfo.tier} {rankInfo.division}</p>
                      </div>

                      {friend.recentWorkout && (
                        <div className="flex items-center gap-2 text-xs bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                          <Dumbbell className="w-4 h-4 text-gray-400" />
                          <div className="flex flex-col">
                            <span className="text-gray-400 truncate max-w-[120px]">{friend.recentWorkout.name}</span>
                            <span className={clsx("font-bold", friend.recentWorkout.grade?.includes('S') ? "text-yellow-400" : "text-neon-blue")}>
                              Grade: {friend.recentWorkout.grade || 'N/A'}
                            </span>
                          </div>
                        </div>
                      )}
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
            <h2 className="text-xl font-bold uppercase tracking-wider flex items-center justify-between">
              Requests
              {pendingRequests.length > 0 && (
                <span className="bg-neon-red text-white text-xs px-2 py-1 rounded-full">{pendingRequests.length}</span>
              )}
            </h2>
            
            {pendingRequests.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No pending requests</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(req => (
                  <div key={req.id} className="bg-dark-bg p-3 rounded-lg border border-white/5 flex items-center justify-between">
                    <span className="font-bold text-sm truncate max-w-[100px]">{req.fromUsername}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleRespond(req.id, req.fromUid, true)} className="p-2 bg-neon-green/20 hover:bg-neon-green/40 text-neon-green rounded-lg transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRespond(req.id, req.fromUid, false)} className="p-2 bg-neon-red/20 hover:bg-neon-red/40 text-neon-red rounded-lg transition-colors">
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
            <h2 className="text-xl font-bold uppercase tracking-wider">Search Agents</h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Username" 
                className="esports-input flex-1"
              />
              <button type="submit" disabled={isSearching} className="esports-button flex items-center justify-center p-3">
                <Search className="w-5 h-5" />
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="space-y-3 mt-4">
                {searchResults.map(res => (
                  <div key={res.uid} className="bg-dark-bg p-3 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">{res.username}</h4>
                      <p className="text-xs text-gray-400">Level {res.level} {res.rank}</p>
                    </div>
                    {profile.friends?.includes(res.uid) ? (
                      <span className="text-xs text-gray-500 italic">Friends</span>
                    ) : (
                      <button onClick={() => handleSendRequest(res.uid)} className="p-2 bg-neon-blue/20 hover:bg-neon-blue/40 text-neon-blue rounded-lg transition-colors">
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
