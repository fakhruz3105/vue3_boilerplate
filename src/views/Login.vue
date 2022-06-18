<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { useRouter } from 'vue-router';

const router = useRouter();

const email = ref('');
const password = ref('');

const { login } = useAuthStore();
const { addNotification } = useNotificationStore();

const userLogin = async () => {
  await login(email.value, password.value);
  addNotification('Login Successful!', 'success');
  router.push({ name: 'Dashboard' });
};
</script>

<template>
  <div
    class="bg-white w-1/3 mx-auto my-16 rounded-xl flex flex-col justify-center overflow-hidden"
  >
    <div class="bg-[#2D1967] p-4 flex justify-center">
      <span class="text-white font-[900]">Log in</span>
    </div>
    <div class="p-8 flex flex-col">
      <div class="mb-4">
        <div class="w-full mt-4">
          <label
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >Email</label
          >
          <input
            v-model="email"
            type="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="email@example.com"
            required
          />
        </div>
        <div class="w-full mt-4">
          <label
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >Password</label
          >
          <input
            v-model="password"
            type="password"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Password"
            required
          />
        </div>
      </div>
      <button
        @click="userLogin"
        class="bg-[#884FFB] hover:bg-[#49209B] p-4 m-4 text-white font-[900] rounded-xl"
      >
        Login
      </button>
      <p class="text-center hover:text-gray-900 hover:cursor-pointer">
        Forgot Password?
      </p>
    </div>
  </div>
</template>
