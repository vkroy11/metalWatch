import { memo } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from './GlassView';
import { useTokens } from '../theme/ThemeProvider';
import type { Purity } from '../types/metals';

const OPTIONS: Purity[] = ['24K', '22K', '18K'];

type Props = {
  value: Purity;
  onChange: (p: Purity) => void;
  variant?: 'plain' | 'gold';
  style?: ViewStyle;
};

function PuritySegmentedBase({ value, onChange, variant = 'plain', style }: Props) {
  const tokens = useTokens();
  const goldVariant = variant === 'gold';

  return (
    <GlassView borderRadius={tokens.radii.pill} style={style ? [styles.pill, style] : styles.pill}>
      <View
        style={styles.row}
        accessibilityRole="radiogroup"
      >
        {OPTIONS.map((opt) => {
          const active = opt === value;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${opt} purity`}
              style={({ pressed }) => [
                styles.seg,
                active && !goldVariant && {
                  backgroundColor: 'rgba(255,255,255,0.10)',
                  borderColor: tokens.colors.stroke,
                  borderWidth: StyleSheet.hairlineWidth,
                },
                pressed && !active && { opacity: 0.7 },
              ]}
            >
              {active && goldVariant ? (
                <LinearGradient
                  colors={[tokens.colors.gold, tokens.colors.goldBright]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
              <Text
                style={[
                  styles.label,
                  {
                    color: active
                      ? goldVariant
                        ? tokens.colors.bg
                        : tokens.colors.text
                      : tokens.colors.text2,
                    fontFamily: active ? 'Inter-SemiBold' : 'Inter-Medium',
                  },
                ]}
              >
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  pill: { alignSelf: 'flex-start' },
  row: { flexDirection: 'row', padding: 4, gap: 2 },
  seg: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    minWidth: 40,
    alignItems: 'center',
    overflow: 'hidden',
  },
  label: { fontSize: 12 },
});

export const PuritySegmented = memo(PuritySegmentedBase);
