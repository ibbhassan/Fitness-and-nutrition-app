import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { FriendRequest } from '../types';

export const searchUsersByUsername = async (username: string, currentUid: string) => {
  if (!username.trim()) return [];
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  
  const results: any[] = [];
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (docSnap.id !== currentUid && data.profile && data.user) {
      if (data.user.username?.toLowerCase().includes(username.toLowerCase())) {
        results.push({
          uid: docSnap.id,
          username: data.user.username,
          level: data.profile.level,
          rank: data.profile.rank,
          avatar: data.profile.avatar,
        });
      }
    }
  });
  return results;
};

export const sendFriendRequest = async (fromUid: string, fromUsername: string, toUid: string) => {
  const reqsRef = collection(db, 'friendRequests');
  const q = query(reqsRef, where('fromUid', '==', fromUid), where('toUid', '==', toUid), where('status', '==', 'pending'));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    throw new Error('Friend request already sent.');
  }

  const qReverse = query(reqsRef, where('fromUid', '==', toUid), where('toUid', '==', fromUid), where('status', '==', 'pending'));
  const snapshotReverse = await getDocs(qReverse);
  if (!snapshotReverse.empty) {
    throw new Error('This user already sent you a friend request!');
  }

  await addDoc(reqsRef, {
    fromUid,
    fromUsername,
    toUid,
    status: 'pending',
    timestamp: Date.now(),
  });
};

export const getPendingRequests = async (uid: string): Promise<FriendRequest[]> => {
  const reqsRef = collection(db, 'friendRequests');
  const q = query(reqsRef, where('toUid', '==', uid), where('status', '==', 'pending'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  } as FriendRequest));
};

export const respondToRequest = async (requestId: string, currentUid: string, senderUid: string, accept: boolean) => {
  const reqRef = doc(db, 'friendRequests', requestId);
  await updateDoc(reqRef, {
    status: accept ? 'accepted' : 'rejected'
  });

  if (accept) {
    const currentUserRef = doc(db, 'users', currentUid);
    const senderUserRef = doc(db, 'users', senderUid);

    await updateDoc(currentUserRef, {
      'profile.friends': arrayUnion(senderUid)
    });
    
    await updateDoc(senderUserRef, {
      'profile.friends': arrayUnion(currentUid)
    });
  }
};

export const getFriendsProfiles = async (friendUids: string[]) => {
  if (!friendUids || friendUids.length === 0) return [];
  
  const profiles: any[] = [];
  for (const uid of friendUids) {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.profile && data.user) {
        profiles.push({
          uid,
          username: data.user.username,
          profile: data.profile,
          recentWorkout: data.workoutHistory?.length > 0 ? data.workoutHistory[data.workoutHistory.length - 1] : null
        });
      }
    }
  }
  return profiles;
};

export const removeFriend = async (currentUid: string, targetUid: string) => {
  const currentUserRef = doc(db, 'users', currentUid);
  const targetUserRef = doc(db, 'users', targetUid);

  await updateDoc(currentUserRef, {
    'profile.friends': arrayRemove(targetUid)
  });
  
  await updateDoc(targetUserRef, {
    'profile.friends': arrayRemove(currentUid)
  });
};
