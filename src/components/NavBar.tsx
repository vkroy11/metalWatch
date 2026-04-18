import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlassView } from './GlassView';
import { ChevronLeft, MoreHorizontal } from './icons';
import { useTokens } from '../theme/ThemeProvider';

type Props = {
  title: string;
  onBack: () => void;
  onMore?: () => void;
};

function NavBarBase({ title, onBack, onMore }: Props) {
  const tokens = useTokens();

  return (
    <GlassView borderRadius={tokens.radii.pill} style={styles.wrapper}>
      <View style={styles.row}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => [
            styles.iconBtn,
            {
              backgroundColor: tokens.colors.glass,
              borderColor: tokens.colors.stroke,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <ChevronLeft color={tokens.colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: tokens.colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {onMore ? (
          <Pressable
            onPress={onMore}
            accessibilityRole="button"
            accessibilityLabel="More options"
            hitSlop={8}
            style={({ pressed }) => [
              styles.iconBtn,
              {
                backgroundColor: tokens.colors.glass,
                borderColor: tokens.colors.stroke,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <MoreHorizontal color={tokens.colors.text} />
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: { width: 34, height: 34 },
  title: { fontFamily: 'Inter-SemiBold', fontSize: 15, flex: 1, textAlign: 'center' },
});

export const NavBar = memo(NavBarBase);
