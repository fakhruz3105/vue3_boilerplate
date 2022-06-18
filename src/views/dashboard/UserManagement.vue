<script setup lang="ts">
import type { User } from '@/interface';
import { PlusOutlined } from '@ant-design/icons-vue';
import { computed, onMounted, ref, unref, type Ref } from 'vue';
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue';
import { GET, POST, PUT } from '@/utils/APICaller';
import { useNotificationStore } from '@/stores/notification';
import { Role } from '@/enum';
import { useAuthStore } from '@/stores/auth';

const { addNotification } = useNotificationStore();
const { user: currentUser } = useAuthStore();

const users: Ref<User[]> = ref([]);
const selectedUser = ref({} as User);
const showEditUserModal = ref(false);

const userList = computed(() => {
  return users.value.filter((user) => user.id !== currentUser.id);
});

async function fetchUsers() {
  users.value = await GET('/api/user/all');
}

function editUser(id?: string) {
  selectedUser.value = { ...(users.value.find((e) => e.id === id) as User) };
  showEditUserModal.value = true;
}

function newUser() {
  selectedUser.value = {} as User;
  showEditUserModal.value = true;
}

async function saveUser() {
  const { id, name, email, role } = unref(selectedUser);

  if (id) {
    await PUT('/api/user', { id, name, role });
    addNotification('User has been updated', 'success');
  } else {
    await POST('/api/user', { id, name, email, role });
    addNotification('User has been added', 'success');
  }

  await fetchUsers();
  showEditUserModal.value = false;
}

onMounted(async () => {
  await fetchUsers();
});
</script>

<template>
  <div>
    <div class="card mb-8">
      <div class="flex justify-start items-center">
        <span class="font-bold mr-4">User List</span>
        <PlusOutlined
          @click="newUser"
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
            <th scope="col" class="px-6 py-3">Email</th>
            <th scope="col" class="px-6 py-3">Name</th>
            <th scope="col" class="px-6 py-3">Role</th>
            <th scope="col" class="px-6 py-3">Verified</th>
            <th scope="col" class="px-6 py-3">
              <span class="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="userList.length > 0">
            <tr
              v-for="{ id, name, email, role, verified } of userList"
              class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
            >
              <th
                scope="row"
                class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
              >
                {{ email }}
              </th>
              <td class="px-6 py-4">
                {{ name }}
              </td>
              <td class="px-6 py-4">
                {{ role === Role.SUPER_ADMIN ? 'User Manager' : 'User' }}
              </td>
              <td class="px-6 py-4">
                <template v-if="verified"
                  ><span
                    class="text-sm text-green-700 bg-green-100 rounded-lg p-2"
                    >Verified</span
                  ></template
                >
                <template v-else
                  ><span class="text-sm text-red-700 bg-red-100 rounded-lg p-2"
                    >Not Verified</span
                  ></template
                >
              </td>
              <td class="px-6 py-4 text-right">
                <a
                  class="font-medium text-blue-600 dark:text-blue-500 hover:cursor-pointer"
                  @click="editUser(id)"
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
    <TransitionRoot appear :show="showEditUserModal" as="template">
      <Dialog
        as="div"
        @close="showEditUserModal = false"
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
                  {{ selectedUser.id ? 'Edit Sensor Type' : 'New Sensor Type' }}
                </DialogTitle>
                <div class="mt-2">
                  <div class="w-full mt-4">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >Name</label
                    >
                    <input
                      v-model="selectedUser.name"
                      type="text"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div class="w-full mt-4">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >Email</label
                    >
                    <input
                      v-model="selectedUser.email"
                      type="email"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="admin@dev.com"
                      required
                    />
                  </div>
                  <div class="w-full mt-4">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
                      >Role</label
                    >
                    <select
                      v-model="selectedUser.role"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option selected :value="Role.ADMIN">Admin</option>
                      <option :value="Role.SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>
                </div>

                <div class="mt-4 flex justify-end">
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    @click="saveUser"
                  >
                    {{ selectedUser.id ? 'Edit' : 'Add' }}
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
