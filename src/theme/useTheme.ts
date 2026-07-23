import { useColorScheme } from 'react-native';

import { colors, ThemeMode } from './tokens';

export function useTheme() {
  const scheme = useColorScheme();
  const mode: ThemeMode = scheme === 'dark' ? 'dark' : 'light';
  return { mode, colors: colors[mode] };
}
