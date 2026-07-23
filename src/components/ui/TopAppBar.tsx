import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Text } from './Text';
import { useTheme } from '@/theme/useTheme';
import { minTouchTarget, spacing } from '@/theme/tokens';

interface TopAppBarProps {
  title: string;
  back?: boolean;
  right?: ReactNode;
}

export function TopAppBar({ title, back = false, right }: TopAppBarProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
      <View style={styles.side}>
        {back && (
          <Ionicons.Button
            name="chevron-back"
            size={24}
            color={theme.colors.text}
            backgroundColor="transparent"
            onPress={() => router.back()}
            iconStyle={styles.backIcon}
          />
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
    height: Platform.select({ ios: 44, default: 56 }),
    borderBottomWidth: 1,
    paddingHorizontal: spacing.xs,
  },
  side: { width: minTouchTarget, alignItems: 'flex-start' },
  rightSide: { alignItems: 'flex-end' },
  backIcon: { marginRight: 0 },
  title: { flex: 1, textAlign: 'center' },
});
