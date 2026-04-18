import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { NavBar } from '../../src/components/NavBar';
import { HeroCard } from '../../src/components/HeroCard';
import { PriceChart } from '../../src/components/PriceChart';
import { RangeChips } from '../../src/components/RangeChips';
import { StatStrip } from '../../src/components/StatStrip';
import { SkeletonChart } from '../../src/components/SkeletonChart';
import { usePricesQuery } from '../../src/hooks/usePricesQuery';
import { useTimeSeriesQuery } from '../../src/hooks/useTimeSeriesQuery';
import { usePurity, useSetPurity } from '../../src/hooks/usePurity';
import { useTokens } from '../../src/theme/ThemeProvider';
import { computeRangeDelta, directionOf, rangeStats } from '../../src/adapters/delta';
import { SYMBOLS, METAL_NAMES, type Range, type Symbol } from '../../src/types/metals';
import { format } from 'date-fns';

export default function DetailScreen() {
  const tokens = useTokens();
  const router = useRouter();
  const params = useLocalSearchParams<{ symbol: string }>();
  const symbol = (SYMBOLS.includes(params.symbol as Symbol) ? params.symbol : 'XAU') as Symbol;

  const purity = usePurity();
  const setPurity = useSetPurity();
  const [range, setRange] = useState<Range>('1W');

  const prices = usePricesQuery();
  const ts = useTimeSeriesQuery(symbol, range);

  const quote = useMemo(
    () => prices.quotes?.find((q) => q.symbol === symbol),
    [prices.quotes, symbol],
  );

  const rangeDelta = useMemo(
    () => (ts.points ? computeRangeDelta(ts.points) : null),
    [ts.points],
  );
  const stats = useMemo(
    () => (ts.points ? rangeStats(ts.points) : null),
    [ts.points],
  );
  const dir = directionOf(rangeDelta);

  const title = `${METAL_NAMES[symbol]} · ${symbol}`;
  const updatedAt = prices.dataUpdatedAt;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <View style={styles.container}>
        <NavBar title={title} onBack={router.back} />

        {quote ? (
          <HeroCard
            quote={quote}
            range={range}
            rangeDelta={rangeDelta}
            purity={purity}
            onPurityChange={setPurity}
            showPurity={symbol === 'XAU'}
          />
        ) : (
          <View style={{ height: 160 }}>
            <SkeletonChart />
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {ts.isLoading || !ts.points ? (
            <SkeletonChart />
          ) : ts.isError ? (
            <View style={[styles.errorWrap, { borderColor: tokens.colors.stroke }]}>
              <Text style={{ color: tokens.colors.text2, fontFamily: 'Inter-Medium' }}>
                Chart data unavailable
              </Text>
              <Text style={{ color: tokens.colors.muted, fontFamily: 'Inter', fontSize: 12 }}>
                {ts.error instanceof Error ? ts.error.message : 'Try another range.'}
              </Text>
            </View>
          ) : (
            <PriceChart data={ts.points} direction={dir} range={range} />
          )}

          <RangeChips value={range} onChange={setRange} />

          <StatStrip
            open={stats?.open}
            high={stats?.high}
            low={stats?.low}
          />

          <Text style={[styles.footer, { color: tokens.colors.muted }]}>
            {updatedAt
              ? `UPDATED ${format(updatedAt, 'dd MMM · HH:mm')} · METALS.DEV`
              : 'METALS.DEV'}
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 8, gap: 16 },
  scrollBody: { gap: 14, paddingBottom: 24 },
  footer: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 8,
  },
  errorWrap: {
    height: 220,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
