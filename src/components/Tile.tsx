import { memo, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from './GlassView';
import { Sparkline } from './Sparkline';
import { DeltaPill } from './DeltaPill';
import { useTheme } from '../theme/ThemeProvider';
import type { ChartPoint, Direction, MetalQuote } from '../types/metals';
import { formatINRPlain, formatClockTime } from '../utils/format';
import { buildTileA11yLabel } from '../utils/a11y';
import { directionOf } from '../adapters/delta';

type Props = {
  quote: MetalQuote;
  sparkline?: ChartPoint[];
  sparklineDirection?: Direction;
  onPress: (q: MetalQuote) => void;
};

function arePropsEqual(prev: Props, next: Props) {
  return (
    prev.quote.symbol === next.quote.symbol &&
    prev.quote.price === next.quote.price &&
    prev.quote.purity === next.quote.purity &&
    prev.quote.updatedAt === next.quote.updatedAt &&
    (prev.quote.delta24h?.pct ?? null) === (next.quote.delta24h?.pct ?? null) &&
    prev.sparkline === next.sparkline &&
    prev.sparklineDirection === next.sparklineDirection &&
    prev.onPress === next.onPress
  );
}

function TileBase({ quote, sparkline, sparklineDirection, onPress }: Props) {
  const { tokens, reducedMotion } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => () => {
    scale.value = 1;
  }, [scale]);

  const gradient = tokens.metalGradients[quote.symbol];
  const glow = tokens.metalGlow[quote.symbol];
  const glowFade = tokens.metalGlowFade[quote.symbol];
  const deltaDir = directionOf(quote.delta24h);

  const hasRealSpark = !!(sparkline && sparkline.length >= 2);
  const sparkPoints: ChartPoint[] = hasRealSpark
    ? sparkline!
    : [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({
        t: i,
        v: deltaDir === 'loss' ? 10 - i * 0.6 : i * 0.6 + 1,
      }));
  const sparkDir: Direction = sparklineDirection ?? (hasRealSpark
    ? (sparkline![sparkline!.length - 1].v >= sparkline![0].v ? 'gain' : 'loss')
    : deltaDir);

  return (
    <Animated.View style={[styles.animatedWrapper, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={buildTileA11yLabel(quote)}
        onPressIn={() => {
          if (!reducedMotion) scale.value = withTiming(0.97, { duration: 120 });
        }}
        onPressOut={() => {
          if (!reducedMotion) scale.value = withTiming(1, { duration: 160 });
        }}
        onPress={() => onPress(quote)}
        style={styles.pressable}
      >
        <GlassView borderRadius={tokens.radii.tile} style={styles.tile}>
          <View style={styles.content}>
            <View pointerEvents="none" style={styles.glowWrap}>
              <LinearGradient
                colors={[glow, glowFade]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0.4, y: 0.6 }}
                style={StyleSheet.absoluteFill}
              />
            </View>

            <View style={styles.body}>
              <View style={styles.head}>
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.swatch}
                />
                <Text style={[styles.name, { color: tokens.colors.text }]}>{quote.name}</Text>
                <View style={[styles.chip, { backgroundColor: tokens.colors.glass, borderColor: tokens.colors.stroke }]}>
                  <Text style={[styles.chipText, { color: tokens.colors.text2 }]}>{quote.symbol}</Text>
                </View>
              </View>
              <Text style={[styles.price, { color: tokens.colors.text }]}>
                {formatINRPlain(quote.price)}
              </Text>
              <Text style={[styles.purity, { color: tokens.colors.text2 }]}>
                per gram{quote.symbol === 'XAU' ? ` · ${quote.purity}` : ''}
              </Text>
              <View style={styles.deltaRow}>
                <DeltaPill delta={quote.delta24h} />
              </View>
              <Sparkline data={sparkPoints} direction={sparkDir} height={40} />
              <Text style={[styles.ts, { color: tokens.colors.muted }]}>UPDATED {formatClockTime(quote.updatedAt)}</Text>
            </View>
          </View>
        </GlassView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedWrapper: { flex: 1 },
  pressable: { flex: 1 },
  tile: { aspectRatio: 1 / 1.05 },
  content: { flex: 1, overflow: 'hidden' },
  glowWrap: { position: 'absolute', top: -20, right: -20, width: 140, height: 140, opacity: 0.5 },
  body: { flex: 1, paddingLeft: 14, paddingRight: 12, paddingTop: 12, paddingBottom: 10, gap: 4 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swatch: { width: 12, height: 12, borderRadius: 3 },
  name: { fontFamily: 'Inter-SemiBold', fontSize: 14 },
  chip: { marginLeft: 'auto', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  chipText: { fontFamily: 'IBMPlexMono', fontSize: 10, letterSpacing: 0.5 },
  price: { fontFamily: 'IBMPlexMono-SemiBold', fontSize: 22, letterSpacing: -0.3, marginTop: 2 },
  purity: { fontFamily: 'Inter-Medium', fontSize: 11 },
  deltaRow: { marginTop: 2 },
  ts: { fontFamily: 'Inter-Medium', fontSize: 10, letterSpacing: 1, marginTop: 2 },
});

export const Tile = memo(TileBase, arePropsEqual);
