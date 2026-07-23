import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { EmptyState, LoadingView, TopAppBar } from '@/components/ui';
import { ShipmentListItem } from '@/components/ShipmentListItem';
import { useMyDriverProfile } from '@/hooks/useMyDriverProfile';
import { shipmentsService } from '@/services/shipments';
import { spacing } from '@/theme/tokens';
import type { Shipment } from '@/types/api';

const TERMINAL = new Set(['completed', 'cancelled']);

export default function DriverHistoryScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { driver, isLoading: isLoadingDriver } = useMyDriverProfile();
  const { data, refetch, isLoading } = useQuery({ queryKey: ['shipments'], queryFn: shipmentsService.list });

  if (isLoadingDriver || isLoading) {
    return <LoadingView />;
  }

  const mine = (data ?? []).filter((s: Shipment) => s.driver_id === driver?.id && TERMINAL.has(s.status));

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={styles.flex}>
      <TopAppBar title="History" />
      <FlatList
        data={mine}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => <ShipmentListItem shipment={item} basePath="/(app)/driver" />}
        ListEmptyComponent={<EmptyState title="No completed shipments yet" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.md, flexGrow: 1 },
});
