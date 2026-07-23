import { apiFetch } from '@/lib/api-client';
import type { DevicePlatform, Notification, NotificationChannel, UUID } from '@/types/api';

export interface NotificationInput {
  recipient_user_id: UUID;
  channel: NotificationChannel;
  title: string;
  body: string;
  related_entity_type?: string;
  related_entity_id?: UUID;
}

/** Ported from New Turn/frontend/services/notifications.ts, plus the
 * device push-token endpoints that only a mobile client needs. */
export const notificationsService = {
  list: (unreadOnly = false) =>
    apiFetch<Notification[]>(`/api/v1/notifications${unreadOnly ? '?unread_only=true' : ''}`),
  send: (data: NotificationInput) =>
    apiFetch<Notification>('/api/v1/notifications', { method: 'POST', body: data }),
  markRead: (id: UUID) =>
    apiFetch<Notification>(`/api/v1/notifications/${id}/read`, { method: 'POST' }),

  registerDevice: (token: string, platform: DevicePlatform) =>
    apiFetch<void>('/api/v1/devices/register', { method: 'POST', body: { token, platform } }),
  unregisterDevice: (token: string) =>
    apiFetch<void>('/api/v1/devices/unregister', { method: 'POST', body: { token } }),
};
