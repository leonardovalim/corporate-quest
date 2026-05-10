import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// localStorage cache key includes a hash of the scene description so different
// descriptions produce different images for the same (encounter, phase).
const LS_PREFIX = 'pixel-art-cache:v2:';

function hashStr(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

function lsKey(encounterName: string, phase: number, description: string) {
  return `${LS_PREFIX}${encounterName}|${phase}|${hashStr(description)}`;
}

function readLocal(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(key: string, url: string) {
  try {
    localStorage.setItem(key, url);
  } catch {
    /* ignore quota */
  }
}

export function useEncounterPixelArt(
  encounterName: string | undefined,
  phase: number,
  description: string | undefined,
) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch when we have a scene description (= phase just ended).
    if (!encounterName || !description) {
      setImageUrl(null);
      setLoading(false);
      return;
    }

    const key = lsKey(encounterName, phase, description);

    // 1. localStorage (instant)
    const cached = readLocal(key);
    if (cached) {
      setImageUrl(cached);
      setLoading(false);
      return;
    }

    // 2. Edge function — embed description in encounterName so the edge
    //    function's cache key (encounter_name, phase) naturally dedupes
    //    per-scene, without needing a redeploy to accept a new param.
    const syntheticName = `${encounterName} — ${description}`.slice(0, 500);

    let cancelled = false;
    setLoading(true);
    setError(null);
    setImageUrl(null);

    supabase.functions
      .invoke('generate-pixel-art', {
        body: { encounterName: syntheticName, phase },
      })
      .then(({ data, error: fnErr }) => {
        if (cancelled) return;
        if (fnErr) {
          setError(fnErr.message);
          setLoading(false);
          return;
        }
        const url = (data as { imageUrl?: string } | null)?.imageUrl ?? null;
        if (url) {
          writeLocal(key, url);
          setImageUrl(url);
        } else {
          setError('No image returned');
        }
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message ?? 'Unknown error');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [encounterName, phase, description]);

  return { imageUrl, loading, error };
}
