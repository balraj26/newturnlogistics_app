import { useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState, Text, TopAppBar } from '@/components/ui';
import { ShipmentListItem } from '@/components/ShipmentListItem';
import { shipmentsService } from '@/services/shipments';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { Shipment } from '@/types/api';

export default function FactoryShipmentsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const { data, refetch } = useQuery({ queryKey: ['shipments'], queryFn: shipmentsService.list });

  const shipments = data ?? [];
  const drafts = shipments.filter((s) => s.status === 'draft');
  const bidding = shipments.filter((s) => s.status === 'bidding_open');
  const inProgress = shipments.filter(
    (s) => !['draft', 'bidding_open', 'delivered', 'completed', 'cancelled'].includes(s.status),
  );
  const done = shipments.filter((s) => ['delivered', 'completed'].includes(s.status));

  const sections = [
    { title: 'Drafts', data: drafts },
    { title: 'Bidding open', data: bidding },
    { title: 'In progress', data: inProgress },
    { title: 'Completed', data: done },
  ].filter((section) => section.data.length > 0);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={styles.flex}>
      <TopAppBar
        title="Shipments"
        right={
          <Ionicons.Button
            name="add-circle"
            size={28}
            color={theme.colors.navy}
            backgroundColor="transparent"
            onPress={() => router.push('/(app)/factory/shipments/new')}
            iconStyle={{ marginRight: 0 }}
          />
        }
      />
      <SectionList
        sections={sections}
        keyExtractor={(item: Shipment) => item.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderSectionHeader={({ section }) => (
          <Text variant="label" color="textSecondary" style={styles.sectionHeader}>
            {section.title.toUpperCase()}
          </Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <ShipmentListItem shipment={item} basePath="/(app)/factory" />
          </View>
        )}
        ListEmptyComponent={<EmptyState title="No shipments yet" body="Tap + to post your first shipment." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.md, flexGrow: 1 },
  sectionHeader: { marginTop: spacing.sm, marginBottom: spacing.xs },
  item: { marginBottom: spacing.sm },
});
