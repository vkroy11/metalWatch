import { memo, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from './GlassView';
import { useTokens } from '../theme/ThemeProvider';
import { formatUpdatedAgo } from '../utils/format';

type Props = {
  updatedAt: number | null | undefined;
  isStale: boolean;
};

function TopbarBase({ updatedAt, isStale }: Props) {
  const tokens = useTokens();
  // formatUpdatedAgo is computed against Date.now(); the component itself
  // doesn't re-render as time passes, so the label would otherwise freeze
  // at whatever it was on mount. Tick every 15s to keep it accurate.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  const dotColor = isStale ? tokens.colors.muted : tokens.colors.gain;
  const agoLabel = formatUpdatedAgo(updatedAt);

  return (
    <GlassView borderRadius={tokens.radii.pill} style={styles.wrapper}>
      <View style={styles.row}>
        <View style={styles.brandRow}>
          <Text style={[styles.brand, { color: tokens.colors.text }]}>Metal</Text>
          <MaskedView
            maskElement={<Text style={[styles.brand, { color: '#000' }]}>W</Text>}
          >
            <LinearGradient
              colors={[tokens.colors.gold, tokens.colors.violet]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.brand, { opacity: 0 }]}>W</Text>
            </LinearGradient>
          </MaskedView>
          <Text style={[styles.brand, { color: tokens.colors.text }]}>atch</Text>
        </View>
        <View style={styles.liveRow}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: dotColor,
                shadowColor: dotColor,
                shadowOpacity: isStale ? 0 : 0.9,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 0 },
                elevation: isStale ? 0 : 3,
              },
            ]}
          />
          <Text style={[styles.live, { color: tokens.colors.text2 }]}>
            {isStale ? 'STALE' : 'LIVE'} · {agoLabel === '—' ? 'UPDATING…' : agoLabel}
          </Text>
        </View>
      </View>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 0 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brand: { fontFamily: 'Inter-SemiBold', fontSize: 16, letterSpacing: -0.2 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  live: { fontFamily: 'Inter-Medium', fontSize: 10, letterSpacing: 0.6 },
});

export const Topbar = memo(TopbarBase);
