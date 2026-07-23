import { Alert, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button, Card, EmptyState, Input, LoadingView, StatusPill, Text, TopAppBar } from '@/components/ui';
import { ApiError } from '@/lib/api-client';
import { nextDriverAction, shipmentStatusMeta } from '@/lib/shipment-status';
import { masterDataService } from '@/services/master-data';
import { shipmentsService } from '@/services/shipments';
import { useCurrentRole } from '@/hooks/useCurrentRole';
import { spacing } from '@/theme/tokens';

const bidSchema = z.object({
  price: z.coerce.number().positive('Enter a price'),
  eta_hours: z.coerce.number().int().positive('Enter an ETA in hours'),
  notes: z.string().optional(),
});
type BidValues = z.infer<typeof bidSchema>;

export default function TransporterShipmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { company } = useCurrentRole();

  const { data: shipment, isLoading } = useQuery({
    queryKey: ['shipments', id],
    queryFn: () => shipmentsService.get(id),
  });
  const { data: bids } = useQuery({
    queryKey: ['shipments', id, 'bids'],
    queryFn: () => shipmentsService.listBids(id),
    enabled: shipment?.status === 'bidding_open',
  });
  const { data: vehicles } = useQuery({
    queryKey: ['master-data', 'vehicles'],
    queryFn: masterDataService.listVehicles,
    enabled: shipment?.status === 'transporter_selected',
  });
  const { data: drivers } = useQuery({
    queryKey: ['master-data', 'drivers'],
    queryFn: masterDataService.listDrivers,
    enabled: shipment?.status === 'vehicle_assigned',
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['shipments'] });
    queryClient.invalidateQueries({ queryKey: ['shipments', id] });
  };
  const onError = (error: unknown) =>
    Alert.alert('Action failed', error instanceof ApiError ? error.message : 'Something went wrong');

  const submitBid = useMutation({
    mutationFn: (values: BidValues) => shipmentsService.submitBid(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments', id, 'bids'] });
      Alert.alert('Bid submitted');
    },
    onError,
  });
  const assignVehicle = useMutation({
    mutationFn: (vehicleId: string) => shipmentsService.assignVehicle(id, vehicleId),
    onSuccess: invalidate,
    onError,
  });
  const assignDriver = useMutation({
    mutationFn: (driverId: string) => shipmentsService.assignDriver(id, driverId),
    onSuccess: invalidate,
    onError,
  });
  const advance = useMutation({
    mutationFn: (action: string) => shipmentsService.runAction(id, action as never),
    onSuccess: invalidate,
    onError,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BidValues>({ resolver: zodResolver(bidSchema) as Resolver<BidValues> });

  if (isLoading || !shipment) {
    return <LoadingView />;
  }

  const meta = shipmentStatusMeta(shipment.status);
  const myBid = bids?.find((b) => b.transporter_id === company?.id);
  const action = nextDriverAction(shipment.status);

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

        {shipment.status === 'bidding_open' && (
          <Card>
            {myBid ? (
              <>
                <Text variant="title">Your bid</Text>
                <Text variant="body" color="textSecondary">
                  ₹{myBid.price} &middot; ETA {myBid.eta_hours}h &middot; {myBid.status}
                </Text>
              </>
            ) : (
              <>
                <Text variant="title">Submit a bid</Text>
                <Controller
                  control={control}
                  name="price"
                  render={({ field }) => (
                    <Input label="Price (₹)" keyboardType="numeric" onChangeText={field.onChange} error={errors.price?.message} />
                  )}
                />
                <Controller
                  control={control}
                  name="eta_hours"
                  render={({ field }) => (
                    <Input label="ETA (hours)" keyboardType="numeric" onChangeText={field.onChange} error={errors.eta_hours?.message} />
                  )}
                />
                <Controller
                  control={control}
                  name="notes"
                  render={({ field }) => <Input label="Notes (optional)" onChangeText={field.onChange} />}
                />
                <Button
                  label={submitBid.isPending ? 'Submitting...' : 'Submit bid'}
                  onPress={handleSubmit((values) => submitBid.mutate(values))}
                  loading={submitBid.isPending}
                />
              </>
            )}
          </Card>
        )}

        {shipment.status === 'transporter_selected' && (
          <Card>
            <Text variant="title">Assign a vehicle</Text>
            {(vehicles ?? []).length === 0 && <EmptyState title="No vehicles yet" body="Add one from the Fleet tab first." />}
            {(vehicles ?? []).map((vehicle) => (
              <Button
                key={vehicle.id}
                label={vehicle.registration_number}
                variant="outline"
                onPress={() => assignVehicle.mutate(vehicle.id)}
                loading={assignVehicle.isPending}
              />
            ))}
          </Card>
        )}

        {shipment.status === 'vehicle_assigned' && (
          <Card>
            <Text variant="title">Assign a driver</Text>
            {(drivers ?? []).length === 0 && <EmptyState title="No drivers yet" body="Add one from the Fleet tab first." />}
            {(drivers ?? []).map((driver) => (
              <Button
                key={driver.id}
                label={driver.full_name}
                variant="outline"
                onPress={() => assignDriver.mutate(driver.id)}
                loading={assignDriver.isPending}
              />
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

        {action && (
          <Button
            label={advance.isPending ? 'Updating...' : `${action.label} (override)`}
            variant="ghost"
            onPress={() => advance.mutate(action.action)}
            loading={advance.isPending}
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
