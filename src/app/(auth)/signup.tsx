import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button, Input, Screen, Text } from '@/components/ui';
import { ApiError } from '@/lib/api-client';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/auth-store';
import { useTheme } from '@/theme/useTheme';
import { radius, spacing } from '@/theme/tokens';

const signupSchema = z.object({
  organization_name: z.string().min(2, 'Enter your organization name'),
  company_name: z.string().min(2, 'Enter your company name'),
  company_type: z.enum(['factory_owner', 'transporter']),
  full_name: z.string().min(2, 'Enter your full name'),
  phone: z.string().optional(),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type SignupValues = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const router = useRouter();
  const setPendingVerification = useAuthStore((state) => state.setPendingVerification);
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { company_type: 'factory_owner' },
  });
  const companyType = watch('company_type');

  const onSubmit = async (values: SignupValues) => {
    setIsSubmitting(true);
    try {
      const pending = await authService.register({
        ...values,
        phone: values.phone || undefined,
      });
      setPendingVerification({ token: pending.pending_token, email: pending.email });
      router.replace('/(auth)/verify-email');
    } catch (error) {
      Alert.alert('Signup failed', error instanceof ApiError ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={styles.flex}>
        <Image source={require('@/assets/brand/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text variant="h1" style={styles.center}>
          Create your company account
        </Text>
        <Text variant="body" color="textSecondary" style={styles.center}>
          Start posting loads and managing shipments in minutes.
        </Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="organization_name"
            render={({ field }) => (
              <Input label="Organization name" value={field.value} onChangeText={field.onChange} error={errors.organization_name?.message} />
            )}
          />
          <Controller
            control={control}
            name="company_name"
            render={({ field }) => (
              <Input label="Company name" value={field.value} onChangeText={field.onChange} error={errors.company_name?.message} />
            )}
          />

          <View style={styles.inputGroup}>
            <Text variant="label" color="textSecondary">
              Company type
            </Text>
            <View style={styles.segmented}>
              {(['factory_owner', 'transporter'] as const).map((type) => {
                const active = companyType === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => setValue('company_type', type)}
                    style={[
                      styles.segment,
                      { backgroundColor: active ? theme.colors.navy : theme.colors.surface, borderColor: theme.colors.border },
                    ]}
                  >
                    <Text variant="body" style={{ color: active ? '#FFFFFF' : theme.colors.text }}>
                      {type === 'factory_owner' ? 'Factory owner' : 'Transporter'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Controller
            control={control}
            name="full_name"
            render={({ field }) => (
              <Input label="Your full name" value={field.value} onChangeText={field.onChange} error={errors.full_name?.message} />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input label="Email" keyboardType="email-address" autoCapitalize="none" value={field.value} onChangeText={field.onChange} error={errors.email?.message} />
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <Input label="Phone number (optional)" keyboardType="phone-pad" value={field.value} onChangeText={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input label="Password" secureTextEntry value={field.value} onChangeText={field.onChange} error={errors.password?.message} />
            )}
          />

          <Button label={isSubmitting ? 'Creating account...' : 'Create account'} onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
        </View>

        <View style={styles.footer}>
          <Text variant="body" color="textSecondary">
            Already have an account?{' '}
          </Text>
          <Link href="/(auth)/login">
            <Text variant="body" weight="semibold" color="navy">
              Log in
            </Text>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  logo: { width: 140, height: 56, alignSelf: 'center', marginBottom: spacing.sm },
  form: { gap: spacing.md, marginTop: spacing.lg },
  inputGroup: { gap: spacing.xs },
  segmented: { flexDirection: 'row', gap: spacing.sm },
  segment: { flex: 1, borderWidth: 1.5, borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg, marginBottom: spacing.lg },
});
