// main.js
import 'bulma/css/bulma.css' 
import './assets/main.css' 

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 1. Cambiamos la importación por la versión universal para Vue
import { inject } from "@vercel/analytics"

const app = createApp(App)

app.use(router)

app.mount('#app')

// 2. Ejecutamos la función de inyección después de montar la app
inject()