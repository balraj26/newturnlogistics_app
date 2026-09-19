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
import type { PartnerType, UUID } from '@/types/api';

const ENTITIES = [
  'Vehicles',
  'Drivers',
  'Materials',
  'Business Partners',
  'Locations',
  'Warehouses',
  'Routes',
  'Trailers',
] as const;
type Entity = (typeof ENTITIES)[number];

function EntityTabs({ active, onSelect }: { active: Entity; onSelect: (e: Entity) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
      {ENTITIES.map((entity) => (
        <Button
          key={entity}
          label={entity}
          variant={entity === active ? 'primary' : 'outline'}
          size="sm"
          fullWidth={false}
          onPress={() => onSelect(entity)}
        />
      ))}
    </ScrollView>
  );
}

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
      {items.map((item) => (
        <Button
          key={item.id}
          label={label(item)}
          variant={item.id === selectedId ? 'primary' : 'outline'}
          size="sm"
          fullWidth={false}
          onPress={() => onSelect(item.id)}
        />
      ))}
    </ScrollView>
  );
}

const vehicleSchema = z.object({
  registration_number: z.string().min(1, 'Required'),
  vehicle_type: z.string().min(1, 'Required'),
  capacity_kg: z.coerce.number().positive('Enter a capacity'),
});
type VehicleValues = z.infer<typeof vehicleSchema>;

function VehiclesPanel() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['master-data', 'vehicles'], queryFn: masterDataService.listVehicles });
  const { control, handleSubmit, reset, formState: { errors } } = useForm<VehicleValues>({
    resolver: zodResolver(vehicleSchema) as Resolver<VehicleValues>,
  });
  const create = useMutation({
    mutationFn: (values: VehicleValues) => masterDataService.createVehicle(values),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['master-data', 'vehicles'] });
    },
    onError: (error) => Alert.alert('Failed', error instanceof ApiError ? error.message : 'Something went wrong'),
  });

  return (
    <>
      <Card>
        <Text variant="title">Add a vehicle</Text>
        <Controller control={control} name="registration_number" render={({ field }) => (
          <Input label="Registration number" value={field.value ?? ''} onChangeText={field.onChange} error={errors.registration_number?.message} />
        )} />
        <Controller control={control} name="vehicle_type" render={({ field }) => (
          <Input label="Vehicle type" value={field.value ?? ''} onChangeText={field.onChange} error={errors.vehicle_type?.message} />
        )} />
        <Controller control={control} name="capacity_kg" render={({ field }) => (
          <Input label="Capacity (kg)" keyboardType="numeric" value={String(field.value ?? '')} onChangeText={field.onChange} error={errors.capacity_kg?.message} />
        )} />
        <Button label={create.isPending ? 'Adding...' : 'Add vehicle'} onPress={handleSubmit((v) => create.mutate(v))} loading={create.isPending} />
      </Card>
      {(data ?? []).length === 0 && <EmptyState title="No vehicles yet" />}
      {(data ?? []).map((v) => (
        <Card key={v.id}>
          <Text variant="title">{v.registration_number}</Text>
          <Text variant="body" color="textSecondary">{v.vehicle_type} &middot; {v.capacity_kg.toLocaleString()} kg</Text>
        </Card>
      ))}
    </>
  );
}

const driverSchema = z.object({
  full_name: z.string().min(1, 'Required'),
  license_number: z.string().min(1, 'Required'),
  phone: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});
type DriverValues = z.infer<typeof driverSchema>;

