import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  email: string;
  name: string;
}

export function useAuth(requireAuth = false) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('fp_session');
    if (session) {
      setUser(JSON.parse(session));
    } else if (requireAuth) {
      router.push('/auth');
    }
    setLoading(false);
  }, [requireAuth, router]);

  const logout = () => {
    localStorage.removeItem('fp_session');
    setUser(null);
    router.push('/auth');
  };

  return { user, loading, logout };
}
