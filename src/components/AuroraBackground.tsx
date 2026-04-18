import { memo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';

type Props = { intensify?: 'XAU' | 'XAG' | 'XPT' | 'XPD' };

// Ambient canvas lighting — deliberately static. A drifting aurora was
// sampled by the BlurView on every frame, which read as a faint shimmer
// bleeding through card text. Static + low-opacity keeps the premium
// ambience without moving colour behind the glass.
function AuroraBase({ intensify }: Props) {
  const { tokens } = useTheme();
  const { width, height } = useWindowDimensions();

  const goldOpacity = intensify === 'XAU' ? 0.14 : 0.08;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[tokens.colors.bgMid, tokens.colors.bg, tokens.colors.bgDeep]}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="aurora-gold" cx="100%" cy="0%" r="70%">
            <Stop offset="0" stopColor={tokens.colors.gold} stopOpacity={goldOpacity} />
            <Stop offset="0.6" stopColor={tokens.colors.gold} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="aurora-violet" cx="0%" cy="100%" r="70%">
            <Stop offset="0" stopColor={tokens.colors.violet} stopOpacity={0.06} />
            <Stop offset="0.6" stopColor={tokens.colors.violet} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#aurora-gold)" />
        <Rect x="0" y="0" width={width} height={height} fill="url(#aurora-violet)" />
      </Svg>
    </View>
  );
}

export const AuroraBackground = memo(AuroraBase);
