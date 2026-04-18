import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from './GlassView';
import { useTheme } from '../theme/ThemeProvider';

function SkeletonTileBase() {
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
    transform: [{ translateX: x.value * 200 }],
    opacity: reducedMotion ? 0 : 0.6,
  }));

  return (
    <GlassView borderRadius={tokens.radii.tile} style={styles.tile}>
      <View style={styles.inner}>
        <View style={[styles.line, styles.w40, { backgroundColor: tokens.colors.glass }]} />
        <View style={[styles.line, styles.h24, styles.w60, { backgroundColor: tokens.colors.glass, marginTop: 8 }]} />
        <View style={[styles.line, styles.w30, { backgroundColor: tokens.colors.glass, marginTop: 6 }]} />
        <View style={[styles.line, styles.w80, styles.spark, { backgroundColor: tokens.colors.glass, marginTop: 8 }]} />
        <View style={[styles.line, styles.w30, { backgroundColor: tokens.colors.glass, marginTop: 8 }]} />
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
  tile: { aspectRatio: 1 / 1.05, overflow: 'hidden' },
  inner: { padding: 14, gap: 2, flex: 1 },
  line: { height: 10, borderRadius: 4 },
  h24: { height: 22 },
  spark: { height: 36 },
  w30: { width: '35%' },
  w40: { width: '45%' },
  w60: { width: '55%' },
  w80: { width: '100%' },
});

export const SkeletonTile = memo(SkeletonTileBase);
