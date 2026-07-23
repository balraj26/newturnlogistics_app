import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button, Card, EmptyState, Input, Text, TopAppBar } from '@/components/ui';
import { ApiError } from '@/lib/api-client';
import { masterDataService } from '@/services/master-data';
import { spacing } from '@/theme/tokens';

const vehicleSchema = z.object({
  registration_number: z.string().min(2, 'Enter a registration number'),
  vehicle_type: z.string().min(2, 'Enter a vehicle type'),
  capacity_kg: z.coerce.number().positive('Enter a capacity'),
});
type VehicleValues = z.infer<typeof vehicleSchema>;

const driverSchema = z.object({
  full_name: z.string().min(2, 'Enter a full name'),
  license_number: z.string().min(2, 'Enter a license number'),
  phone: z.string().min(6, 'Enter a phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type DriverValues = z.infer<typeof driverSchema>;

function AddVehicleForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient();
  const { control, handleSubmit, formState: { errors } } = useForm<VehicleValues>({ resolver: zodResolver(vehicleSchema) as Resolver<VehicleValues> });
  const mutation = useMutation({
    mutationFn: masterDataService.createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-data', 'vehicles'] });
      onDone();
    },
    onError: (error) => Alert.alert('Failed', error instanceof ApiError ? error.message : 'Something went wrong'),
  });

  return (
    <Card>
      <Controller control={control} name="registration_number" render={({ field }) => (
        <Input label="Registration number" onChangeText={field.onChange} error={errors.registration_number?.message} />
      )} />
      <Controller control={control} name="vehicle_type" render={({ field }) => (
        <Input label="Vehicle type" onChangeText={field.onChange} error={errors.vehicle_type?.message} />
      )} />
      <Controller control={control} name="capacity_kg" render={({ field }) => (
        <Input label="Capacity (kg)" keyboardType="numeric" onChangeText={field.onChange} error={errors.capacity_kg?.message} />
      )} />
      <Button label={mutation.isPending ? 'Adding...' : 'Add vehicle'} onPress={handleSubmit((v) => mutation.mutate(v))} loading={mutation.isPending} />
    </Card>
  );
}

function AddDriverForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient();
  const { control, handleSubmit, formState: { errors } } = useForm<DriverValues>({ resolver: zodResolver(driverSchema) });
  const mutation = useMutation({
    mutationFn: masterDataService.createDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-data', 'drivers'] });
      onDone();
    },
    onError: (error) => Alert.alert('Failed', error instanceof ApiError ? error.message : 'Something went wrong'),
  });

  return (
    <Card>
      <Controller control={control} name="full_name" render={({ field }) => (
        <Input label="Full name" onChangeText={field.onChange} error={errors.full_name?.message} />
      )} />
      <Controller control={control} name="license_number" render={({ field }) => (
        <Input label="License number" onChangeText={field.onChange} error={errors.license_number?.message} />
      )} />
      <Controller control={control} name="phone" render={({ field }) => (
        <Input label="Phone" keyboardType="phone-pad" onChangeText={field.onChange} error={errors.phone?.message} />
      )} />
      <Controller control={control} name="password" render={({ field }) => (
        <Input label="Temporary password" secureTextEntry onChangeText={field.onChange} error={errors.password?.message} />
      )} />
      <Text variant="caption" color="textSecondary">
        The driver logs into this same app with their phone/email and this password.
      </Text>
      <Button label={mutation.isPending ? 'Adding...' : 'Add driver'} onPress={handleSubmit((v) => mutation.mutate(v))} loading={mutation.isPending} />
    </Card>
  );
}

export default function FleetScreen() {
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [addingDriver, setAddingDriver] = useState(false);

  const { data: vehicles } = useQuery({ queryKey: ['master-data', 'vehicles'], queryFn: masterDataService.listVehicles });
  const { data: drivers } = useQuery({ queryKey: ['master-data', 'drivers'], queryFn: masterDataService.listDrivers });

  return (
    <View style={styles.flex}>
      <TopAppBar title="Fleet" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.row}>
          <Text variant="h3" style={styles.grow}>
            Vehicles
          </Text>
          <Button label={addingVehicle ? 'Cancel' : 'Add'} variant="outline" size="sm" fullWidth={false} onPress={() => setAddingVehicle((v) => !v)} />
        </View>
        {addingVehicle && <AddVehicleForm onDone={() => setAddingVehicle(false)} />}
        {(vehicles ?? []).length === 0 && !addingVehicle && <EmptyState title="No vehicles yet" />}
        {(vehicles ?? []).map((vehicle) => (
          <Card key={vehicle.id}>
            <Text variant="title">{vehicle.registration_number}</Text>
            <Text variant="body" color="textSecondary">
              {vehicle.vehicle_type} &middot; {vehicle.capacity_kg.toLocaleString()} kg
            </Text>
          </Card>
        ))}

        <View style={[styles.row, styles.sectionSpacing]}>
          <Text variant="h3" style={styles.grow}>
            Drivers
          </Text>
          <Button label={addingDriver ? 'Cancel' : 'Add'} variant="outline" size="sm" fullWidth={false} onPress={() => setAddingDriver((v) => !v)} />
        </View>
        {addingDriver && <AddDriverForm onDone={() => setAddingDriver(false)} />}
        {(drivers ?? []).length === 0 && !addingDriver && <EmptyState title="No drivers yet" />}
        {(drivers ?? []).map((driver) => (
          <Card key={driver.id}>
            <Text variant="title">{driver.full_name}</Text>
            <Text variant="body" color="textSecondary">
              {driver.license_number}
              {driver.phone ? ` · ${driver.phone}` : ''}
            </Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  grow: { flex: 1 },
  sectionSpacing: { marginTop: spacing.md },
});
