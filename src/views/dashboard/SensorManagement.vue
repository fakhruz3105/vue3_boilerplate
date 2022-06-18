<script setup lang="ts">
import type { Sensor, SensorType } from '@/interface';
import { PlusOutlined } from '@ant-design/icons-vue';
import { startCase } from 'lodash';
import { onMounted, ref, unref, type Ref } from 'vue';
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue';
import { GET, POST, PUT } from '@/utils/APICaller';
import { useNotificationStore } from '@/stores/notification';

const { addNotification } = useNotificationStore();

const sensorTypes: Ref<SensorType[]> = ref([]);
const sensors: Ref<Sensor[]> = ref([]);

const selectedSensorType = ref({} as SensorType);
const selectedSensorTypeDataCollected = ref('');

const selectedSensor: Ref<Sensor> = ref({} as Sensor);
const selectedSensorLocation = ref({
  longitude: 0,
  latitude: 0,
});

const showEditSensorTypeModal = ref(false);
const showEditSensorModal = ref(false);

function updateSelectedSensorTypeDataCollected(val: EventTarget | null) {
  selectedSensorType.value.dataCollected =
    (val as HTMLInputElement)?.value
      ?.split(' | ')
      .map((e: string) => e.toLowerCase()) || [];
}

function editSensorType(id?: string) {
  if (!id) return;
  selectedSensorType.value = {
    ...(sensorTypes.value.find((e) => e.id === id) as SensorType),
  };
  selectedSensorTypeDataCollected.value =
    selectedSensorType.value.dataCollected.join(' | ');
  showEditSensorTypeModal.value = true;
}

function editSensor(id?: string) {
  if (!id) return;
  selectedSensor.value = {
    ...(sensors.value.find((e) => e.id === id) as Sensor),
  };
  selectedSensorLocation.value = selectedSensor.value.location;
  showEditSensorModal.value = true;
}

function addNewSensorType() {
  selectedSensorType.value = {} as SensorType;
  showEditSensorTypeModal.value = true;
}

function addNewSensor() {
  selectedSensor.value = { condition: true } as Sensor;
  showEditSensorModal.value = true;
}

async function saveSensorType() {
  const { id, name, dataCollected, price } = unref(selectedSensorType);
  if (!id) {
    await POST(
      '/api/sensor-management/type',
      { name, dataCollected, price },
      { withCredentials: true },
    );
  } else {
    await PUT(
      '/api/sensor-management/type',
      { id, name, dataCollected, price },
      { withCredentials: true },
    );
  }
  sensorTypes.value = await GET('/api/sensor-management/type/all', {
    withCredentials: true,
  });
  addNotification('Sensor type has been saved!', 'notification');
  showEditSensorTypeModal.value = false;
}

async function saveNewSensor() {
  const { id, sensorType } = unref(selectedSensor);
  const { longitude, latitude } = unref(selectedSensorLocation);
  if (!id) {
    await POST(
      '/api/sensor-management/sensor',
      { sensorTypeId: sensorType, longitude, latitude },
      { withCredentials: true },
    );
  } else {
    await PUT(
      '/api/sensor-management/sensor',
      { id, sensorTypeId: sensorType, longitude, latitude },
      { withCredentials: true },
    );
  }
  sensors.value = await GET('/api/sensor-management/sensor/all', {
    withCredentials: true,
  });
  addNotification('Sensor has been saved!', 'notification');
  showEditSensorModal.value = false;
}

onMounted(async () => {
  sensorTypes.value = await GET('/api/sensor-management/type/all', {
    withCredentials: true,
  });
  sensors.value = await GET('/api/sensor-management/sensor/all', {
    withCredentials: true,
  });
});
</script>

