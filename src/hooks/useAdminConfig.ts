import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AIConfig } from '@/game/aiConfig';

function parseAdminConfig(value: unknown): AIConfig | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const cfg = value as Record<string, unknown>;
  if (!cfg.provider || cfg.model === undefined) return null;
  return { apiKey: '', baseUrl: '', ...cfg } as AIConfig;
}

export function useAdminConfig(): { config: AIConfig | null; loaded: boolean } {
  const [adminConfig, setAdminConfig] = useState<AIConfig | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('admin_config')
          .select('ai_config')
          .eq('id', 1)
          .maybeSingle();
        setAdminConfig(parseAdminConfig(data?.ai_config));
      } catch {
        // em caso de erro, libera o jogo mesmo assim
      } finally {
        setLoaded(true);
      }
    })();

    const channel = supabase
      .channel('admin_config_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'admin_config', filter: 'id=eq.1' },
        (payload) => {
          setAdminConfig(parseAdminConfig((payload.new as any)?.ai_config));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { config: adminConfig, loaded };
}
