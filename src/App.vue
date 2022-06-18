<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { storeToRefs } from 'pinia';
import {
  AlertOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons-vue';

const { login } = useAuthStore();

const notificationStore = useNotificationStore();
const { holdNotification, continueNotificationClearance, removeNotification } = notificationStore;

const { notifications } = storeToRefs(notificationStore);

// onMounted(async () => {
//   await login('superadmin@dev.com', 'P@ssw0rd!');
// });
</script>

<template>
  <RouterView />
  <div class="fixed top-0 right-0 p-2 w-[350px] transition-all ease z-[1000]">
    <TransitionGroup name="notification">
      <template v-for="{ id, message, type } of notifications" :key="id">
        <div
          v-if="type === 'error'"
          class="flex items-center w-full p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 z-[100]"
          role="alert"
          @mouseenter="holdNotification(id)"
          @mouseleave="continueNotificationClearance(id)"
        >
          <div
            class="bg-gradient-to-r from-red-400 via-red-500 to-red-600 p-4 rounded-xl flex justify-center items-center"
          >
            <CloseOutlined class="text-white" />
          </div>
          <div class="ml-3 text-sm font-normal break-all">{{ message }}</div>
          <button
            type="button"
            class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
            aria-label="Close"
            @click="removeNotification(id)"
          >
            <span class="sr-only">Close</span>
            <svg
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <div
          v-else-if="type === 'success'"
          class="flex items-center w-full p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 z-[100]"
          role="alert"
          @mouseenter="holdNotification(id)"
          @mouseleave="continueNotificationClearance(id)"
        >
          <div
            class="bg-gradient-to-r from-green-400 via-green-500 to-green-600 p-4 rounded-xl flex justify-center items-center"
          >
            <CheckOutlined class="text-white" />
          </div>
          <div class="ml-3 text-sm font-normal break-all">{{ message }}</div>
          <button
            type="button"
            class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
            aria-label="Close"
            @click="removeNotification(id)"
          >
            <span class="sr-only">Close</span>
            <svg
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <div
          v-else
          class="flex items-center w-full p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 z-[100]"
          role="alert"
          @mouseenter="holdNotification(id)"
          @mouseleave="continueNotificationClearance(id)"
        >
          <div
            class="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 p-4 rounded-xl flex justify-center items-center"
          >
            <AlertOutlined class="text-white" />
          </div>
          <div class="ml-3 text-sm font-normal break-all">{{ message }}</div>
          <button
            type="button"
            class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
            aria-label="Close"
            @click="removeNotification(id)"
          >
            <span class="sr-only">Close</span>
            <svg
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
      </template>
    </TransitionGroup>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Mulish:wght@200&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
  font-weight: normal;
}

body {
  min-height: 100%;
  color: #474d58;
  background: #fbf6f0;
  line-height: 1.6;
  font-family: 'Mulish', sans-serif;
}

.card {
  @apply bg-white rounded-xl p-4 m-4;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.5s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