function DriversPanel() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['master-data', 'drivers'], queryFn: masterDataService.listDrivers });
  const { control, handleSubmit, reset, formState: { errors } } = useForm<DriverValues>({
    resolver: zodResolver(driverSchema) as Resolver<DriverValues>,
  });
  const create = useMutation({
    mutationFn: (values: DriverValues) => masterDataService.createDriver(values),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['master-data', 'drivers'] });
    },
    onError: (error) => Alert.alert('Failed', error instanceof ApiError ? error.message : 'Something went wrong'),
  });

  return (
    <>
      <Card>
        <Text variant="title">Add a driver</Text>
        <Controller control={control} name="full_name" render={({ field }) => (
          <Input label="Full name" value={field.value ?? ''} onChangeText={field.onChange} error={errors.full_name?.message} />
        )} />
        <Controller control={control} name="license_number" render={({ field }) => (
          <Input label="License number" value={field.value ?? ''} onChangeText={field.onChange} error={errors.license_number?.message} />
        )} />
        <Controller control={control} name="phone" render={({ field }) => (
          <Input label="Phone" keyboardType="phone-pad" value={field.value ?? ''} onChangeText={field.onChange} error={errors.phone?.message} />
        )} />
        <Controller control={control} name="email" render={({ field }) => (
          <Input label="Email (for driver login)" keyboardType="email-address" autoCapitalize="none" value={field.value ?? ''} onChangeText={field.onChange} error={errors.email?.message} />
        )} />
        <Controller control={control} name="password" render={({ field }) => (
          <Input label="Temporary password" secureTextEntry value={field.value ?? ''} onChangeText={field.onChange} error={errors.password?.message} />
        )} />
        <Button label={create.isPending ? 'Adding...' : 'Add driver'} onPress={handleSubmit((v) => create.mutate(v))} loading={create.isPending} />
      </Card>
      {(data ?? []).length === 0 && <EmptyState title="No drivers yet" />}
      {(data ?? []).map((d) => (
        <Card key={d.id}>
          <Text variant="title">{d.full_name}</Text>
          <Text variant="body" color="textSecondary">{d.license_number}{d.phone ? ` · ${d.phone}` : ''}</Text>
        </Card>
      ))}
    </>
  );
}

const materialSchema = z.object({
  name: z.string().min(1, 'Required'),
  code: z.string().min(1, 'Required'),
  unit: z.string().min(1, 'Required'),
  hsn_code: z.string().optional(),
});
type MaterialValues = z.infer<typeof materialSchema>;

function MaterialsPanel() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['master-data', 'materials'], queryFn: masterDataService.listMaterials });
  const { control, handleSubmit, reset, formState: { errors } } = useForm<MaterialValues>({
    resolver: zodResolver(materialSchema) as Resolver<MaterialValues>,
  });
  const create = useMutation({
    mutationFn: (values: MaterialValues) => masterDataService.createMaterial(values),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['master-data', 'materials'] });
    },
    onError: (error) => Alert.alert('Failed', error instanceof ApiError ? error.message : 'Something went wrong'),
  });

  return (
    <>
      <Card>
        <Text variant="title">Add a material</Text>
        <Controller control={control} name="name" render={({ field }) => (
          <Input label="Name" value={field.value ?? ''} onChangeText={field.onChange} error={errors.name?.message} />
        )} />
        <Controller control={control} name="code" render={({ field }) => (
          <Input label="Code" value={field.value ?? ''} onChangeText={field.onChange} error={errors.code?.message} />
        )} />
        <Controller control={control} name="unit" render={({ field }) => (
          <Input label="Unit" value={field.value ?? ''} onChangeText={field.onChange} error={errors.unit?.message} />
        )} />
        <Controller control={control} name="hsn_code" render={({ field }) => (
          <Input label="HSN code (optional)" value={field.value ?? ''} onChangeText={field.onChange} />
        )} />
        <Button label={create.isPending ? 'Adding...' : 'Add material'} onPress={handleSubmit((v) => create.mutate(v))} loading={create.isPending} />
      </Card>
      {(data ?? []).length === 0 && <EmptyState title="No materials yet" />}
      {(data ?? []).map((m) => (
        <Card key={m.id}>
          <Text variant="title">{m.name}</Text>
          <Text variant="body" color="textSecondary">{m.code} &middot; {m.unit}</Text>
        </Card>
      ))}
    </>
  );
}

