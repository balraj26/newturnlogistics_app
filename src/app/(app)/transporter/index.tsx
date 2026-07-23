import { useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { EmptyState, Text, TopAppBar } from '@/components/ui';
import { ShipmentListItem } from '@/components/ShipmentListItem';
import { shipmentsService } from '@/services/shipments';
import { spacing } from '@/theme/tokens';
import type { Shipment } from '@/types/api';

const ACTIVE = new Set([
  'transporter_selected',
  'vehicle_assigned',
  'driver_assigned',
  'pickup_in_progress',
  'loaded',
  'dispatched',
  'in_transit',
  'arrived_at_destination',
]);

export default function TransporterLoadsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { data, refetch } = useQuery({ queryKey: ['shipments'], queryFn: shipmentsService.list });

  const shipments = data ?? [];
  const open = shipments.filter((s) => s.status === 'bidding_open');
  const active = shipments.filter((s) => ACTIVE.has(s.status));
  const past = shipments.filter((s) => s.status === 'delivered' || s.status === 'completed');

  const sections = [
    { title: 'Open for bidding', data: open },
    { title: 'My active shipments', data: active },
    { title: 'Completed', data: past },
  ].filter((section) => section.data.length > 0);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={styles.flex}>
      <TopAppBar title="Loads" />
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
            <ShipmentListItem shipment={item} basePath="/(app)/transporter" />
          </View>
        )}
        ListEmptyComponent={<EmptyState title="No loads yet" body="Shipments from linked factories will show up here." />}
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
