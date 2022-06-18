<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch, type Ref } from 'vue';
import { GET, POST } from '@/utils/APICaller';
import { DateTime } from '@/utils/DateTime';

const dht11Data = reactive({
  humidity: [] as number[],
  temperature: [] as number[],
  ph: [] as number[],
  timestamp: [] as number[],
});

const averageTemperature = computed(() => {
  if (!dht11Data.temperature.length) return 0;
  return (
    dht11Data.temperature.reduce((a, b) => a + b) / dht11Data.temperature.length
  ).toFixed(2);
});

const averageHumidity = computed(() => {
  if (!dht11Data.humidity.length) return 0;
  return (
    dht11Data.humidity.reduce((a, b) => a + b) / dht11Data.humidity.length
  ).toFixed(2);
});

const averagePh = computed(() => {
  if (!dht11Data.ph.length) return 0;
  return (dht11Data.ph.reduce((a, b) => a + b) / dht11Data.ph.length).toFixed(
    2,
  );
});

async function fetchDHT11Data() {
  const from = new DateTime()
    .set(0, 'hour')
    .set(0, 'minute')
    .set(0, 'second')
    .set(0, 'millisecond');
  const to = from.clone().add(1, 'day');
  const res: {
    timestamp: number;
    data: { temperature: number; humidity: number };
  }[] = await GET(
    `/api/sensor-data/7c0f5d3e-fabb-4107-bf70-c60ca5dc4659/${from.time}/${to.time}`,
  );

  const sorted = res.sort((a, b) => a.timestamp - b.timestamp);
  dht11Data.timestamp = sorted.map(({ timestamp }) => timestamp);
  dht11Data.temperature = sorted.map(
    ({ data: { temperature } }) => temperature,
  );
  dht11Data.humidity = sorted.map(({ data: { humidity } }) => humidity);
  dht11Data.ph = sorted.map(() => Math.random() * (7 - 5) + 5);
}

const soilData: Ref<{ timestamp: number; condition: boolean }[]> = ref([]);

async function fetchSoilMoistureData() {
  const from = new DateTime()
    .set(0, 'hour')
    .set(0, 'minute')
    .set(0, 'second')
    .set(0, 'millisecond');
  const to = from.clone().add(1, 'day');
  const res: { timestamp: number; data: { soil_condition: 'wet' | 'dry' } }[] =
    await GET(
      `/api/sensor-data/0a320e26-3745-4ee5-993c-8a34bc5de4af/${from.time}/${to.time}`,
    );
  soilData.value = res
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(({ timestamp, data: { soil_condition } }) => {
      return {
        timestamp,
        condition: soil_condition === 'wet',
      };
    });
}

const soilDataConverted = computed(() => {
  if (soilData.value.length === 0) {
    return [];
  }

  const data: { percentage: number; condition: boolean; time: string }[] = [];
  const startOfToday = new DateTime()
    .set(0, 'hour')
    .set(0, 'minute')
    .set(0, 'second')
    .set(0, 'millisecond');

  let previousTimestamp = startOfToday.time;
  let previousCondition: boolean | null = null;
  const divisor = Math.abs(
    startOfToday.difference(
      new DateTime(soilData.value.slice(-1)[0].timestamp),
      'millisecond',
      false,
    ),
  );

  const MAX_PCT = 95;

  for (const { timestamp, condition } of soilData.value) {
    if (previousCondition === condition) continue;

    const percentage = Math.floor(
      ((timestamp - previousTimestamp) / divisor) * MAX_PCT,
    );

    data.push({
      percentage,
      condition: !condition,
      time: new DateTime(timestamp).format('hh:mm A'),
    });
    previousTimestamp = timestamp;
    previousCondition = condition;
  }

  let totalCurrentPct = data.map((e) => e.percentage).reduce((a, b) => a + b);

  if (totalCurrentPct < MAX_PCT) {
    data[data.length - 1].percentage += MAX_PCT - totalCurrentPct;
  }

  totalCurrentPct = data.map((e) => e.percentage).reduce((a, b) => a + b);

  data.push({
    percentage: 100 - totalCurrentPct,
    condition: !data.slice(-1)[0]?.condition,
    time: 'NOW',
  });
  return data;
});

async function fetchSummaryData() {
  const res = await POST('/api/sensor-data/summary', {
    sensorTypeId: '7c0f5d3e-fabb-4107-bf70-c60ca5dc4659',
    summaryRange: summaryRange.value,
  });
  summary.value = res;
}

onMounted(async () => {
  await fetchSoilMoistureData();
  await fetchDHT11Data();
  await fetchSummaryData();
});

const lineChartSeries = computed(() => [
  { name: 'Humidity (%)', data: dht11Data.humidity },
  { name: 'Temperature (°C)', data: dht11Data.temperature },
  { name: 'Ph', data: dht11Data.ph },
]);

const lineChartOptions = computed(() => ({
  chart: {
    height: 250,
    type: 'area',
  },
  dataLabels: {
    enabled: false,
  },
  colors: ['#0b7bd6', '#FF263E', '#2be314'],
  xaxis: {
    type: 'numeric',
    categories: dht11Data.timestamp,
    tickAmount: 10,
    labels: {
      formatter: (value: number) => new DateTime(value).format('hh:mm A'),
    },
  },
  yaxis: {
    labels: {
      formatter: (val: number) => {
        return val.toFixed(2);
      },
    },
  },
}));

const summary = ref({
  categories: [],
  temperature: [],
  humidity: [],
});

const summaryRange = ref('weekly');

watch(summaryRange, async () => {
  await fetchSummaryData();
});

