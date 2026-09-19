import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import { useLogout } from '@/hooks/useLogout';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  /** Transporter Network is Consignor-only — a Transporter has no
   * factories to invite/link, that flow only makes sense from the
   * factory-owner side. */
  showTransporterNetwork: boolean;
}

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, onPress, danger }: MenuItemProps) {
  const theme = useTheme();
  const color = danger ? theme.colors.danger : theme.colors.text;
  return (
    <Pressable onPress={onPress} style={styles.item}>
      <Ionicons name={icon} size={22} color={color} />
      <Text variant="bodyLarge" style={{ color }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Lightweight custom slide-in panel — deliberately not Expo Router's Drawer
 * navigator (see the plan this was built from): only 4 items, and this
 * avoids restructuring (app)/ into nested (drawer)/(tabs) route groups. */
export function SideMenu({ visible, onClose, showTransporterNetwork }: SideMenuProps) {
  const theme = useTheme();
  const router = useRouter();
  const logout = useLogout();

  const go = (path: '/(app)/home/master-data' | '/(app)/home/network' | '/(app)/home/profile') => {
    onClose();
    router.push(path);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.panel, { backgroundColor: theme.colors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text variant="h3">Menu</Text>
          </View>

          <MenuItem icon="cube-outline" label="Master Data" onPress={() => go('/(app)/home/master-data')} />
          {showTransporterNetwork && (
            <MenuItem icon="people-outline" label="Transporter Network" onPress={() => go('/(app)/home/network')} />
          )}
          <MenuItem icon="person-outline" label="My Profile" onPress={() => go('/(app)/home/profile')} />

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <MenuItem
            icon="log-out-outline"
            label="Logout"
            danger
            onPress={() => {
              onClose();
              logout();
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.4)' },
  panel: { width: '78%', height: '100%', paddingTop: spacing.xxl, paddingHorizontal: spacing.md },
  header: { marginBottom: spacing.lg },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  divider: { height: 1, marginVertical: spacing.sm },
});
