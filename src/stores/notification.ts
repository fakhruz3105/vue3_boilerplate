import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

type Notification = 'notification' | 'error' | 'success';

export const useNotificationStore = defineStore({
  id: 'notification',
  state: () => ({
    notifications: [] as { id: string; message: string; type: Notification, timeout: number }[],
  }),
  actions: {
    addNotification(message: string, type: Notification) {
      const id = uuidv4();

      const timeout = setTimeout(() => {
        this.notifications = this.notifications.filter((e) => e.id !== id);
      }, 5000);

      this.notifications.push({ id, message, type, timeout });
    },
    holdNotification(id: string) {
      const notification = this.notifications.find(e => e.id === id);

      if (!notification) {
        return
      }

      clearTimeout(notification.timeout);
    },
    continueNotificationClearance(id: string) {
      const notification = this.notifications.find(e => e.id === id);

      if (!notification) {
        return
      }

      const timeout = setTimeout(() => {
        this.notifications = this.notifications.filter((e) => e.id !== id);
      }, 2500);

      notification.timeout = timeout;
    },
    removeNotification(id: string) {
      this.notifications = this.notifications.filter((e) => e.id !== id);
    },
  },
});
