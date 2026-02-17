import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface GuestUser {
  id: string;
  email: string;
  display_name: string;
}

interface AuthContextType {
  user: User | null;
  guestUser: GuestUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  signInAsGuest: (email: string, displayName?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [guestUser, setGuestUser] = useState<GuestUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved guest session
    const savedGuest = localStorage.getItem('guestUser');
    if (savedGuest) {
      try {
        setGuestUser(JSON.parse(savedGuest));
      } catch {}
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInAsGuest = (email: string, displayName?: string) => {
    const guest: GuestUser = {
      id: `guest-${Date.now()}`,
      email,
      display_name: displayName || email.split('@')[0],
    };
    setGuestUser(guest);
    localStorage.setItem('guestUser', JSON.stringify(guest));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setGuestUser(null);
    localStorage.removeItem('guestUser');
  };

  const isAuthenticated = !!user || !!guestUser;

  return (
    <AuthContext.Provider value={{ user, guestUser, isAuthenticated, loading, signOut, signInAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}