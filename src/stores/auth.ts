import { POST } from '@/utils/APICaller'
import { defineStore } from 'pinia'

export enum Role {
  SUPER_ADMIN = 0,
  ADMIN = 1,
  VISITOR,
}

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    loggedIn: false,
    user: {
      id: '',
      email: '',
      name: '',
      role: Role.VISITOR
    },
    error: ''
  }),
  actions: {
    async login(email: string, password: string) {
      try {
        const user = await POST('/api/auth/login', { email, password })
        Object.assign(this.user, user)
        this.loggedIn = true
      } catch (error) {
        this.loggedIn = false
      }
    },
    async logout() {
      try {
        await POST('/api/auth/logout', null, { withCredentials: true })
      } catch (error) {
        throw error
      } finally {
        this.loggedIn = false
        this.user = {
          id: '',
          email: '',
          name: '',
          role: Role.VISITOR
        }
      }
    }
  }
})
