import { useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Card, EmptyState, Text, TopAppBar } from '@/components/ui';
import { notificationsService } from '@/services/notifications';
import { spacing } from '@/theme/tokens';
import type { Notification } from '@/types/api';
import { useTheme } from '@/theme/useTheme';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NotificationRow({ notification, onPress }: { notification: Notification; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        {!notification.read_at && <View style={[styles.dot, { backgroundColor: theme.colors.green }]} />}
        <Text variant="title" numberOfLines={1} style={styles.grow}>
          {notification.title}
        </Text>
        <Text variant="caption" color="textTertiary">
          {timeAgo(notification.created_at)}
        </Text>
      </View>
      <Text variant="body" color="textSecondary">
        {notification.body}
      </Text>
    </Card>
  );
}

/** Shared across all four persona tab groups — every role reads its own
 * notifications the same way (GET /notifications, tap-to-mark-read). */
export function NotificationsList() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.list(),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const onPressNotification = async (id: string) => {
    await notificationsService.markRead(id);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <View style={styles.flex}>
      <TopAppBar title="Notifications" />
      <FlashList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => (
          <NotificationRow notification={item} onPress={() => onPressNotification(item.id)} />
        )}
        ListEmptyComponent={<EmptyState title="No notifications yet" body="We'll let you know when something needs your attention." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.md, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  grow: { flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
