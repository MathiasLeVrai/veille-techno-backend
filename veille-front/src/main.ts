import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import Aura from '@primeuix/themes/aura'
import App from './App.vue'
import { setUnauthorizedHandler } from './api/http'
import { localeFr } from './locale-fr'
import { router } from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
  locale: localeFr,
  // Clé gratuite (Community License) à récupérer sur https://primeui.dev, sinon un bandeau s'affiche
  license: import.meta.env.VITE_PRIMEVUE_LICENSE,
})
app.use(ToastService)
app.use(ConfirmationService)

// Token expiré pendant l'utilisation : on déconnecte et on renvoie vers le login
setUnauthorizedHandler(() => {
  useAuthStore().logout()
  router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
})

app.mount('#app')
