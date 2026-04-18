import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SYMBOLS, type Symbol } from '../types/metals';
import type { PrevSnapshot } from '../adapters/latest';

const STORAGE_KEY = 'metalwatch/prev-rates/v1';
const TWELVE_HOURS = 12 * 60 * 60 * 1000;

export function usePrevSnapshot(): {
  prev: PrevSnapshot | undefined;
  saveIfStale: (next: PrevSnapshot) => Promise<void>;
} {
  const [prev, setPrev] = useState<PrevSnapshot | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!mounted) return;
      if (!raw) return setPrev({});
      try {
        setPrev(JSON.parse(raw) as PrevSnapshot);
      } catch {
        setPrev({});
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const saveIfStale = async (next: PrevSnapshot): Promise<void> => {
    const existing = prev ?? {};
    const merged: PrevSnapshot = { ...existing };
    const now = Date.now();
    let changed = false;
    for (const s of SYMBOLS) {
      const incoming = next[s];
      const current = existing[s];
      if (!incoming) continue;
      if (!current || now - current.capturedAt >= TWELVE_HOURS) {
        merged[s] = incoming;
        changed = true;
      }
    }
    if (!changed) return;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    setPrev(merged);
  };

  return { prev, saveIfStale };
}
