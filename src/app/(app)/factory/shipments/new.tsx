import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button, Card, EmptyState, Input, Text, TopAppBar } from '@/components/ui';
import { ApiError } from '@/lib/api-client';
import { masterDataService } from '@/services/master-data';
import { shipmentsService } from '@/services/shipments';
import { spacing } from '@/theme/tokens';
import type { UUID } from '@/types/api';

const formSchema = z.object({
  weight_kg: z.coerce.number().positive('Enter a weight'),
  required_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  special_instructions: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

function PickerRow<T extends { id: UUID }>({
  items,
  selectedId,
  onSelect,
  label,
}: {
  items: T[];
  selectedId: UUID | null;
  onSelect: (id: UUID) => void;
  label: (item: T) => string;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerRow}>
      {items.map((item) => {
        const active = item.id === selectedId;
        return (
          <Button
            key={item.id}
            label={label(item)}
            variant={active ? 'primary' : 'outline'}
            size="sm"
            fullWidth={false}
            onPress={() => onSelect(item.id)}
          />
        );
      })}
    </ScrollView>
  );
}

export default function NewShipmentScreen() {
  const router = useRouter();
  const [customerId, setCustomerId] = useState<UUID | null>(null);
  const [originId, setOriginId] = useState<UUID | null>(null);
  const [destinationId, setDestinationId] = useState<UUID | null>(null);

  const { data: customers } = useQuery({
    queryKey: ['master-data', 'business-partners', 'customer'],
    queryFn: () => masterDataService.listBusinessPartners('customer'),
  });
  const { data: locations } = useQuery({
    queryKey: ['master-data', 'locations'],
    queryFn: () => masterDataService.listLocations(),
  });

  const originCandidates = (locations ?? []).filter((l) => l.business_partner_id === null);
  const destinationCandidates = (locations ?? []).filter((l) => l.business_partner_id === customerId);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) as Resolver<FormValues> });

  const createShipment = useMutation({
    mutationFn: (values: FormValues) =>
      shipmentsService.create({
        ...values,
        customer_id: customerId!,
        origin_location_id: originId!,
        destination_location_id: destinationId!,
      }),
    onSuccess: (shipment) => {
      router.replace(`/(app)/factory/shipments/${shipment.id}` as never);
    },
    onError: (error) => Alert.alert('Failed', error instanceof ApiError ? error.message : 'Something went wrong'),
  });

  const onSubmit = (values: FormValues) => {
    if (!customerId || !originId || !destinationId) {
      Alert.alert('Missing selection', 'Choose a customer, origin, and destination first.');
      return;
    }
    createShipment.mutate(values);
  };

  return (
    <View style={styles.flex}>
      <TopAppBar title="New shipment" back />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text variant="label" color="textSecondary">
            CUSTOMER
          </Text>
          {(customers ?? []).length === 0 ? (
            <EmptyState title="No customers yet" body="Add one from the web dashboard's Master Data section first." />
          ) : (
            <PickerRow items={customers ?? []} selectedId={customerId} onSelect={setCustomerId} label={(c) => c.name} />
          )}
        </Card>

        <Card>
          <Text variant="label" color="textSecondary">
            ORIGIN (your address)
          </Text>
          {originCandidates.length === 0 ? (
            <EmptyState title="No pickup addresses yet" body="Add one from the web dashboard's Master Data section first." />
          ) : (
            <PickerRow items={originCandidates} selectedId={originId} onSelect={setOriginId} label={(l) => l.name} />
          )}
        </Card>

        {customerId && (
          <Card>
            <Text variant="label" color="textSecondary">
              DESTINATION (customer address)
            </Text>
            {destinationCandidates.length === 0 ? (
              <EmptyState title="No addresses for this customer yet" body="Add one from the web dashboard first." />
            ) : (
              <PickerRow items={destinationCandidates} selectedId={destinationId} onSelect={setDestinationId} label={(l) => l.name} />
            )}
          </Card>
        )}

        <Card>
          <Controller
            control={control}
            name="weight_kg"
            render={({ field }) => (
              <Input label="Weight (kg)" keyboardType="numeric" onChangeText={field.onChange} error={errors.weight_kg?.message} />
            )}
          />
          <Controller
            control={control}
            name="required_date"
            render={({ field }) => (
              <Input label="Required date (YYYY-MM-DD)" onChangeText={field.onChange} error={errors.required_date?.message} />
            )}
          />
          <Controller
            control={control}
            name="special_instructions"
            render={({ field }) => <Input label="Special instructions (optional)" onChangeText={field.onChange} />}
          />
        </Card>

        <Button
          label={createShipment.isPending ? 'Creating...' : 'Create shipment'}
          onPress={handleSubmit(onSubmit)}
          loading={createShipment.isPending}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md },
  pickerRow: { gap: spacing.sm },
});
