import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTokens } from '../theme/ThemeProvider';
import { formatINRShort, formatPct } from '../utils/format';
import { ChevronDown, ChevronUp } from './icons';

type Props = {
  delta: { abs: number; pct: number } | null;
  prefix?: string;
  size?: 'sm' | 'md';
};

function DeltaPillBase({ delta, prefix, size = 'sm' }: Props) {
  const tokens = useTokens();

  if (!delta) {
    return (
      <Text style={[styles.base, { color: tokens.colors.muted }, size === 'md' && styles.md]}>
        {prefix}—
      </Text>
    );
  }

  const up = delta.abs >= 0;
  const color = up ? tokens.colors.gain : tokens.colors.loss;
  const Icon = up ? ChevronUp : ChevronDown;

  return (
    <View style={styles.row}>
      {prefix ? (
        <Text style={[styles.prefix, { color: tokens.colors.text2 }, size === 'md' && styles.prefixMd]}>
          {prefix}
        </Text>
      ) : null}
      <Icon size={size === 'md' ? 14 : 10} color={color} />
      <Text style={[styles.base, { color }, size === 'md' && styles.md]}>
        {formatINRShort(delta.abs)}
      </Text>
      <Text style={[styles.base, { color }, size === 'md' && styles.md]}>
        {formatPct(delta.pct)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  base: {
    fontFamily: 'IBMPlexMono-Medium',
    fontSize: 12,
  },
  md: { fontSize: 13 },
  prefix: {
    fontFamily: 'IBMPlexMono',
    fontSize: 12,
    marginRight: 2,
  },
  prefixMd: { fontSize: 13 },
});

export const DeltaPill = memo(DeltaPillBase);
