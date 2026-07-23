import { Text as RNText, type TextProps } from 'react-native';

import { useTheme } from '@/theme/useTheme';
import { ColorToken, fontFamily, typography } from '@/theme/tokens';

type Variant = keyof typeof typography;

export interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: ColorToken;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

const weightToFontFamily: Record<NonNullable<AppTextProps['weight']>, string> = {
  regular: fontFamily.sans,
  medium: fontFamily.sansMedium,
  semibold: fontFamily.sansSemibold,
  bold: fontFamily.sansBold,
};

/** The one place font size/weight/color get resolved — every screen should
 * reach for this instead of react-native's bare Text, so typography stays
 * consistent with the design system's scale (theme/tokens.ts). */
export function Text({ variant = 'body', color, weight, style, ...rest }: AppTextProps) {
  const theme = useTheme();
  const scale = typography[variant];
  const resolvedWeight = weight ?? (scale.fontWeight === '700' ? 'bold' : scale.fontWeight === '600' ? 'semibold' : scale.fontWeight === '500' ? 'medium' : 'regular');

  return (
    <RNText
      style={[
        {
          fontSize: scale.fontSize,
          lineHeight: scale.lineHeight,
          letterSpacing: scale.letterSpacing,
          fontFamily: weightToFontFamily[resolvedWeight],
          color: theme.colors[color ?? 'text'],
        },
        style,
      ]}
      {...rest}
    />
  );
}