const PARTNER_TYPES: PartnerType[] = ['customer', 'consignee', 'vendor'];
const businessPartnerSchema = z.object({
  name: z.string().min(1, 'Required'),
  contact_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});
type BusinessPartnerValues = z.infer<typeof businessPartnerSchema>;

function BusinessPartnersPanel() {
  const queryClient = useQueryClient();
  const [partnerType, setPartnerType] = useState<PartnerType>('customer');
  const { data } = useQuery({
    queryKey: ['master-data', 'business-partners'],
    queryFn: () => masterDataService.listBusinessPartners(),
  });
  const { control, handleSubmit, reset, formState: { errors } } = useForm<BusinessPartnerValues>({
    resolver: zodResolver(businessPartnerSchema) as Resolver<BusinessPartnerValues>,
  });
  const create = useMutation({
    mutationFn: (values: BusinessPartnerValues) =>
      masterDataService.createBusinessPartner({ ...values, partner_type: partnerType }),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['master-data', 'business-partners'] });
    },
    onError: (error) => Alert.alert('Failed', error instanceof ApiError ? error.message : 'Something went wrong'),
  });

  return (
    <>
      <Card>
        <Text variant="title">Add a business partner</Text>
        <Text variant="label" color="textSecondary">TYPE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerRow}>
          {PARTNER_TYPES.map((type) => (
            <Button key={type} label={type} variant={type === partnerType ? 'primary' : 'outline'} size="sm" fullWidth={false} onPress={() => setPartnerType(type)} />
          ))}
        </ScrollView>
        <Controller control={control} name="name" render={({ field }) => (
          <Input label="Name" value={field.value ?? ''} onChangeText={field.onChange} error={errors.name?.message} />
        )} />
        <Controller control={control} name="contact_name" render={({ field }) => (
          <Input label="Contact name (optional)" value={field.value ?? ''} onChangeText={field.onChange} />
        )} />
        <Controller control={control} name="phone" render={({ field }) => (
          <Input label="Phone (optional)" keyboardType="phone-pad" value={field.value ?? ''} onChangeText={field.onChange} />
        )} />
        <Controller control={control} name="email" render={({ field }) => (
          <Input label="Email (optional)" keyboardType="email-address" autoCapitalize="none" value={field.value ?? ''} onChangeText={field.onChange} />
        )} />
        <Button label={create.isPending ? 'Adding...' : 'Add business partner'} onPress={handleSubmit((v) => create.mutate(v))} loading={create.isPending} />
      </Card>
      {(data ?? []).length === 0 && <EmptyState title="No business partners yet" />}
      {(data ?? []).map((p) => (
        <Card key={p.id}>
          <Text variant="title">{p.name}</Text>
          <Text variant="body" color="textSecondary">{p.partner_type}</Text>
        </Card>
      ))}
    </>
  );
}

const locationSchema = z.object({
  name: z.string().min(1, 'Required'),
  address: z.string().optional(),
  city: z.string().min(1, 'Required'),
  district: z.string().optional(),
  state: z.string().min(1, 'Required'),
  pincode: z.string().min(1, 'Required'),
});
type LocationValues = z.infer<typeof locationSchema>;

