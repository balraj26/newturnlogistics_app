import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, Card, LoadingView, StatusPill, Text, TopAppBar } from '@/components/ui';
import { useCurrentRole } from '@/hooks/useCurrentRole';
import { useLogout } from '@/hooks/useLogout';
import { spacing } from '@/theme/tokens';

const ROLE_LABELS: Record<string, string> = {
  factory: 'Factory Owner',
  transporter: 'Transporter',
  driver: 'Driver',
  gatekeeper: 'Gatekeeper',
};

interface ProfileScreenProps {
  /** Set by the shared Consignor/Transporter home shell, which reaches
   * this via a push from the side menu rather than as a bottom tab (Driver
   * and Gatekeeper still use this as a tab, where no back button is wanted). */
  back?: boolean;
}

/** Shared across every persona — see each persona's `profile.tsx`, which
 * just re-exports (or, for the shared home shell, wraps) this. */
export function ProfileScreen({ back = false }: ProfileScreenProps) {
  const { user, company, role, isLoading } = useCurrentRole();
  const logout = useLogout();

  if (isLoading || !user) {
    return (
      <View style={styles.flex}>
        <TopAppBar title="Profile" back={back} />
        <LoadingView />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <TopAppBar title="Profile" back={back} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text variant="h2">{user.full_name}</Text>
          {role && <StatusPill label={ROLE_LABELS[role] ?? role} type="info" />}
          <View style={styles.row}>
            <Text variant="label" color="textSecondary">
              Email
            </Text>
            <Text variant="body">{user.email}</Text>
          </View>
          {user.phone && (
            <View style={styles.row}>
              <Text variant="label" color="textSecondary">
                Phone
              </Text>
              <Text variant="body">{user.phone}</Text>
            </View>
          )}
          {company && (
            <View style={styles.row}>
              <Text variant="label" color="textSecondary">
                Company
              </Text>
              <Text variant="body">{company.name}</Text>
            </View>
          )}
        </Card>

        <Button label="Log out" variant="danger" onPress={logout} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: spacing.md, padding: spacing.md },
  row: { marginTop: spacing.xs },
});
