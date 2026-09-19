import { useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { Button, EmptyState, Text, TopAppBar } from '@/components/ui';
import { ShipmentListItem } from '@/components/ShipmentListItem';
import { SideMenu } from '@/components/SideMenu';
import { useCurrentRole } from '@/hooks/useCurrentRole';
import { shipmentsService, type ListShipmentsOptions } from '@/services/shipments';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { Shipment } from '@/types/api';

type HomeScope = NonNullable<ListShipmentsOptions['scope']>;

/** Sectioning is keyed to which scope is active, not to the caller's role —
 * "loads" and "trips" each imply a fixed dataset shape regardless of who's
 * looking (a Transporter's Loads tab is just an empty version of the same
 * Drafts/Bidding/In progress/Completed grouping, not a different screen). */
function sectionsFor(scope: HomeScope, shipments: Shipment[]) {
  if (scope === 'loads') {
    return [
      { title: 'Drafts', data: shipments.filter((s) => s.status === 'draft') },
      { title: 'Bidding open', data: shipments.filter((s) => s.status === 'bidding_open') },
      {
        title: 'In progress',
        data: shipments.filter(
          (s) => !['draft', 'bidding_open', 'delivered', 'completed', 'cancelled'].includes(s.status),
        ),
      },
      { title: 'Completed', data: shipments.filter((s) => ['delivered', 'completed'].includes(s.status)) },
    ].filter((section) => section.data.length > 0);
  }

  const ACTIVE = [
    'transporter_selected',
    'vehicle_assigned',
    'driver_assigned',
    'pickup_in_progress',
    'loaded',
    'dispatched',
    'in_transit',
    'arrived_at_destination',
  ];
  return [
    { title: 'Open for bidding', data: shipments.filter((s) => s.status === 'bidding_open') },
    { title: 'Active', data: shipments.filter((s) => ACTIVE.includes(s.status)) },
    { title: 'Completed', data: shipments.filter((s) => ['delivered', 'completed'].includes(s.status)) },
  ].filter((section) => section.data.length > 0);
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { role } = useCurrentRole();
  const isConsignor = role === 'factory';
  const [scope, setScope] = useState<HomeScope>(role === 'transporter' ? 'trips' : 'loads');
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ['shipments', scope],
    queryFn: () => shipmentsService.list({ scope }),
  });

  const sections = sectionsFor(scope, data ?? []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={styles.flex}>
      <TopAppBar
        title="NewTurn"
        onMenuPress={() => setMenuOpen(true)}
        right={
          <Ionicons.Button
            name="notifications-outline"
            size={24}
            color={theme.colors.text}
            backgroundColor="transparent"
            onPress={() => router.push('/(app)/home/notifications')}
            iconStyle={{ marginRight: 0 }}
          />
        }
      />

      <View style={styles.toggleRow}>
        <Button
          label="Trips"
          variant={scope === 'trips' ? 'primary' : 'outline'}
          size="sm"
          fullWidth={false}
          onPress={() => setScope('trips')}
        />
        <Button
          label="Loads"
          variant={scope === 'loads' ? 'primary' : 'outline'}
          size="sm"
          fullWidth={false}
          onPress={() => setScope('loads')}
        />
        {isConsignor && scope === 'loads' && (
          <Ionicons.Button
            name="add-circle"
            size={28}
            color={theme.colors.navy}
            backgroundColor="transparent"
            onPress={() => router.push('/(app)/home/shipments/new')}
            iconStyle={{ marginRight: 0 }}
            style={styles.addButton}
          />
        )}
      </View>

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
            <ShipmentListItem shipment={item} basePath="/(app)/home" />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title={scope === 'loads' ? 'No loads yet' : 'No trips yet'}
            body={
              scope === 'loads'
                ? isConsignor
                  ? 'Tap + to post your first load.'
                  : 'Loads you post will show up here.'
                : 'Trips you can bid on or are assigned to will show up here.'
            }
          />
        }
      />

      <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} showTransporterNetwork={isConsignor} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, paddingBottom: 0 },
  addButton: { marginLeft: 'auto' },
  list: { padding: spacing.md, flexGrow: 1 },
  sectionHeader: { marginTop: spacing.sm, marginBottom: spacing.xs },
  item: { marginBottom: spacing.sm },
});
