import { StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { useTheme } from '@/theme/useTheme';
import { radius, spacing } from '@/theme/tokens';

export type StatusPillType = 'success' | 'warning' | 'danger' | 'info' | 'navy';

interface StatusPillProps {
  label: string;
  type: StatusPillType;
}

export function StatusPill({ label, type }: StatusPillProps) {
  const theme = useTheme();

  const backgrounds: Record<StatusPillType, string> = {
    success: theme.colors.successBg,
    warning: theme.colors.warningBg,
    danger: theme.colors.dangerBg,
    info: theme.colors.infoBg,
    navy: theme.colors.navy,
  };
  const textColors: Record<StatusPillType, string> = {
    success: theme.colors.greenDark,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
    info: theme.colors.info,
    navy: '#FFFFFF',
  };

  return (
    <View style={[styles.base, { backgroundColor: backgrounds[type] }]}>
      <Text variant="label" style={{ color: textColors[type] }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    alignSelf: 'flex-start',
  },
});
