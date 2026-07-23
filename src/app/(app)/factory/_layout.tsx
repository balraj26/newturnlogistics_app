import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme/useTheme';

export default function FactoryTabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.navy,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Shipments', tabBarIcon: ({ color, size }) => <Ionicons name="cube" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="network"
        options={{ title: 'Network', tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ title: 'Alerts', tabBarIcon: ({ color, size }) => <Ionicons name="notifications" size={size} color={color} /> }}
      />
      <Tabs.Screen name="shipments/[id]" options={{ href: null }} />
      <Tabs.Screen name="shipments/new" options={{ href: null }} />
    </Tabs>
  );
}
