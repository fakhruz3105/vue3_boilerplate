<script setup lang="ts">
import type { PumpSchedule } from '@/interface';
import { PlusOutlined, PoweroffOutlined } from '@ant-design/icons-vue';
import { onMounted, ref, unref, type Ref } from 'vue';
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue';
import { DELETE, GET, POST, PUT } from '@/utils/APICaller';
import { DateTime } from '@/utils/DateTime';
import { useNotificationStore } from '@/stores/notification';

const { addNotification } = useNotificationStore();

const userList: Ref<{ id: string; name: string }[]> = ref([]);
const pumpSchedules: Ref<PumpSchedule[]> = ref([]);
const selectedpumpSchedules = ref({} as PumpSchedule);
const showEditPumpScheduleModal = ref(false);
const pumpOn = ref(false);
const pumpStartTime = ref(0);
const timerSec = ref(0);
const timerMin = ref(0);
const timerHour = ref(0);
const interval = ref(0);

async function fetchSchedules() {
  pumpSchedules.value = await GET('/api/pump-schedule/all');
}

async function fetchPumpState() {
  const { pumpOn: _pumpOn, pumpStartTime: _pumpStartTime } = await GET(
    '/api/pump-schedule/pump/state',
  );
  pumpOn.value = _pumpOn ?? false;
  pumpStartTime.value = _pumpStartTime ?? 0;

  if (pumpOn.value) {
    interval.value = setInterval(() => {
      const currentTime = new DateTime();
      const startTime = new DateTime(pumpStartTime.value);

      timerSec.value = currentTime.difference(startTime, 'second', false) % 60;
      timerMin.value = currentTime.difference(startTime, 'minute', false) % 60;
      timerHour.value = currentTime.difference(startTime, 'hour', false);
    }, 1000);
  } else {
    clearInterval(interval.value);
    timerSec.value = 0;
    timerMin.value = 0;
    timerHour.value = 0;
  }
}

async function saveSchedule() {
  const { id, time, repeatDaily } = unref(selectedpumpSchedules);

  if (id) {
    await PUT('/api/pump-schedule', { id, time, repeatDaily });
  } else {
    await POST('/api/pump-schedule', { time, repeatDaily });
  }

  await fetchSchedules();
  showEditPumpScheduleModal.value = false;
}

function editSchedule(id?: string) {
  selectedpumpSchedules.value = {
    ...(pumpSchedules.value.find((e) => e.id === id) as PumpSchedule),
  };
  showEditPumpScheduleModal.value = true;
}

function addNewSchedule() {
  selectedpumpSchedules.value = {} as PumpSchedule;
  showEditPumpScheduleModal.value = true;
}

async function deleteSchedule(id?: string) {
  await DELETE(`/api/pump-schedule/${id}`);
  addNotification('Schedule has been deleted!', 'success');
  await fetchSchedules();
  showEditPumpScheduleModal.value = false;
}

const canSave = ref(true);

function checkIfTimeExist() {
  const { id, time } = unref(selectedpumpSchedules);
  const existingScheduleTime = pumpSchedules.value
    .filter((e) => e.id !== id)
    .map((e) => e.time);
  if (existingScheduleTime.includes(time)) {
    addNotification('Schedule time has already exist!', 'error');
    canSave.value = false;
  } else {
    canSave.value = true;
  }
}

async function togglePump() {
  await POST('/api/pump-schedule/pump/toggle');
  await fetchPumpState();
}

async function fetchUserList() {
  userList.value = await GET('/api/user/all/simple', { withCredentials: true });
}

onMounted(async () => {
  await fetchUserList();
  await fetchSchedules();
  await fetchPumpState();
});
</script>

