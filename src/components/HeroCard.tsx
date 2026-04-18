import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from './GlassView';
import { DeltaPill } from './DeltaPill';
import { PuritySegmented } from './PuritySegmented';
import { useTokens } from '../theme/ThemeProvider';
import type { MetalQuote, Purity, Range } from '../types/metals';
import { formatINRPlain } from '../utils/format';

type Props = {
  quote: MetalQuote;
  range: Range;
  rangeDelta: { abs: number; pct: number } | null;
  purity: Purity;
  onPurityChange: (p: Purity) => void;
  showPurity: boolean;
};

function HeroCardBase({ quote, range, rangeDelta, purity, onPurityChange, showPurity }: Props) {
  const tokens = useTokens();
  const gradient = tokens.metalGradients[quote.symbol];
  const glow = tokens.metalGlow[quote.symbol];
  const glowFade = tokens.metalGlowFade[quote.symbol];

  return (
    <GlassView intensity="strong" borderRadius={tokens.radii.hero} style={styles.wrapper}>
      <View style={styles.content}>
        <View pointerEvents="none" style={styles.glowWrap}>
          <LinearGradient
            colors={[glow, glowFade]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0.2, y: 0.7 }}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.head}>
          <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.swatch} />
          <Text style={[styles.name, { color: tokens.colors.text }]}>{quote.name}</Text>
          <View style={[styles.chip, { backgroundColor: tokens.colors.glass, borderColor: tokens.colors.stroke }]}>
            <Text style={[styles.chipText, { color: tokens.colors.text2 }]}>
              {showPurity ? `${quote.symbol} · ${quote.purity}` : quote.symbol}
            </Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: tokens.colors.text }]}>
            {formatINRPlain(quote.price)}
          </Text>
          <Text style={[styles.unit, { color: tokens.colors.text2 }]}>/ per gram</Text>
        </View>

        <View style={styles.deltaRow}>
          <DeltaPill delta={rangeDelta} prefix={`${range} · `} size="md" />
        </View>

        {showPurity ? (
          <View style={styles.purityRow}>
            <PuritySegmented value={purity} onChange={onPurityChange} variant="gold" />
          </View>
        ) : null}
      </View>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  content: { padding: 20, gap: 8 },
  glowWrap: { position: 'absolute', top: -30, right: -30, width: 200, height: 200, opacity: 0.5 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  swatch: { width: 12, height: 12, borderRadius: 3 },
  name: { fontFamily: 'Inter-SemiBold', fontSize: 15 },
  chip: { marginLeft: 'auto', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  chipText: { fontFamily: 'IBMPlexMono', fontSize: 10, letterSpacing: 0.5 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 2 },
  price: { fontFamily: 'IBMPlexMono-SemiBold', fontSize: 40, letterSpacing: -0.8, lineHeight: 44 },
  unit: { fontFamily: 'Inter-Medium', fontSize: 13, marginBottom: 6 },
  deltaRow: { marginTop: 2 },
  purityRow: { marginTop: 6 },
});

export const HeroCard = memo(HeroCardBase);
