import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/game/GameContext';

const STORAGE_KEY = 'supportModalLastShown';
const MIN_DELAY_MS = 5 * 60 * 1000;   // 5 min
const MAX_DELAY_MS = 10 * 60 * 1000;  // 10 min
const COOLDOWN_MS = MIN_DELAY_MS;     // min gap across reloads
const ONBOARDING_DEFER_MS = 60 * 1000;

function randomDelay() {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

export function useSupportPrompt() {
  const { screen } = useGame();
  const [open, setOpen] = useState(false);
  const screenRef = useRef(screen);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    const schedule = (delay: number) => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(trigger, delay);
    };

    const trigger = () => {
      if (screenRef.current === 'onboarding') {
        schedule(ONBOARDING_DEFER_MS);
        return;
      }
      setOpen(true);
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        // ignore
      }
    };

    // Dev/test override: ?apoio or ?support opens modal imediatamente
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('apoio') || params.has('support')) {
        setOpen(true);
        return;
      }
    } catch {
      // ignore
    }

    // Respect cooldown across reloads
    let initialDelay = randomDelay();
    try {
      const last = Number(localStorage.getItem(STORAGE_KEY) || 0);
      const elapsed = Date.now() - last;
      if (last && elapsed < COOLDOWN_MS) {
        initialDelay = Math.max(initialDelay, COOLDOWN_MS - elapsed);
      }
    } catch {
      // ignore
    }

    schedule(initialDelay);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (screenRef.current === 'onboarding') {
        timerRef.current = window.setTimeout(() => setOpen(true), ONBOARDING_DEFER_MS);
      } else {
        setOpen(true);
        try {
          localStorage.setItem(STORAGE_KEY, String(Date.now()));
        } catch {
          // ignore
        }
      }
    }, randomDelay());
  };

  return { open, close };
}
