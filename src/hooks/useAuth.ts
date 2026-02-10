import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export interface User {
  email: string;
  name: string;
  uid?: string;
  photoURL?: string;
}

export function useAuth(requireAuth = false) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. First, check localStorage for immediate (but potentially stale) session
    const localSession = localStorage.getItem('fp_session');
    if (localSession) {
      try {
        setUser(JSON.parse(localSession));
      } catch (e) {
        console.error("Error parsing local session", e);
      }
    }

    // 2. Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
          uid: firebaseUser.uid,
          photoURL: firebaseUser.photoURL || undefined
        };
        setUser(userData);
        // Update localStorage to keep it in sync
        localStorage.setItem('fp_session', JSON.stringify(userData));
      } else {
        // If no Firebase user, check if we still have a local session
        // This handles cases where Firebase might not be initialized yet
        if (!localStorage.getItem('fp_session')) {
          setUser(null);
          if (requireAuth) {
            router.push('/auth');
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [requireAuth, router]);

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('fp_session');
      setUser(null);
      router.push('/auth');
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  return { user, loading, logout };
}
