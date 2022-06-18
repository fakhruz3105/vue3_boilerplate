import { GET, POST } from '@/utils/APICaller';
import { defineStore } from 'pinia';
import { Role } from '../enum';

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    loggedIn: false,
    user: {
      id: '',
      email: '',
      name: '',
      role: Role.VISITOR,
    },
    error: '',
  }),
  actions: {
    async login(email: string, password: string) {
      try {
        const user = await POST('/api/auth/login', { email, password });
        Object.assign(this.user, user);
        this.loggedIn = true;
      } catch (error) {
        this.loggedIn = false;
        throw error;
      }
    },
    async logout() {
      try {
        await POST('/api/auth/logout');
      } catch (error) {
        throw error;
      } finally {
        this.loggedIn = false;
        this.user = {
          id: '',
          email: '',
          name: '',
          role: Role.VISITOR,
        };
      }
    },
    async fetchUserDetails() {
      try {
        const user = await GET('/api/auth/user-details');
        Object.assign(this.user, user);
        this.loggedIn = true;
      } catch (error) {
        this.loggedIn = false;
      }
    },
  },
});
