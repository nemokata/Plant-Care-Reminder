import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export async function ensureNotificationPermissions(): Promise<boolean> {
  try {
    if (!Device.isDevice) return false;
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    return false;
  }
}

export async function schedulePlantReminder(title: string, when: Date, body?: string) {
  try {
    const has = await ensureNotificationPermissions();
    if (!has) return null;
    const trigger = when.getTime() <= Date.now() ? null : when;
    const id = await Notifications.scheduleNotificationAsync({
      content: { title: `🌿 ${title}`, body: body || `Time to water ${title}` },
      trigger,
    });
    return id;
  } catch (e) {
    return null;
  }
}

export async function cancelReminder(id: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (e) {}
}

export default {
  ensureNotificationPermissions,
  schedulePlantReminder,
  cancelReminder,
};
