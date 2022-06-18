<script setup lang="ts">
import { computed, onMounted, reactive, ref, type Ref } from 'vue';
import { Chart, registerables } from 'chart.js';
import { LineChart, useLineChart } from 'vue-chart-3';
import { shuffle } from 'lodash';

Chart.register(...registerables);

const humidityData: Ref<number[]> = ref([18, 19, 20, 21, 22]);
const temperatureData: Ref<number[]> = ref([35.6, 36.6, 37.8, 38.3, 39.0]);
const phData: Ref<number[]> = ref([7, 7.2, 7.4, 6.8, 7.7]);
const categories: Ref<number[]> = ref([1, 2, 3, 4, 5]);

const chartData = computed(() => {
  return {
    labels: categories.value,
    datasets: [
      {
        label: 'Temperature ()',
        data: temperatureData.value,
        fill: {
          target: 1,
          above: 'rgba(222, 28, 13, 0.4)',
        },
        borderColor: 'rgb(222, 28, 13)',
        tension: 0.5,
      },
      {
        label: 'Humidity',
        data: humidityData.value,
        fill: {
          target: 2,
          above: 'rgba(29, 62, 209, 0.4)',
        },
        borderColor: 'rgb(29, 62, 209)',
        tension: 0.5,
      },
      {
        label: 'pH',
        data: phData.value,
        fill: {
          target: 'origin',
          above: 'rgba(75, 192, 192, 0.4)',
        },
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.5,
      },
    ],
  };
});

const { lineChartProps } = useLineChart({ chartData });

onMounted(() => {
  setInterval(() => {
    humidityData.value = shuffle(humidityData.value);
    temperatureData.value = shuffle(temperatureData.value);
    phData.value = shuffle(phData.value);
  }, 1000);
});
</script>

<template>
  <div class="bg-white rounded-xl p-4 m-4">
    <span class="text-xl font-semibold">Daily Report</span>
    <LineChart class="h-60" v-bind="lineChartProps" />
  </div>
  <div class="weekly-summary"></div>
</template>

<style></style>