<template>
  <div>
    <div class="card mb-8">
      <div class="flex justify-start items-center">
        <span class="font-bold mr-4">Sensor Types</span>
        <PlusOutlined
          @click="addNewSensorType"
          class="hover:text-slate-900 hover:cursor-pointer"
        />
      </div>
      <table
        class="w-full text-sm text-left text-gray-500 dark:text-gray-400 mt-4"
      >
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">Sensor Type</th>
            <th scope="col" class="px-6 py-3">Data Collected</th>
            <th scope="col" class="px-6 py-3">Average Price</th>
            <th scope="col" class="px-6 py-3">Number of Sensor</th>
            <th scope="col" class="px-6 py-3">
              <span class="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="sensorTypes.length > 0">
            <tr
              v-for="{ id, name, dataCollected, price } of sensorTypes"
              class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
            >
              <th
                scope="row"
                class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
              >
                {{ name }}
              </th>
              <td class="px-6 py-4">
                {{ dataCollected.map((e) => startCase(e)).join(', ') }}
              </td>
              <td class="px-6 py-4">
                {{ !price ? '' : `RM${price?.toFixed(2)}` }}
              </td>
              <td class="px-6 py-4">
                {{ sensors.filter((e) => e.sensorType === id).length }}
              </td>
              <td class="px-6 py-4 text-right">
                <a
                  @click="editSensorType(id)"
                  class="font-medium text-blue-600 dark:text-blue-500 hover:cursor-pointer"
                  >Edit</a
                >
              </td>
            </tr>
          </template>
          <template v-else>
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td colspan="4" class="px-6 py-4 text-center">-- NONE --</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div class="card">
      <div class="flex justify-start items-center">
        <span class="font-bold mr-4">Sensors</span>
        <PlusOutlined
          @click="addNewSensor"
          class="hover:text-slate-900 hover:cursor-pointer"
        />
      </div>
      <table
        class="w-full text-sm text-left text-gray-500 dark:text-gray-400 mt-4"
      >
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">Sensor ID</th>
            <th scope="col" class="px-6 py-3">Type</th>
            <th scope="col" class="px-6 py-3">Longitude</th>
            <th scope="col" class="px-6 py-3">Latitude</th>
            <th scope="col" class="px-6 py-3">Condition</th>
            <th scope="col" class="px-6 py-3">
              <span class="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="sensors.length > 0">
            <tr
              v-for="{ id, location, condition, sensorType } of sensors"
              class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
            >
              <th
                scope="row"
                class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
              >
                {{ id }}
              </th>
              <th
                scope="row"
                class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
              >
                {{ sensorTypes.find((e) => e.id === sensorType)?.name }}
              </th>
              <td class="px-6 py-4">
                {{ location.longitude.toFixed(6) }}
              </td>
              <td class="px-6 py-4">
                {{ location.latitude.toFixed(6) }}
              </td>
              <td class="px-6 py-4">
                <template v-if="condition"
                  ><span
                    class="text-sm text-green-700 bg-green-100 rounded-lg p-2"
                    >Good</span
                  ></template
                >
                <template v-else
                  ><span class="text-sm text-red-700 bg-red-100 rounded-lg p-2"
                    >Bad</span
                  ></template
                >
              </td>
              <td class="px-6 py-4 text-right">
                <a
                  @click="editSensor(id)"
                  class="font-medium text-blue-600 dark:text-blue-500 hover:cursor-pointer"
                  >Edit</a
                >
              </td>
            </tr>
          </template>
          <template v-else>
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td colspan="5" class="px-6 py-4 text-center">-- NONE --</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <TransitionRoot appear :show="showEditSensorTypeModal" as="template">
      <Dialog
        as="div"
        @close="showEditSensorTypeModal = false"
        class="relative z-[60]"
      >
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div
            class="flex min-h-full items-center justify-center p-4 text-center"
          >
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-1/2 transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-gray-900"
                >
                  {{
                    selectedSensorType.id
                      ? 'Edit Sensor Type'
                      : 'New Sensor Type'
                  }}
                </DialogTitle>
                <div class="mt-2">
                  <div class="w-full mt-4">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >Type</label
                    >
                    <input
                      v-model="selectedSensorType.name"
                      type="text"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="DHT11"
                      required
                    />
                  </div>
                  <div class="w-full mt-4">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >Data Collected (Separated by '|')</label
                    >
                    <input
                      @blur="
                        updateSelectedSensorTypeDataCollected($event?.target)
                      "
                      :value="selectedSensorTypeDataCollected"
                      type="text"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Humidity | Temperature | pH"
                      required
                    />
                  </div>
                  <div class="w-full mt-4">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >Average Price (Optional)</label
                    >
                    <div class="flex">
                      <span
                        class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 rounded-l-md border border-r-0 border-gray-300 dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600"
                      >
                        RM
                      </span>
                      <input
                        v-model="selectedSensorType.price"
                        type="number"
                        class="rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="2.50"
                      />
                    </div>
                  </div>
                </div>

                <div class="mt-4 flex justify-end">
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    @click="saveSensorType"
                  >
                    {{ selectedSensorType.id ? 'Edit' : 'Add' }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
    <TransitionRoot appear :show="showEditSensorModal" as="template">
      <Dialog
        as="div"
        @close="showEditSensorModal = false"
        class="relative z-[60]"
      >
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div
            class="flex min-h-full items-center justify-center p-4 text-center"
          >
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-1/2 transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-gray-900"
                >
                  {{
                    selectedSensor.id ? 'Edit Sensor' : 'Register New Sensor'
                  }}
                </DialogTitle>
                <div class="mt-2">
                  <div class="w-full mt-4">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
                      >Sensor Type</label
                    >
                    <select
                      v-model="selectedSensor.sensorType"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option selected></option>
                      <option v-for="{ id, name } of sensorTypes" :value="id">
                        {{ name }}
                      </option>
                    </select>
                  </div>
                  <div class="w-full mt-4">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >Longitude</label
                    >
                    <input
                      v-model="selectedSensorLocation.longitude"
                      type="number"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="101.621071"
                    />
                  </div>
                  <div class="w-full mt-4">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >Latitude</label
                    >
                    <input
                      v-model="selectedSensorLocation.latitude"
                      type="number"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="3.118447"
                      required
                    />
                  </div>
                  <div class="w-full mt-4">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
                      >Condition</label
                    >
                    <select
                      v-model="selectedSensor.condition"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      :disabled="!selectedSensor.id"
                    >
                      <option selected :value="true">Good</option>
                      <option :value="false">Bad</option>
                    </select>
                  </div>
                </div>

                <div class="mt-4 flex justify-end">
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    @click="saveNewSensor"
                  >
                    {{ selectedSensor.id ? 'Edit' : 'Add' }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>
