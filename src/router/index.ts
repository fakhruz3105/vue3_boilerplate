import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Visitor',
      component: () => import('@/views/VisitorView.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/verify-account/:id',
      name: 'User Verification',
      component: () => import('@/views/UserVerification.vue'),
    },
    {
      path: '/user/',
      name: 'User',
      component: () => import('@/views/UserView.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/Dashboard.vue'),
        },
        {
          path: 'sensor-management',
          name: 'Sensor Management',
          component: () => import('@/views/dashboard/SensorManagement.vue'),
        },
        {
          path: 'pump-management',
          name: 'Pump Management',
          component: () => import('@/views/dashboard/PumpManagement.vue'),
        },
        {
          path: 'user-management',
          name: 'User Management',
          component: () => import('@/views/dashboard/UserManagement.vue'),
          meta: { role: Role.SUPER_ADMIN }
        },
      ],
    },
  ],
});

import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { Role } from '@/enum';

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const { addNotification } = useNotificationStore();

  if (!authStore.loggedIn) {
    await authStore.fetchUserDetails();
  }

  const isPublic = ['Visitor', 'Login', 'User Verification'].includes(to.name as string)

  if (!authStore.loggedIn) {
    if (isPublic) {
      next();
      return;
    } else {
      addNotification('Your are not logged in!', 'error');
      next({ name: 'Visitor' });
    }
  }

  if (authStore.loggedIn && isPublic) {
    next({ name: 'Dashboard' });
    return;
  }

  if (authStore.user.role === Role.ADMIN && to.name === 'User Management') {
    addNotification('Your are not authorized!', 'error');
    next({ name: 'Dashboard' });
    return;
  }

  next();
});

export default router;
