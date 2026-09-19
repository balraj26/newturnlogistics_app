import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Text } from './Text';
import { useTheme } from '@/theme/useTheme';
import { minTouchTarget, spacing } from '@/theme/tokens';

interface TopAppBarProps {
  title: string;
  back?: boolean;
  /** Renders a hamburger button in the left slot instead of the back
   * button — used by the shared Consignor/Transporter home shell to open
   * SideMenu. Mutually exclusive with `back` (a screen has one or the
   * other, never both); `back` wins if both are passed. */
  onMenuPress?: () => void;
  right?: ReactNode;
}

export function TopAppBar({ title, back = false, onMenuPress, right }: TopAppBarProps) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const barHeight = Platform.select({ ios: 44, default: 56 });

  return (
    <View
      style={[
        styles.container,
        {
          height: insets.top + barHeight,
          paddingTop: insets.top,
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.side}>
        {back && (
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.iconButton}
          >
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </Pressable>
        )}
        {!back && onMenuPress && (
          <Pressable
            onPress={onMenuPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            style={styles.iconButton}
          >
            <Ionicons name="menu" size={24} color={theme.colors.text} />
          </Pressable>
        )}
      </View>
      <Text variant="title" style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.rightSide]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: spacing.xs,
  },
  side: { width: minTouchTarget, alignItems: 'flex-start' },
  rightSide: { alignItems: 'flex-end' },
  iconButton: { width: minTouchTarget, height: minTouchTarget, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center' },
});
