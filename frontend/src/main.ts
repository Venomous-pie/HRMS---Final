import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import 'virtual:uno.css'
import './global.css'
import 'primeicons/primeicons.css'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// ApexCharts
import VueApexCharts from 'vue3-apexcharts'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
  components,
  directives,
})

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vuetify)
app.component('apexchart', VueApexCharts)

app.mount('#app')
