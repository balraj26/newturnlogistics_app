import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button, Input, Screen, Text } from '@/components/ui';
import { ApiError } from '@/lib/api-client';
import { authService } from '@/services/auth';
import { usersService } from '@/services/users';
import { useAuthStore } from '@/store/auth-store';
import { spacing } from '@/theme/tokens';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Enter your phone number or email'),
  password: z.string().min(1, 'Password is required'),
});
type LoginValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const setUser = useAuthStore((state) => state.setUser);
  const setPendingVerification = useAuthStore((state) => state.setPendingVerification);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    setIsSubmitting(true);
    try {
      const isEmail = values.identifier.includes('@');
      const response = await authService.login({
        phone: isEmail ? undefined : values.identifier,
        email: isEmail ? values.identifier : undefined,
        password: values.password,
      });

      if (response.status === 'email_verification_required') {
        setPendingVerification({ token: response.pending_token as string, email: response.email ?? '' });
        router.replace('/(auth)/verify-email');
        return;
      }

      setSession(response.tokens!);
      const me = await usersService.me();
      setUser(me);
      router.replace('/(app)');
    } catch (error) {
      Alert.alert('Login failed', error instanceof ApiError ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={styles.flex}>
        <View style={styles.content}>
          <Image source={require('@/assets/brand/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text variant="h1" style={styles.center}>
            Log in
          </Text>
          <Text variant="body" color="textSecondary" style={styles.center}>
            Welcome back to NewTurn Logistics.
          </Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="identifier"
              render={({ field }) => (
                <Input
                  label="Phone or email"
                  autoCapitalize="none"
                  autoComplete="username"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.identifier?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <Input
                  label="Password"
                  secureTextEntry
                  autoComplete="current-password"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.password?.message}
                />
              )}
            />

            <Button label={isSubmitting ? 'Logging in...' : 'Log in'} onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
          </View>

          <View style={styles.footer}>
            <Text variant="body" color="textSecondary">
              Don&apos;t have an account?{' '}
            </Text>
            <Link href="/(auth)/signup">
              <Text variant="body" weight="semibold" color="navy">
                Sign up
              </Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.sm },
  center: { textAlign: 'center' },
  logo: { width: 160, height: 64, alignSelf: 'center', marginBottom: spacing.md },
  form: { gap: spacing.md, marginTop: spacing.lg },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
});
