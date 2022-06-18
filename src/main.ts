import { createApp } from 'vue';
import { createPinia } from 'pinia';
import VueApexCharts from 'vue3-apexcharts';
import 'flowbite';

import App from './App.vue';
import './index.css';

import router from './router';
import { useNotificationStore } from './stores/notification';

const app = createApp(App);

app.use(VueApexCharts);
app.use(createPinia());
app.use(router);
app.config.errorHandler = (_) => {
  const authStore = useNotificationStore();
  let message: any = (_ as Error).message;

  if (message instanceof Array) {
    message = message.join(', ');
  }

  authStore.addNotification(message, 'error');

  if (message === 'Token Expired') {
    router.push({ name: 'Login' })
  }
};

app.mount('#app');