function LocationsPanel() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['master-data', 'locations'], queryFn: () => masterDataService.listLocations() });
  const { control, handleSubmit, reset, formState: { errors } } = useForm<LocationValues>({
    resolver: zodResolver(locationSchema) as Resolver<LocationValues>,
  });
  const create = useMutation({
    mutationFn: (values: LocationValues) => masterDataService.createLocation(values),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['master-data', 'locations'] });
    },
    onError: (error) => Alert.alert('Failed', error instanceof ApiError ? error.message : 'Something went wrong'),
  });

  return (
    <>
      <Card>
        <Text variant="title">Add a location</Text>
        <Controller control={control} name="name" render={({ field }) => (
          <Input label="Name" value={field.value ?? ''} onChangeText={field.onChange} error={errors.name?.message} />
        )} />
        <Controller control={control} name="address" render={({ field }) => (
          <Input label="Address (optional)" value={field.value ?? ''} onChangeText={field.onChange} />
        )} />
        <Controller control={control} name="city" render={({ field }) => (
          <Input label="City" value={field.value ?? ''} onChangeText={field.onChange} error={errors.city?.message} />
        )} />
        <Controller control={control} name="state" render={({ field }) => (
          <Input label="State" value={field.value ?? ''} onChangeText={field.onChange} error={errors.state?.message} />
        )} />
        <Controller control={control} name="pincode" render={({ field }) => (
          <Input label="Pincode" keyboardType="numeric" value={field.value ?? ''} onChangeText={field.onChange} error={errors.pincode?.message} />
        )} />
        <Button label={create.isPending ? 'Adding...' : 'Add location'} onPress={handleSubmit((v) => create.mutate(v))} loading={create.isPending} />
      </Card>
      {(data ?? []).length === 0 && <EmptyState title="No locations yet" />}
      {(data ?? []).map((l) => (
        <Card key={l.id}>
          <Text variant="title">{l.name}</Text>
          <Text variant="body" color="textSecondary">{l.city}, {l.state} {l.pincode}</Text>
        </Card>
      ))}
    </>
  );
}

function WarehousesPanel() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [locationId, setLocationId] = useState<UUID | null>(null);
  const { data } = useQuery({ queryKey: ['master-data', 'warehouses'], queryFn: masterDataService.listWarehouses });
  const { data: locations } = useQuery({ queryKey: ['master-data', 'locations'], queryFn: () => masterDataService.listLocations() });
  const create = useMutation({
    mutationFn: () => masterDataService.createWarehouse({ name, location_id: locationId! }),
    onSuccess: () => {
      setName('');
      setLocationId(null);
      queryClient.invalidateQueries({ queryKey: ['master-data', 'warehouses'] });
    },
    onError: (error) => Alert.alert('Failed', error instanceof ApiError ? error.message : 'Something went wrong'),
  });

  return (
    <>
      <Card>
        <Text variant="title">Add a warehouse</Text>
        <Input label="Name" value={name} onChangeText={setName} />
        <Text variant="label" color="textSecondary">LOCATION</Text>
        {(locations ?? []).length === 0 ? (
          <EmptyState title="No locations yet" body="Add a location first." />
        ) : (
          <PickerRow items={locations ?? []} selectedId={locationId} onSelect={setLocationId} label={(l) => l.name} />
        )}
        <Button
          label={create.isPending ? 'Adding...' : 'Add warehouse'}
          disabled={!name.trim() || !locationId}
          onPress={() => create.mutate()}
          loading={create.isPending}
        />
      </Card>
      {(data ?? []).length === 0 && <EmptyState title="No warehouses yet" />}
      {(data ?? []).map((w) => (
        <Card key={w.id}>
          <Text variant="title">{w.name}</Text>
        </Card>
      ))}
    </>
  );
}

