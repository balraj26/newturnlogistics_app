import { Alert, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Button, Card, LoadingView, StatusPill, Text, TopAppBar } from '@/components/ui';
import { ApiError } from '@/lib/api-client';
import { shipmentStatusMeta } from '@/lib/shipment-status';
import { shipmentsService } from '@/services/shipments';
import { spacing } from '@/theme/tokens';

export default function GatekeeperShipmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: shipment, isLoading } = useQuery({
    queryKey: ['shipments', id],
    queryFn: () => shipmentsService.get(id),
  });

  const gateAction = useMutation({
    mutationFn: (action: 'gate-check-in' | 'gate-check-out') => shipmentsService.runAction(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipments', id] });
    },
    onError: (error) => {
      Alert.alert('Action failed', error instanceof ApiError ? error.message : 'Something went wrong');
    },
  });

  if (isLoading || !shipment) {
    return <LoadingView />;
  }

  const meta = shipmentStatusMeta(shipment.status);
  const canCheckIn = shipment.status === 'driver_assigned' && !shipment.gate_checked_in_at;
  const canCheckOut = !!shipment.gate_checked_in_at && !shipment.gate_checked_out_at;

  return (
    <View style={styles.flex}>
      <TopAppBar title={`Shipment #${shipment.id.slice(0, 8)}`} back />
      <View style={styles.content}>
        <Card>
          <View style={styles.row}>
            <Text variant="title" style={styles.grow}>
              Status
            </Text>
            <StatusPill label={meta.label} type={meta.pill} />
          </View>
          <Text variant="body" color="textSecondary">
            {shipment.weight_kg.toLocaleString()} kg &middot; required {shipment.required_date}
          </Text>
        </Card>

        {shipment.vehicle && (
          <Card>
            <Text variant="label" color="textSecondary">
              VEHICLE
            </Text>
            <Text variant="title">{shipment.vehicle.registration_number}</Text>
            <Text variant="body" color="textSecondary">
              {shipment.vehicle.vehicle_type}
            </Text>
          </Card>
        )}

        {shipment.driver && (
          <Card>
            <Text variant="label" color="textSecondary">
              DRIVER
            </Text>
            <Text variant="title">{shipment.driver.full_name}</Text>
            {shipment.driver.phone && (
              <Text variant="body" color="textSecondary">
                {shipment.driver.phone}
              </Text>
            )}
          </Card>
        )}

        {canCheckIn && (
          <Button
            label={gateAction.isPending ? 'Checking in...' : 'Check in at gate'}
            onPress={() => gateAction.mutate('gate-check-in')}
            loading={gateAction.isPending}
          />
        )}
        {canCheckOut && (
          <Button
            label={gateAction.isPending ? 'Checking out...' : 'Check out at gate'}
            variant="secondary"
            onPress={() => gateAction.mutate('gate-check-out')}
            loading={gateAction.isPending}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  grow: { flex: 1 },
});
