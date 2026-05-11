import { useEffect } from 'react';
import { useAuthSession } from './useAuthSession';

declare global {
  interface Window {
    Canny?: (command: string, options?: Record<string, any>) => void;
  }
}

export function useCanny() {
  const { user, profile } = useAuthSession();

  useEffect(() => {
    // Only identify if user is logged in and Canny SDK is loaded
    if (!user || !window.Canny) return;

    try {
      window.Canny('identify', {
        appID: '6a0120f243ad74567395e2a4',
        user: {
          email: user.email || '',
          name: profile?.full_name || user.email || 'Anonymous',
          id: user.id,
          avatarURL: profile?.avatar_url || undefined,
          created: new Date(user.created_at || new Date()).toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to identify user in Canny:', error);
    }
  }, [user?.id, user?.email, profile?.full_name, profile?.avatar_url, user?.created_at]);
}