function RoutesPanel() {
  const queryClient = useQueryClient();
  const [originId, setOriginId] = useState<UUID | null>(null);
  const [destinationId, setDestinationId] = useState<UUID | null>(null);
  const { data } = useQuery({ queryKey: ['master-data', 'routes'], queryFn: masterDataService.listRoutes });
  const { data: locations } = useQuery({ queryKey: ['master-data', 'locations'], queryFn: () => masterDataService.listLocations() });
  const create = useMutation({
    mutationFn: () => masterDataService.createRoute({ origin_location_id: originId!, destination_location_id: destinationId! }),
    onSuccess: () => {
      setOriginId(null);
      setDestinationId(null);
      queryClient.invalidateQueries({ queryKey: ['master-data', 'routes'] });
    },
    onError: (error) => Alert.alert('Failed', error instanceof ApiError ? error.message : 'Something went wrong'),
  });
  const locationName = (id: UUID) => (locations ?? []).find((l) => l.id === id)?.name ?? id.slice(0, 8);

  return (
    <>
      <Card>
        <Text variant="title">Add a route</Text>
        <Text variant="label" color="textSecondary">ORIGIN</Text>
        {(locations ?? []).length === 0 ? (
          <EmptyState title="No locations yet" body="Add a location first." />
        ) : (
          <PickerRow items={locations ?? []} selectedId={originId} onSelect={setOriginId} label={(l) => l.name} />
        )}
        <Text variant="label" color="textSecondary">DESTINATION</Text>
        {(locations ?? []).length === 0 ? null : (
          <PickerRow items={locations ?? []} selectedId={destinationId} onSelect={setDestinationId} label={(l) => l.name} />
        )}
        <Button
          label={create.isPending ? 'Adding...' : 'Add route'}
          disabled={!originId || !destinationId}
          onPress={() => create.mutate()}
          loading={create.isPending}
        />
      </Card>
      {(data ?? []).length === 0 && <EmptyState title="No routes yet" />}
      {(data ?? []).map((r) => (
        <Card key={r.id}>
          <Text variant="title">{locationName(r.origin_location_id)} &rarr; {locationName(r.destination_location_id)}</Text>
          {r.distance_km != null && <Text variant="body" color="textSecondary">{r.distance_km} km</Text>}
        </Card>
      ))}
    </>
  );
}

const trailerSchema = z.object({
  registration_number: z.string().min(1, 'Required'),
  trailer_type: z.string().min(1, 'Required'),
});
type TrailerValues = z.infer<typeof trailerSchema>;

function TrailersPanel() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['master-data', 'trailers'], queryFn: masterDataService.listTrailers });
  const { control, handleSubmit, reset, formState: { errors } } = useForm<TrailerValues>({
    resolver: zodResolver(trailerSchema) as Resolver<TrailerValues>,
  });
  const create = useMutation({
    mutationFn: (values: TrailerValues) => masterDataService.createTrailer(values),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['master-data', 'trailers'] });
    },
    onError: (error) => Alert.alert('Failed', error instanceof ApiError ? error.message : 'Something went wrong'),
  });

  return (
    <>
      <Card>
        <Text variant="title">Add a trailer</Text>
        <Controller control={control} name="registration_number" render={({ field }) => (
          <Input label="Registration number" value={field.value ?? ''} onChangeText={field.onChange} error={errors.registration_number?.message} />
        )} />
        <Controller control={control} name="trailer_type" render={({ field }) => (
          <Input label="Trailer type" value={field.value ?? ''} onChangeText={field.onChange} error={errors.trailer_type?.message} />
        )} />
        <Button label={create.isPending ? 'Adding...' : 'Add trailer'} onPress={handleSubmit((v) => create.mutate(v))} loading={create.isPending} />
      </Card>
      {(data ?? []).length === 0 && <EmptyState title="No trailers yet" />}
      {(data ?? []).map((t) => (
        <Card key={t.id}>
          <Text variant="title">{t.registration_number}</Text>
          <Text variant="body" color="textSecondary">{t.trailer_type}</Text>
        </Card>
      ))}
    </>
  );
}

const PANELS: Record<Entity, () => React.JSX.Element> = {
  Vehicles: VehiclesPanel,
  Drivers: DriversPanel,
  Materials: MaterialsPanel,
  'Business Partners': BusinessPartnersPanel,
  Locations: LocationsPanel,
  Warehouses: WarehousesPanel,
  Routes: RoutesPanel,
  Trailers: TrailersPanel,
};

export default function MasterDataScreen() {
  const [active, setActive] = useState<Entity>('Vehicles');
  const ActivePanel = PANELS[active];

  return (
    <View style={styles.flex}>
      <TopAppBar title="Master Data" back />
      <EntityTabs active={active} onSelect={setActive} />
      <ScrollView contentContainerStyle={styles.content}>
        <ActivePanel />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabsRow: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  pickerRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  content: { padding: spacing.md, gap: spacing.md },
});
