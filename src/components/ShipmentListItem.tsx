import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Card, StatusPill, Text } from '@/components/ui';
import { shipmentStatusMeta } from '@/lib/shipment-status';
import { spacing } from '@/theme/tokens';
import type { Shipment } from '@/types/api';

interface ShipmentListItemProps {
  shipment: Shipment;
  /** Which role's detail route to push to — each role owns its own
   * shipments/[id] screen since the actions available differ by persona. */
  basePath: '/(app)/factory' | '/(app)/transporter' | '/(app)/driver' | '/(app)/gatekeeper';
}

export function ShipmentListItem({ shipment, basePath }: ShipmentListItemProps) {
  const router = useRouter();
  const meta = shipmentStatusMeta(shipment.status);

  return (
    <Card onPress={() => router.push(`${basePath}/shipments/${shipment.id}` as never)}>
      <View style={styles.row}>
        <Text variant="title" numberOfLines={1} style={styles.grow}>
          Shipment #{shipment.id.slice(0, 8)}
        </Text>
        <StatusPill label={meta.label} type={meta.pill} />
      </View>
      <Text variant="body" color="textSecondary">
        {shipment.weight_kg.toLocaleString()} kg &middot; required {shipment.required_date}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  grow: { flex: 1 },
});
