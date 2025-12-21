import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { UserSettings } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Partial<UserSettings> | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signInWithProvider: (provider: 'google' | 'discord') => Promise<{ error: any }>;
  loginAsGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Partial<UserSettings> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setIsGuest(false);
        await fetchProfile(session.user.id);
      } else if (!isGuest) {
        // Only clear profile if not switching to guest mode manually
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isGuest]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        setProfile({
            name: data.full_name || data.email?.split('@')[0] || 'Student',
            email: data.email,
            theme: data.theme_mode || 'dark',
            learningStyle: data.learning_style || 'visual',
            cardsPerDay: 20, 
            accessibility: { fontScale: 1, reduceMotion: false }
        });
      }
    } catch (e) {
      console.error('Error fetching profile', e);
    }
  };

  const signIn = async (email: string) => {
    return await supabase.auth.signInWithOtp({ email });
  };

  const signUp = async (email: string, password: string) => {
      return await supabase.auth.signUp({ email, password });
  };

  const signInWithProvider = async (provider: 'google' | 'discord') => {
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const loginAsGuest = () => {
      setIsGuest(true);
      const guestUser = {
          id: 'guest',
          email: 'guest@pnle.com',
          user_metadata: { full_name: 'Guest User' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
      } as User;
      
      setUser(guestUser);
      setProfile({
          name: 'Guest User',
          email: 'guest@pnle.com',
          theme: 'dark',
          learningStyle: 'visual',
          cardsPerDay: 10,
          accessibility: { fontScale: 1, reduceMotion: false }
      });
  };

  const signOut = async () => {
    if (isGuest) {
        setIsGuest(false);
        setUser(null);
        setProfile(null);
    } else {
        await supabase.auth.signOut();
        setProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, isGuest, signIn, signUp, signInWithProvider, loginAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};