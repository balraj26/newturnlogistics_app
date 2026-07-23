/**
 * Design tokens ported from `NewTurn Mobile App Template` (the design-system
 * reference repo — src/index.css color values + src/imports/pasted_text/
 * newturn-mobile-ds.md's component/typography spec). That repo is a React
 * DOM/Tailwind showcase, not runnable RN code — these are the token *values*
 * carried over, rebuilt as plain StyleSheet-friendly objects.
 */

export const colors = {
  light: {
    navy: '#132058',
    navyDark: '#0C1640',
    navyMid: '#1E3080',
    green: '#3DD45A',
    greenDark: '#28B945',
    background: '#F4F5F9',
    surface: '#FFFFFF',
    border: '#E2E5EF',
    text: '#0A0E1F',
    textSecondary: '#5C6480',
    textTertiary: '#9BA3BE',
    danger: '#DC3545',
    dangerBg: '#FCE8EA',
    warning: '#F5A623',
    warningBg: '#FEF3E2',
    success: '#3DD45A',
    successBg: '#E9FBEE',
    info: '#3B82F6',
    infoBg: '#EAF2FE',
    disabled: '#D0D5E8',
  },
  dark: {
    navy: '#3B4A8F',
    navyDark: '#0C1640',
    navyMid: '#2A3D8F',
    green: '#3DD45A',
    greenDark: '#28B945',
    background: '#0A0E1F',
    surface: '#131A33',
    border: '#232B4A',
    text: '#F4F5F9',
    textSecondary: '#9BA3BE',
    textTertiary: '#5C6480',
    danger: '#F1707D',
    dangerBg: '#3A1620',
    warning: '#F5C063',
    warningBg: '#3A2C10',
    success: '#5FE07A',
    successBg: '#0F3320',
    info: '#6DA1FA',
    infoBg: '#132244',
    disabled: '#2A3350',
  },
} as const;

export type ThemeMode = keyof typeof colors;
export type ColorToken = keyof typeof colors.light;

/** 8pt grid, per the design system doc's "Grid System" section. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 999,
} as const;

/** Mobile typography scale, extending the enterprise system per the DS doc's
 * "Mobile Typography" section (Display/H1/H2/H3/Title/Subtitle/Body/Caption/Label). */
export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700' as const, letterSpacing: -0.02 },
  h1: { fontSize: 26, lineHeight: 32, fontWeight: '700' as const, letterSpacing: -0.025 },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const, letterSpacing: -0.02 },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const, letterSpacing: -0.01 },
  title: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const, letterSpacing: 0 },
  subtitle: { fontSize: 15, lineHeight: 20, fontWeight: '500' as const, letterSpacing: 0 },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const, letterSpacing: 0 },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const, letterSpacing: 0 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const, letterSpacing: 0.01 },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const, letterSpacing: 0.02 },
  button: { fontSize: 15, lineHeight: 20, fontWeight: '600' as const, letterSpacing: 0.01 },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '700' as const, letterSpacing: 0.08 },
} as const;

export const fontFamily = {
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemibold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
  mono: 'JetBrainsMono_400Regular',
} as const;

/** Minimum touch target, per the DS doc's Accessibility section. */
export const minTouchTarget = 48;
