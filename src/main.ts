import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.config.errorHandler = (_) => {
  const authStore = useAuthStore()
  const error = _ as Error
  authStore.error = error.message
}

app.mount('#app')
