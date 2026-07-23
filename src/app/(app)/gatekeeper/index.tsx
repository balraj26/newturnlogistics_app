import { useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { EmptyState, Text, TopAppBar } from '@/components/ui';
import { ShipmentListItem } from '@/components/ShipmentListItem';
import { shipmentsService } from '@/services/shipments';
import { spacing } from '@/theme/tokens';
import type { Shipment } from '@/types/api';

export default function GatekeeperHomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { data, refetch } = useQuery({ queryKey: ['shipments'], queryFn: shipmentsService.list });

  const shipments = data ?? [];
  const awaitingCheckIn = shipments.filter((s) => s.status === 'driver_assigned');
  const awaitingCheckOut = shipments.filter((s) => s.gate_checked_in_at && !s.gate_checked_out_at);

  const sections = [
    { title: 'Awaiting gate check-in', data: awaitingCheckIn },
    { title: 'Checked in, awaiting checkout', data: awaitingCheckOut },
  ].filter((section) => section.data.length > 0);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={styles.flex}>
      <TopAppBar title="Gate" />
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
            <ShipmentListItem shipment={item} basePath="/(app)/gatekeeper" />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState title="No vehicles at the gate" body="Shipments ready for check-in or checkout will show up here." />
        }
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
