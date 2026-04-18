import { useTheme } from '../theme/ThemeProvider';

export const useReducedMotion = () => useTheme().reducedMotion;
export const useReducedTransparency = () => useTheme().reducedTransparency;
