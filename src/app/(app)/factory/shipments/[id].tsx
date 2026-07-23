import { Alert, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Button, Card, EmptyState, LoadingView, StatusPill, Text, TopAppBar } from '@/components/ui';
import { ApiError } from '@/lib/api-client';
import { shipmentStatusMeta } from '@/lib/shipment-status';
import { shipmentsService } from '@/services/shipments';
import { spacing } from '@/theme/tokens';

export default function FactoryShipmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: shipment, isLoading } = useQuery({
    queryKey: ['shipments', id],
    queryFn: () => shipmentsService.get(id),
  });
  const { data: bids } = useQuery({
    queryKey: ['shipments', id, 'bids'],
    queryFn: () => shipmentsService.listBids(id),
    enabled: shipment?.status === 'bidding_open',
  });
  const { data: timeline } = useQuery({
    queryKey: ['shipments', id, 'timeline'],
    queryFn: () => shipmentsService.timeline(id),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['shipments'] });
    queryClient.invalidateQueries({ queryKey: ['shipments', id] });
  };
  const onError = (error: unknown) =>
    Alert.alert('Action failed', error instanceof ApiError ? error.message : 'Something went wrong');

  const publish = useMutation({
    mutationFn: () => shipmentsService.runAction(id, 'publish'),
    onSuccess: invalidate,
    onError,
  });
  const acceptBid = useMutation({
    mutationFn: (bidId: string) => shipmentsService.acceptBid(id, bidId),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['shipments', id, 'bids'] });
    },
    onError,
  });
  const cancel = useMutation({
    mutationFn: () => shipmentsService.runAction(id, 'cancel'),
    onSuccess: invalidate,
    onError,
  });

  if (isLoading || !shipment) {
    return <LoadingView />;
  }

  const meta = shipmentStatusMeta(shipment.status);
  const canCancel = !['delivered', 'completed', 'cancelled'].includes(shipment.status);

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
          {shipment.special_instructions && (
            <Text variant="body" color="textSecondary">
              {shipment.special_instructions}
            </Text>
          )}
        </Card>

        {shipment.status === 'draft' && (
          <Button label={publish.isPending ? 'Publishing...' : 'Publish for bidding'} onPress={() => publish.mutate()} loading={publish.isPending} />
        )}

        {shipment.status === 'bidding_open' && (
          <Card>
            <Text variant="title">Bids</Text>
            {(bids ?? []).length === 0 && <EmptyState title="No bids yet" body="Linked transporters can bid once you've published this shipment." />}
            {(bids ?? []).map((bid) => (
              <View key={bid.id} style={styles.bidRow}>
                <View style={styles.grow}>
                  <Text variant="body" weight="semibold">
                    ₹{bid.price} &middot; ETA {bid.eta_hours}h
                  </Text>
                  {bid.notes && (
                    <Text variant="caption" color="textSecondary">
                      {bid.notes}
                    </Text>
                  )}
                </View>
                {bid.status === 'submitted' && (
                  <Button label="Accept" size="sm" fullWidth={false} onPress={() => acceptBid.mutate(bid.id)} loading={acceptBid.isPending} />
                )}
                {bid.status !== 'submitted' && <StatusPill label={bid.status} type={bid.status === 'accepted' ? 'success' : 'danger'} />}
              </View>
            ))}
          </Card>
        )}

        {shipment.vehicle && (
          <Card>
            <Text variant="label" color="textSecondary">
              VEHICLE
            </Text>
            <Text variant="body">{shipment.vehicle.registration_number}</Text>
          </Card>
        )}
        {shipment.driver && (
          <Card>
            <Text variant="label" color="textSecondary">
              DRIVER
            </Text>
            <Text variant="body">{shipment.driver.full_name}</Text>
          </Card>
        )}

        {(timeline ?? []).length > 0 && (
          <Card>
            <Text variant="title">Timeline</Text>
            {(timeline ?? []).map((event, index) => (
              <Text key={index} variant="caption" color="textSecondary">
                {new Date(event.created_at).toLocaleString()} &middot; {event.action}
              </Text>
            ))}
          </Card>
        )}

        {canCancel && (
          <Button label={cancel.isPending ? 'Cancelling...' : 'Cancel shipment'} variant="danger" onPress={() => cancel.mutate()} loading={cancel.isPending} />
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
  bidRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
});
