import { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { clearUserData, getUserData, saveUserData } from '../idb';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        return userDocSnap.data().roles || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching user roles:", error);
      return [];
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const userRoles = await fetchUserRoles(authUser.uid);
        setRoles(userRoles);
        // Save user data to IndexedDB
        await saveUserData({ uid: authUser.uid, roles: userRoles });
      } else {
        setUser(null);
        setRoles([]);
        // Clear user data from IndexedDB
        await clearUserData();
      }
      setLoading(false);
    });

    // Check IndexedDB for cached user data on initial load
    const loadCachedUserData = async () => {
      const cachedUser = await getUserData();
      if (cachedUser) {
        setUser({ uid: cachedUser.uid });
        setRoles(cachedUser.roles);
      }
      setLoading(false);
    };

    loadCachedUserData();

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRoles([]);
    await clearUserData();
  };

  return { user, roles, loading, logout };
};
