import { useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';

import { Button, Card, LoadingView, StatusPill, Text, TopAppBar } from '@/components/ui';
import { ApiError } from '@/lib/api-client';
import { nextDriverAction, shipmentStatusMeta } from '@/lib/shipment-status';
import { documentsService } from '@/services/documents';
import { shipmentsService } from '@/services/shipments';
import { useShipmentLocationSharing } from '@/hooks/useShipmentLocationSharing';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function DriverShipmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [isUploadingPod, setIsUploadingPod] = useState(false);

  const { data: shipment, isLoading } = useQuery({
    queryKey: ['shipments', id],
    queryFn: () => shipmentsService.get(id),
  });
  const locationSharing = useShipmentLocationSharing(id);

  const advance = useMutation({
    mutationFn: (action: ReturnType<typeof nextDriverAction>) =>
      shipmentsService.runAction(id, action!.action as never),
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
  const action = nextDriverAction(shipment.status);
  const canShareLocation = !['delivered', 'completed', 'cancelled', 'driver_assigned'].includes(shipment.status);

  const capturePod = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera permission needed', 'Enable camera access to capture proof of delivery.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setIsUploadingPod(true);
    try {
      await documentsService.uploadFile({
        document_type: 'pod',
        owner_type: 'shipment',
        owner_id: shipment.id,
        file: { uri: asset.uri, name: `pod-${shipment.id}.jpg`, type: 'image/jpeg' },
      });
      Alert.alert('Uploaded', 'Proof of delivery photo saved.');
    } catch (error) {
      Alert.alert('Upload failed', error instanceof ApiError ? error.message : 'Something went wrong');
    } finally {
      setIsUploadingPod(false);
    }
  };

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

        {shipment.vehicle && (
          <Card>
            <Text variant="label" color="textSecondary">
              VEHICLE
            </Text>
            <Text variant="title">{shipment.vehicle.registration_number}</Text>
          </Card>
        )}

        {canShareLocation && (
          <Card>
            <View style={styles.row}>
              <Text variant="title" style={styles.grow}>
                Share live location
              </Text>
              <Switch
                value={locationSharing.enabled}
                onValueChange={locationSharing.setEnabled}
                trackColor={{ true: theme.colors.green }}
              />
            </View>
            {locationSharing.error && (
              <Text variant="caption" color="danger">
                {locationSharing.error}
              </Text>
            )}
            {locationSharing.enabled && (
              <Text variant="caption" color="textSecondary">
                Sharing while this app is open. Keep it in the foreground for continuous updates.
              </Text>
            )}
          </Card>
        )}

        {action && (
          <Button
            label={advance.isPending ? 'Updating...' : action.label}
            onPress={() => advance.mutate(action)}
            loading={advance.isPending}
          />
        )}

        {shipment.status === 'arrived_at_destination' && (
          <Button
            label={isUploadingPod ? 'Uploading...' : 'Capture proof of delivery'}
            variant="secondary"
            onPress={capturePod}
            loading={isUploadingPod}
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
