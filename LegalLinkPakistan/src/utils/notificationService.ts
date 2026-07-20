// ==========================================
// IMPORTS & MODULE SAFETY CHECK
// ==========================================
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

// Safe check to see if Notifee native module is successfully loaded
let isNotifeeAvailable = false;
try {
  if (notifee && typeof notifee.requestPermission === 'function') {
    isNotifeeAvailable = true;
  }
} catch (e) {
  console.warn('[NotificationService] Notifee native module is not built or loaded yet.');
}

// ==========================================
// NOTIFICATION SERVICE CLASS
// ==========================================
export class NotificationService {
  /**
   * Requests permission to display notifications (essential for iOS & Android 13+)
   */
  public static async requestPermission() {
    if (!isNotifeeAvailable) {
      console.log('[NotificationService] Notifee native module not ready. Skipping requestPermission.');
      return;
    }
    try {
      const settings = await notifee.requestPermission();
      console.log('[NotificationService] Permission settings status:', settings.authorizationStatus);
    } catch (error) {
      console.warn('[NotificationService] Failed to request notification permission:', error);
    }
  }

  /**
   * Creates the default Android notification channel (required for Android 8.0+)
   */
  public static async createChannels() {
    if (!isNotifeeAvailable) {
      console.log('[NotificationService] Notifee native module not ready. Skipping createChannels.');
      return;
    }
    try {
      await notifee.createChannel({
        id: 'default',
        name: 'General Notifications',
        importance: AndroidImportance.HIGH,
        vibration: true,
      });
    } catch (error) {
      console.warn('[NotificationService] Failed to create notification channel:', error);
    }
  }

  /**
   * Triggers a native system notification banner
   */
  public static async displayNotification(title: string, body: string, type: string, data: any = {}) {
    if (!isNotifeeAvailable) {
      console.log('[NotificationService] Notifee native module not ready. Skipping displayNotification. Title:', title);
      return;
    }
    try {
      // Trigger native notification
      await notifee.displayNotification({
        title,
        body,
        data: {
          ...data,
          type,
        },
        android: {
          channelId: 'default',
          smallIcon: 'ic_launcher', // Default app launcher icon
          pressAction: {
            id: 'default',
          },
        },
      });
    } catch (error) {
      console.error('[NotificationService] Failed to display notification:', error);
    }
  }

  /**
   * Listens for notification press events when app is in the background
   */
  public static registerBackgroundHandler(onNotificationOpen: (data: any) => void) {
    if (!isNotifeeAvailable) {
      console.log('[NotificationService] Notifee native module not ready. Skipping registerBackgroundHandler.');
      return;
    }
    try {
      notifee.onBackgroundEvent(async ({ type, detail }) => {
        const { notification } = detail;
        if (type === EventType.PRESS && notification) {
          console.log('[NotificationService] Background notification click detected');
          onNotificationOpen(notification.data);
        }
      });
    } catch (error) {
      console.warn('[NotificationService] Background handler registration skipped:', error);
    }
  }

  /**
   * Handles notification press events when app is in the foreground
   */
  public static registerForegroundHandler(onNotificationOpen: (data: any) => void) {
    if (!isNotifeeAvailable) {
      console.log('[NotificationService] Notifee native module not ready. Skipping registerForegroundHandler.');
      return () => {};
    }
    try {
      return notifee.onForegroundEvent(async ({ type, detail }) => {
        const { notification } = detail;
        if (type === EventType.PRESS && notification) {
          console.log('[NotificationService] Foreground notification click detected');
          onNotificationOpen(notification.data);
        }
      });
    } catch (error) {
      console.warn('[NotificationService] Foreground event listener not registered:', error);
      return () => {};
    }
  }
}
