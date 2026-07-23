import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { Text } from './Text';
import { useTheme } from '@/theme/useTheme';
import { minTouchTarget, radius, spacing } from '@/theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const sizeToHeight: Record<ButtonSize, number> = { sm: 40, md: minTouchTarget, lg: 56 };

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = true,
  disabled,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgrounds: Record<ButtonVariant, string> = {
    primary: theme.colors.navy,
    secondary: theme.colors.green,
    outline: 'transparent',
    ghost: 'transparent',
    danger: theme.colors.danger,
  };
  const textColors: Record<ButtonVariant, string> = {
    primary: '#FFFFFF',
    secondary: '#0A0E1F',
    outline: theme.colors.navy,
    ghost: theme.colors.navy,
    danger: '#FFFFFF',
  };

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          height: sizeToHeight[size],
          backgroundColor: backgrounds[variant],
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: theme.colors.navy,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} />
      ) : (
        <Text variant="button" style={{ color: textColors[variant] }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
});
