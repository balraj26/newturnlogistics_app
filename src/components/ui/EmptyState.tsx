import { StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { spacing } from '@/theme/tokens';

interface EmptyStateProps {
  title: string;
  body?: string;
}

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text variant="title" style={styles.center}>
        {title}
      </Text>
      {body && (
        <Text variant="body" color="textSecondary" style={styles.center}>
          {body}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.xxl, gap: spacing.xs, alignItems: 'center' },
  center: { textAlign: 'center' },
});
