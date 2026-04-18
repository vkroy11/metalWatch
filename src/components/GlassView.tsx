import { memo, type ReactNode } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  intensity?: 'normal' | 'strong';
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
  children?: ReactNode;
};

// `dimezisBlurView` is expo-blur's cross-version Android renderer. Without it,
// blur on Android < API 31 was falling back to an opaque rectangle — the
// "visible box" the user was seeing. iOS ignores the prop.
const androidBlurMethod = Platform.OS === 'android' ? 'dimezisBlurView' : 'none';

function GlassViewBase({ intensity = 'normal', borderRadius = 20, style, children }: Props) {
  const { tokens, reducedTransparency } = useTheme();

  const baseStyle: ViewStyle = {
    borderRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: intensity === 'strong' ? tokens.colors.strokeStrong : tokens.colors.stroke,
    overflow: 'hidden',
    backgroundColor: reducedTransparency
      ? tokens.colors.fallback
      : intensity === 'strong'
        ? tokens.colors.glassStrong
        : tokens.colors.glass,
    ...(intensity === 'strong' ? tokens.shadow.heroCard : tokens.shadow.card),
  };

  if (reducedTransparency) {
    return <View style={[baseStyle, style]}>{children}</View>;
  }

  return (
    <View style={[baseStyle, style]}>
      <BlurView
        intensity={intensity === 'strong' ? 50 : 40}
        tint="dark"
        experimentalBlurMethod={androidBlurMethod}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

export const GlassView = memo(GlassViewBase);
