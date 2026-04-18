import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Topbar } from '../src/components/Topbar';
import { Tile } from '../src/components/Tile';
import { SkeletonTile } from '../src/components/SkeletonTile';
import { usePricesQuery } from '../src/hooks/usePricesQuery';
import { useSparklines } from '../src/hooks/useSparklines';
import { useTokens } from '../src/theme/ThemeProvider';
import type { MetalQuote } from '../src/types/metals';

export default function LandingScreen() {
  const tokens = useTokens();
  const router = useRouter();
  const { quotes, isLoading, isError, dataUpdatedAt, refetch, error } = usePricesQuery();
  const { data: sparklines } = useSparklines();

  const handlePress = useCallback(
    (q: MetalQuote) => router.push(`/metal/${q.symbol}`),
    [router],
  );

  const isStale = dataUpdatedAt
    ? Date.now() - dataUpdatedAt > 2 * 24 * 60 * 60 * 1000
    : false;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <View style={styles.container}>
        <Topbar updatedAt={dataUpdatedAt || null} isStale={isStale} />

        <View style={styles.heroLine}>
          <Text style={[styles.label, { color: tokens.colors.text2 }]}>
            Prices in INR / gram · tap gold to adjust karat
          </Text>
        </View>

        {isError ? (
          <View style={styles.errorWrap}>
            <Text style={[styles.errorText, { color: tokens.colors.text2 }]}>
              Couldn't load prices. {error instanceof Error ? error.message : ''}
            </Text>
            <Text
              onPress={() => refetch()}
              style={[styles.retry, { color: tokens.colors.goldBright }]}
            >
              Tap to retry
            </Text>
          </View>
        ) : null}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {isLoading || !quotes
              ? [0, 1, 2, 3].map((i) => (
                  <View key={i} style={styles.cell}>
                    <SkeletonTile />
                  </View>
                ))
              : quotes.map((q) => (
                  <View key={q.symbol} style={styles.cell}>
                    <Tile
                      quote={q}
                      sparkline={sparklines[q.symbol]?.points}
                      sparklineDirection={sparklines[q.symbol]?.direction}
                      onPress={handlePress}
                    />
                  </View>
                ))}
          </View>
        </ScrollView>

        <Text style={[styles.footer, { color: tokens.colors.muted }]}>
          SOURCE: METALS.DEV 
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1
   },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, gap: 16 },
  heroLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontFamily: 'Inter-Medium', fontSize: 13 },
  scroll: { flex: 1 },
  gridContainer: { paddingBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  cell: { flexBasis: '47.5%', flexGrow: 1 },
  footer: { fontFamily: 'Inter-Medium', fontSize: 10, letterSpacing: 1, textAlign: 'center',paddingBottom: 20 },
  errorWrap: { gap: 8 },
  errorText: { fontFamily: 'Inter-Medium', fontSize: 12 },
  retry: { fontFamily: 'Inter-SemiBold', fontSize: 13 },
});
