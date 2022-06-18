<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router';
import {
  DashboardOutlined,
  UserOutlined,
  AlertOutlined,
  PoweroffOutlined,
  BackwardOutlined,
  ForwardOutlined,
  LogoutOutlined,
} from '@ant-design/icons-vue';
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { Role } from '@/enum';

const { user, logout } = useAuthStore();
const { addNotification } = useNotificationStore();
const router = useRouter();

const expandNav = ref(true);

const toggleNav = () => {
  expandNav.value = !expandNav.value;
};

const navWidth = computed(() => {
  return expandNav.value ? 270 : 48;
});

async function userLogout() {
  try {
    await logout();
    addNotification('You are successfully logged out!', 'success');
  } finally {
    router.push({ name: 'Visitor' })
  }
}
</script>

<template>
  <div class="flex h-full">
    <div
      class="bg-white flex flex-col justify-between items-end h-screen sticky top-0 left-0 overflow-hidden transition-all ease"
      :style="{ width: `${navWidth}px`, 'min-width': `${navWidth}px` }"
    >
      <div class="w-full">
        <img class="p-4 opacity-80" src="@/assets/logo.svg" alt="logo" />
        <nav class="flex flex-col w-full">
          <RouterLink active-class="bg-slate-100" to="/user/dashboard">
            <DashboardOutlined />
            <span class="ml-4 whitespace-nowrap">Dashboard</span>
          </RouterLink>
          <RouterLink active-class="bg-slate-100" to="/user/sensor-management">
            <AlertOutlined />
            <span class="ml-4 whitespace-nowrap">Sensor Management</span>
          </RouterLink>
          <RouterLink active-class="bg-slate-100" to="/user/pump-management">
            <DashboardOutlined />
            <span class="ml-4 whitespace-nowrap">Pump Management</span>
          </RouterLink>
          <RouterLink v-if="user.role === Role.SUPER_ADMIN" active-class="bg-slate-100" to="/user/user-management">
            <UserOutlined />
            <span class="ml-4 whitespace-nowrap">User Management</span>
          </RouterLink>
        </nav>
      </div>

      <BackwardOutlined
        v-if="expandNav"
        @click="toggleNav"
        class="p-4 hover:bg-slate-100 hover:cursor-pointer w-full"
      />
      <ForwardOutlined
        v-else
        @click="toggleNav"
        class="p-4 hover:bg-slate-100 hover:cursor-pointer"
      />
    </div>

    <div class="w-full flex flex-col">
      <div
        class="bg-white py-4 px-8 flex justify-between items-center mx-8 rounded-xl sticky top-0 z-50"
      >
        <div class="flex justify-start items-center">
          <div
            class="bg-slate-400 p-4 rounded-full flex justify-center items-center mr-8"
          >
            <UserOutlined class="text-white" />
          </div>
          <p>{{ user.name }}</p>
        </div>
        <button
          type="button"
          class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 flex justify-center items-center"
          @click="userLogout"
        >
          <LogoutOutlined />
          <span class="ml-2">Logout</span>
        </button>
      </div>
      <RouterView class="p-4" />
    </div>
  </div>
</template>

<style>
nav > * {
  @apply hover:bg-slate-100 p-4 text-left flex items-center w-full;
}
</style>
