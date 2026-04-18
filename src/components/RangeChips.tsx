import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTokens } from '../theme/ThemeProvider';
import type { Range } from '../types/metals';

const OPTIONS: Range[] = ['1D', '1W', '1M', '1Y'];

type Props = {
  value: Range;
  onChange: (r: Range) => void;
  disabled?: Partial<Record<Range, boolean>>;
};

function RangeChipsBase({ value, onChange, disabled }: Props) {
  const tokens = useTokens();

  return (
    <View
      style={styles.row}
      accessibilityRole="radiogroup"
    >
      {OPTIONS.map((opt) => {
        const active = opt === value;
        const isDisabled = disabled?.[opt];
        return (
          <Pressable
            key={opt}
            onPress={() => !isDisabled && onChange(opt)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active, disabled: isDisabled }}
            accessibilityLabel={`${opt} range`}
            disabled={isDisabled}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: tokens.colors.chipInactive,
                borderColor: tokens.colors.stroke,
                borderWidth: StyleSheet.hairlineWidth,
              },
              active && tokens.shadow.goldGlow,
              pressed && !active && { opacity: 0.7 },
              isDisabled && { opacity: 0.35 },
            ]}
          >
            {active ? (
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
                  color: active ? tokens.colors.bg : tokens.colors.text2,
                  fontFamily: 'Inter-SemiBold',
                },
              ]}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 999,
    alignItems: 'center',
    overflow: 'hidden',
  },
  label: { fontSize: 12 },
});

export const RangeChips = memo(RangeChipsBase);