<template>
  <div>
    <div class="flex">
      <div class="card mb-8 w-2/3 h-max">
        <div class="flex justify-start items-center">
          <span class="font-bold mr-4">Pump Schedules</span>
          <PlusOutlined
            @click="addNewSchedule"
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
              <th scope="col" class="px-6 py-3">Date Created</th>
              <th scope="col" class="px-6 py-3">Setter</th>
              <th scope="col" class="px-6 py-3">Time</th>
              <th scope="col" class="px-6 py-3">Repeat Daily</th>
              <th scope="col" class="px-6 py-3">
                <span class="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-if="pumpSchedules.length > 0">
              <tr
                v-for="{ id, time, repeatDaily, setter, createdAt } of pumpSchedules"
                class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              >
                <th
                  scope="row"
                  class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
                >
                  {{ new DateTime(createdAt).format('DD/MM/YYYY') }}
                </th>
                <th class="px-6 py-4">
                  {{ userList.find((e) => e.id === setter)?.name }}
                </th>
                <th class="px-6 py-4">
                  {{ time }}
                </th>
                <td class="px-6 py-4">
                  <template v-if="repeatDaily"
                    ><span
                      class="text-sm text-green-700 bg-green-100 rounded-lg p-2"
                      >Yes</span
                    ></template
                  >
                  <template v-else
                    ><span
                      class="text-sm text-red-700 bg-red-100 rounded-lg p-2"
                      >No</span
                    ></template
                  >
                </td>
                <td class="px-6 py-4 text-right">
                  <a
                    class="font-medium text-blue-600 dark:text-blue-500 hover:cursor-pointer"
                    @click="editSchedule(id)"
                    >Edit</a
                  >
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              >
                <td colspan="5" class="px-6 py-4 text-center">-- NONE --</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <div class="card w-1/3 flex flex-col h-max">
        <div
          class="p-4 flex justify-center items-center border-b-2 border-dashed"
        >
          <span class="text-xl font-bold">Pump Switch</span>
        </div>
        <div class="flex justify-center items-center py-6">
          <button
            @click="togglePump"
            class="text-5xl text-white rounded-full p-6 flex justify-center items-center transition-all ease duration-1000"
            :class="
              pumpOn
                ? [
                    'bg-gradient-to-r',
                    'from-green-400',
                    'via-green-500',
                    'to-green-600',
                    'hover:bg-gradient-to-br',
                  ]
                : [
                    'bg-gradient-to-r',
                    'from-red-400',
                    'via-red-500',
                    'to-red-600',
                    'hover:bg-gradient-to-br',
                  ]
            "
          >
            <PoweroffOutlined />
          </button>
        </div>
        <span class="text-center text-xl font-bold"
          >{{ `0${timerHour}`.slice(-2) }}<sub>h</sub> :
          {{ `0${timerMin}`.slice(-2) }}<sub>m</sub> :
          {{ `0${timerSec}`.slice(-2) }}<sub>s</sub></span
        >
      </div>
    </div>
    <TransitionRoot appear :show="showEditPumpScheduleModal" as="template">
      <Dialog
        as="div"
        @close="showEditPumpScheduleModal = false"
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
                    selectedpumpSchedules.id
                      ? 'Change Schedule'
                      : 'Set New Schedule'
                  }}
                </DialogTitle>
                <div class="mt-2">
                  <div class="w-full mt-4">
                    <div class="flex">
                      <span
                        class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 rounded-l-md border border-r-0 border-gray-300 dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600"
                      >
                        Pump Run Time
                      </span>
                      <input
                        v-model="selectedpumpSchedules.time"
                        @blur="checkIfTimeExist"
                        type="time"
                        id="website-admin"
                        class="rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div class="w-full mt-4">
                    <div class="flex items-start mb-6">
                      <div class="flex items-center h-5">
                        <input
                          v-model="selectedpumpSchedules.repeatDaily"
                          type="checkbox"
                          value=""
                          class="w-4 h-4 bg-gray-50 rounded border border-gray-300 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                          required
                        />
                      </div>
                      <label
                        class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-400"
                        >Repeat Daily?</label
                      >
                    </div>
                  </div>
                </div>

                <div class="mt-4 flex justify-end">
                  <button
                    v-if="selectedpumpSchedules.id"
                    type="button"
                    class="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 mr-4"
                    @click="deleteSchedule(selectedpumpSchedules.id)"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    @click="saveSchedule"
                    v-bind:disabled="!canSave"
                  >
                    {{ selectedpumpSchedules.id ? 'Edit' : 'Add' }}
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
