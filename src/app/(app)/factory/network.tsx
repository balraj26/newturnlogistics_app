import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Button, Card, EmptyState, Input, StatusPill, Text, TopAppBar } from '@/components/ui';
import { ApiError } from '@/lib/api-client';
import { transporterNetworkService } from '@/services/transporter-network';
import { spacing } from '@/theme/tokens';

export default function NetworkScreen() {
  const queryClient = useQueryClient();
  const [publicCode, setPublicCode] = useState('');

  const { data: links } = useQuery({ queryKey: ['transporter-network', 'links'], queryFn: transporterNetworkService.listLinks });
  const { data: invites } = useQuery({ queryKey: ['transporter-network', 'invites'], queryFn: transporterNetworkService.listInvites });

  const invite = useMutation({
    mutationFn: () => transporterNetworkService.createInvite({ existing_transporter_public_code: publicCode }),
    onSuccess: () => {
      setPublicCode('');
      queryClient.invalidateQueries({ queryKey: ['transporter-network', 'invites'] });
      Alert.alert('Invite sent');
    },
    onError: (error) => Alert.alert('Failed', error instanceof ApiError ? error.message : 'Something went wrong'),
  });
  const revoke = useMutation({
    mutationFn: (id: string) => transporterNetworkService.revokeLink(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transporter-network', 'links'] }),
    onError: (error) => Alert.alert('Failed', error instanceof ApiError ? error.message : 'Something went wrong'),
  });

  return (
    <View style={styles.flex}>
      <TopAppBar title="Network" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text variant="title">Invite a transporter</Text>
          <Input label="Transporter public code" autoCapitalize="characters" value={publicCode} onChangeText={setPublicCode} />
          <Button label={invite.isPending ? 'Sending...' : 'Send invite'} onPress={() => invite.mutate()} loading={invite.isPending} />
        </Card>

        <Text variant="h3">Linked transporters</Text>
        {(links ?? []).length === 0 && <EmptyState title="No linked transporters yet" />}
        {(links ?? []).map((link) => (
          <Card key={link.id}>
            <View style={styles.row}>
              <StatusPill label={link.status} type={link.status === 'active' ? 'success' : 'danger'} />
              {link.status === 'active' && (
                <Button label="Revoke" variant="ghost" size="sm" fullWidth={false} onPress={() => revoke.mutate(link.id)} />
              )}
            </View>
          </Card>
        ))}

        <Text variant="h3">Pending invites</Text>
        {(invites ?? []).filter((i) => i.status === 'pending').length === 0 && <EmptyState title="No pending invites" />}
        {(invites ?? [])
          .filter((i) => i.status === 'pending')
          .map((inv) => (
            <Card key={inv.id}>
              <Text variant="body">{inv.invitee_phone || inv.invitee_email || 'Existing company invite'}</Text>
              <StatusPill label={inv.status} type="info" />
            </Card>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
