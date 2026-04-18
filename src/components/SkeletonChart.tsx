import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from './GlassView';
import { useTheme } from '../theme/ThemeProvider';

function SkeletonChartBase() {
  const { tokens, reducedMotion } = useTheme();
  const x = useSharedValue(-1);

  useEffect(() => {
    if (reducedMotion) return;
    x.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
      -1,
      false,
    );
  }, [x, reducedMotion]);

  const sheenStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value * 300 }],
    opacity: reducedMotion ? 0 : 0.6,
  }));

  return (
    <GlassView borderRadius={tokens.radii.card} style={styles.wrapper}>
      <View style={styles.inner}>
        <View style={[styles.line, { backgroundColor: tokens.colors.glass }]} />
        <View style={[styles.line, { backgroundColor: tokens.colors.glass, marginTop: 18 }]} />
        <View style={[styles.line, { backgroundColor: tokens.colors.glass, marginTop: 18 }]} />
        <View style={[styles.line, { backgroundColor: tokens.colors.glass, marginTop: 18 }]} />
      </View>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, sheenStyle]}>
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  wrapper: { height: 240, overflow: 'hidden' },
  inner: { padding: 16 },
  line: { height: 1, opacity: 0.6 },
});

export const SkeletonChart = memo(SkeletonChartBase);
