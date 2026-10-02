import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Button, Card, Text } from '@/components/ui';
import { ApiError } from '@/lib/api-client';
import { shipmentsService } from '@/services/shipments';
import { transporterNetworkService } from '@/services/transporter-network';
import { minTouchTarget, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const COPY = {
  publish: {
    title: 'Publish for bidding',
    body: "Choose which linked transporters can see this shipment and bid. They'll see each other's bids.",
    submit: 'Publish',
    done: 'Published for bidding',
  },
  add: {
    title: 'Share with more transporters',
    body: 'Transporters it is already shared with keep seeing it.',
    submit: 'Share',
    done: 'Shared',
  },
} as const;

/** Picks the linked transporters a shipment is shared with (shipment spec
 * §4.2) — publishing a draft, or adding more while bidding is open. Ported
 * from the web dashboard's ShareShipmentDialog. */
export function ShareTransportersCard({
  shipmentId,
  mode,
}: {
  shipmentId: string;
  mode: 'publish' | 'add';
}) {
  const copy = COPY[mode];
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: links } = useQuery({
    queryKey: ['transporter-network', 'links'],
    queryFn: transporterNetworkService.listLinks,
  });
  const { data: shares } = useQuery({
    queryKey: ['shipments', shipmentId, 'shares'],
    queryFn: () => shipmentsService.listShares(shipmentId),
    enabled: mode === 'add',
  });

  const alreadyShared = new Set((shares ?? []).map((share) => share.transporter_company_id));
  const choices = (links ?? []).filter(
    (link) => link.status === 'active' && !alreadyShared.has(link.transporter_company_id),
  );

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const ids = [...selected];
      if (mode === 'publish') await shipmentsService.publish(shipmentId, ids);
      else await shipmentsService.addShares(shipmentId, ids);
    },
    onSuccess: () => {
      Alert.alert(copy.done);
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
    onError: (error: unknown) =>
      Alert.alert('Action failed', error instanceof ApiError ? error.message : 'Something went wrong'),
  });

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  if (mode === 'add' && choices.length === 0) return null;

  return (
    <Card>
      <Text variant="title">{copy.title}</Text>
      <Text variant="caption" color="textSecondary">
        {copy.body}
      </Text>
      {choices.length === 0 && (
        <Text variant="body" color="textSecondary">
          No linked transporters yet — invite one from Network first.
        </Text>
      )}
      {choices.map((choice) => {
        const checked = selected.has(choice.transporter_company_id);
        return (
          <Pressable
            key={choice.transporter_company_id}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            accessibilityLabel={choice.transporter_company_name}
            onPress={() => toggle(choice.transporter_company_id)}
            style={styles.row}
          >
            <View
              style={[
                styles.box,
                { borderColor: theme.colors.navy },
                checked && { backgroundColor: theme.colors.navy },
              ]}
            >
              {checked && (
                <Text variant="caption" weight="semibold" style={styles.tick}>
                  ✓
                </Text>
              )}
            </View>
            <Text variant="body">{choice.transporter_company_name}</Text>
          </Pressable>
        );
      })}
      <Button
        label={copy.submit}
        disabled={selected.size === 0}
        loading={mutation.isPending}
        onPress={() => mutation.mutate()}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: minTouchTarget,
  },
  box: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: { color: '#FFFFFF' },
});
