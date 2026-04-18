import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassView } from './GlassView';
import { useTokens } from '../theme/ThemeProvider';
import { formatINRPlain } from '../utils/format';

type Props = {
  open?: number | null;
  high?: number | null;
  low?: number | null;
};

function valueOf(n: number | null | undefined): string {
  return typeof n === 'number' ? formatINRPlain(n).replace('₹ ', '') : '—';
}

function StatStripBase({ open, high, low }: Props) {
  const tokens = useTokens();
  return (
    <GlassView borderRadius={tokens.radii.card} style={styles.wrapper}>
      <View style={styles.row}>
        <Cell label="OPEN" value={valueOf(open)} />
        <Divider />
        <Cell label="HIGH" value={valueOf(high)} />
        <Divider />
        <Cell label="LOW" value={valueOf(low)} />
      </View>
    </GlassView>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  const tokens = useTokens();
  return (
    <View style={styles.cell}>
      <Text style={[styles.label, { color: tokens.colors.muted }]}>{label}</Text>
      <Text style={[styles.value, { color: tokens.colors.text }]}>{value}</Text>
    </View>
  );
}

function Divider() {
  const tokens = useTokens();
  return <View style={[styles.divider, { backgroundColor: tokens.colors.stroke }]} />;
}

const styles = StyleSheet.create({
  wrapper: {},
  row: { flexDirection: 'row', paddingVertical: 14 },
  cell: { flex: 1, alignItems: 'center' },
  divider: { width: 1, marginVertical: 4 },
  label: { fontFamily: 'Inter-Medium', fontSize: 10, letterSpacing: 1.2, marginBottom: 4 },
  value: { fontFamily: 'IBMPlexMono-SemiBold', fontSize: 15 },
});

export const StatStrip = memo(StatStripBase);
