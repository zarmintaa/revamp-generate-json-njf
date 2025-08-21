import '@/assets/css/styles.min.css'
import '@/assets/libs/jquery/dist/jquery.min.js'
import '@/assets/libs/bootstrap/dist/js/bootstrap.bundle.js'
import '@/assets/js/app.min.js'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import supabasePlugin from './plugins/supabase' // <-- Impor plugin

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(supabasePlugin)

app.mount('#app')
