<script setup lang="ts">
import DataViewer from '@/views/DataViewerApexCharts.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const login = () => {
  router.push({ name: 'Login' });
};
</script>

<template>
  <div class="p-4">
    <div class="bg-white rounded-xl p-4 m-4 mb-8 flex justify-between items-center">
      <span class="text-xl font-bold">Smart Agriculture</span>
      <button
        @click="login"
        class="font-semibold text-white bg-[#884FFB] hover:bg-[#49209B] rounded-xl px-5 py-1"
      >
        Login
      </button>
    </div>
    <DataViewer />
  </div>
</template>
