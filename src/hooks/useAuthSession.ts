import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface ProfileLite {
  full_name: string | null;
  email: string | null;
}

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileLite | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const refreshProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      let { data } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .maybeSingle();

      // Auto-create minimal profile row if missing (e.g. magic link login w/o cadastro)
      if (!data) {
        const sessionRes = await supabase.auth.getUser();
        const u = sessionRes.data.user;
        if (u && u.id === userId) {
          const { data: inserted, error: insErr } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: u.email ?? '',
              full_name: (u.user_metadata as any)?.full_name ?? (u.email?.split('@')[0] ?? 'Player'),
              phone: '',
              company_name: '',
            })
            .select('full_name, email')
            .maybeSingle();

          if (insErr) {
            // Conflict (23505): row was created concurrently by ProfilePersistor — just refetch
            if (insErr.code === '23505') {
              const { data: refetched } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', userId)
                .maybeSingle();
              data = refetched;
            } else {
              console.warn('[useAuthSession] auto-create profile failed:', insErr.message);
            }
          } else {
            data = inserted;
          }
        }
      }

      setProfile((data as ProfileLite) ?? null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // Subscribe FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (!sess?.user) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }
      // Mark profile as loading synchronously so HomeScreen doesn't flash "NOVO JOGO"
      setProfileLoading(true);
      // Defer actual Supabase call to avoid deadlock in auth callback
      setTimeout(() => {
        refreshProfile(sess.user.id);
      }, 0);
    });

    // Then check existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      if (data.session?.user) {
        setProfileLoading(true);
        refreshProfile(data.session.user.id);
      } else {
        setProfileLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, user, profile, loading, profileLoading, signOut, refreshProfile };
}
