import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
} from '@expo-google-fonts/ibm-plex-mono';
import { tokens, type Tokens } from './tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

type ThemeContextValue = {
  tokens: Tokens;
  reducedMotion: boolean;
  reducedTransparency: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({
  tokens,
  reducedMotion: false,
  reducedTransparency: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [fontsLoaded] = useFonts({
    Inter: Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    IBMPlexMono: IBMPlexMono_400Regular,
    'IBMPlexMono-Medium': IBMPlexMono_500Medium,
    'IBMPlexMono-SemiBold': IBMPlexMono_600SemiBold,
  });

  const [reducedMotion, setReducedMotion] = useState(false);
  const [reducedTransparency, setReducedTransparency] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(v => mounted && setReducedMotion(v));
    AccessibilityInfo.isReduceTransparencyEnabled?.().then?.(v => mounted && setReducedTransparency(v));
    const subMotion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    const subTransparency = AccessibilityInfo.addEventListener?.(
      'reduceTransparencyChanged' as never,
      setReducedTransparency as never,
    );
    return () => {
      mounted = false;
      subMotion.remove();
      subTransparency?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeContext.Provider value={{ tokens, reducedMotion, reducedTransparency }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

export function useTokens(): Tokens {
  return useContext(ThemeContext).tokens;
}