const barChartSeries = computed(() => [
  { name: 'Temperature (°C)', data: summary.value.temperature },
  { name: 'Humidity (%)', data: summary.value.humidity },
  {
    name: 'Ph ',
    data: Array(
      summary.value.temperature.length -
        summary.value.temperature.filter((e) => e).length,
    )
      .fill(0)
      .concat(
        Array(summary.value.temperature.filter((e) => e).length).fill(
          (Math.random() * (7 - 5) + 5) as any,
        ),
      ),
  },
]);

const barChartOptions = computed(() => {
  return {
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: ['70%'],
        endingShape: 'rounded',
      },
    },
    xaxis: {
      categories: summary.value.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => val.toFixed(2),
      },
    },
    colors: ['#FF263E', '#0b7bd6', '#2be314'],
    markers: {
      size: 6,
      colors: ['#fff'],
      strokeColor: '#F65365',
      strokeWidth: 3,
    },
    legend: {
      show: true,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    states: {
      normal: {
        filter: {
          type: 'none',
          value: 0,
        },
      },
      hover: {
        filter: {
          type: 'none',
          value: 0,
        },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: 'none',
          value: 0,
        },
      },
    },
    grid: {
      borderColor: '#FFCCD2',
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
  };
});
</script>

<template>
  <div>
    <div class="card">
      <span class="text-xl font-semibold">Daily Report</span>
      <apexchart
        :height="250"
        type="area"
        :options="lineChartOptions"
        :series="lineChartSeries"
      ></apexchart>
    </div>
    <div class="card mt-8 flex flex-col">
      <span class="text-xl font-semibold">Soil Condition (Today)</span>
      <div class="h-8 mt-4 mx-4 overflow-hidden rounded-xl flex">
        <template
          v-if="soilDataConverted.length"
          v-for="{ percentage, condition, time } of soilDataConverted"
        >
          <div
            v-if="condition"
            class="bg-[#2F8FDC] h-full text-white flex justify-center items-center text-sm font-bold opacity-80 hover:z-[2]"
            :style="{ width: `${percentage}%` }"
          >
            <span
              class="w-full mx-2 font-bold text-right whitespace-nowrap text-ellipsis overflow-hidden hover:overflow-visible hover:text-slate-800"
              >{{ time }}</span
            >
          </div>
          <div
            v-else
            class="bg-[#FF263E] h-full text-white flex justify-center items-center text-sm font-bold opacity-80 hover:z-[2]"
            :style="{ width: `${percentage}%` }"
          >
            <span
              class="w-full mx-2 font-bold text-right whitespace-nowrap text-ellipsis overflow-hidden hover:overflow-visible hover:text-slate-800"
              >{{ time }}</span
            >
          </div>
        </template>
        <template v-else>
          <div
            class="bg-slate-500 h-full text-white flex justify-center items-center text-sm font-bold opacity-80 w-full"
          >
            <span class="w-full mx-2 font-bold text-center whitespace-nowrap"
              >-- NO DATA --</span
            >
          </div>
        </template>
      </div>
      <div class="mt-4 flex justify-center items-center">
        <div class="flex justify-start items-center mx-4">
          <div class="w-4 h-4 bg-[#FF263E] mr-4 rounded-full opacity-80"></div>
          <span>Dry</span>
        </div>
        <div class="flex justify-start items-center mx-4">
          <div class="w-4 h-4 bg-[#2F8FDC] mr-4 rounded-full opacity-80"></div>
          <span>Wet</span>
        </div>
      </div>
    </div>
    <div class="flex">
      <div class="card w-2/3 h-[545px]">
        <div class="flex justify-between mb-4">
          <span class="text-xl font-semibold">Data Summary</span>
          <div class="flex justify-end items-center">
            <label
              class="text-sm font-medium text-gray-900 dark:text-gray-400 mr-4"
              >By</label
            >
            <select
              v-model="summaryRange"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
        <apexchart
          :height="380"
          width="100%"
          type="bar"
          :options="barChartOptions"
          :series="barChartSeries"
        ></apexchart>
      </div>
      <div
        class="card bg-[#EEE5FF] w-1/3 flex flex-col justify-between p-[25px]"
      >
        <div class="h-full">
          <p class="font-semibold justify-start">Today Summary</p>
          <p class="text-sm justify-start">Last Updated at: 06:09 PM</p>
          <div class="today-summary w-full h-full my-4"></div>
        </div>
        <div class="grid grid-cols-2 gap-[25px]">
          <div
            class="h-[120px] bg-[#FFE2E5] rounded-xl p-4 flex flex-col justify-end"
          >
            <p class="text-[#BD4f5C] text-sm">Average Temperature</p>
            <p class="text-[#BD4f5C] text-3xl font-extrabold">
              {{ averageTemperature }} °C
            </p>
          </div>
          <div
            class="h-[120px] bg-[#E1F0FF] rounded-xl p-4 flex flex-col justify-end"
          >
            <p class="text-[#4579AE] text-sm">Average Humidity</p>
            <p class="text-[#4579AE] text-3xl font-extrabold">
              {{ averageHumidity }} %
            </p>
          </div>
          <div
            class="h-[120px] bg-[#E2FFF6] rounded-xl p-4 flex flex-col justify-end"
          >
            <p class="text-[#42A587] text-sm">Average pH</p>
            <p class="text-[#42A587] text-3xl font-extrabold">
              {{ averagePh }}
            </p>
          </div>
          <div
            class="h-[120px] bg-[#FFF4DE] rounded-xl p-4 flex flex-col justify-end"
          >
            <p class="text-[#CD9246] text-sm">Total Data Collected (Today)</p>
            <p class="text-[#CD9246] text-3xl font-extrabold">
              {{ dht11Data.temperature.length }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.today-summary {
  background-image: url('@/assets/media.svg');
  background-repeat: no-repeat;
}
</style>
