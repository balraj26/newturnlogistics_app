import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button, Input, Screen, Text } from '@/components/ui';
import { ApiError } from '@/lib/api-client';
import { authService } from '@/services/auth';
import { usersService } from '@/services/users';
import { useAuthStore } from '@/store/auth-store';
import { spacing } from '@/theme/tokens';

const codeSchema = z.object({ code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code') });
type CodeValues = z.infer<typeof codeSchema>;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const pendingVerification = useAuthStore((state) => state.pendingVerification);
  const setSession = useAuthStore((state) => state.setSession);
  const setUser = useAuthStore((state) => state.setUser);
  const clearPendingVerification = useAuthStore((state) => state.clearPendingVerification);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CodeValues>({ resolver: zodResolver(codeSchema) });

  if (!pendingVerification) {
    return <Redirect href="/(auth)/login" />;
  }

  const onSubmit = async (values: CodeValues) => {
    setIsSubmitting(true);
    try {
      const tokens = await authService.confirmPendingEmailVerification(pendingVerification.token, values.code);
      setSession(tokens);
      const me = await usersService.me();
      setUser(me);
      clearPendingVerification();
      router.replace('/(app)');
    } catch (error) {
      Alert.alert('Verification failed', error instanceof ApiError ? error.message : 'Invalid or expired code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResend = async () => {
    setIsResending(true);
    try {
      await authService.resendPendingEmailVerification(pendingVerification.token);
      Alert.alert('Code sent', `A new code was sent to ${pendingVerification.email}.`);
    } catch (error) {
      Alert.alert('Failed to resend', error instanceof ApiError ? error.message : 'Something went wrong');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Screen scroll={false}>
      <View style={styles.content}>
        <Text variant="h1" style={styles.center}>
          Verify your email
        </Text>
        <Text variant="body" color="textSecondary" style={styles.center}>
          Enter the 6-digit code sent to {pendingVerification.email}. It expires in 10 minutes.
        </Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="code"
            render={({ field }) => (
              <Input
                label="Verification code"
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="one-time-code"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.code?.message}
              />
            )}
          />
          <Button label={isSubmitting ? 'Verifying...' : 'Verify'} onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
          <Button label="Resend code" variant="ghost" onPress={onResend} loading={isResending} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  center: { textAlign: 'center' },
  form: { gap: spacing.md, marginTop: spacing.lg },
});
