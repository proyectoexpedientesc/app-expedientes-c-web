// main.js
import 'bulma/css/bulma.css' // 1. Bulma DEBE ir primero
import './assets/main.css'   // 2. Tus estilos DEBEN ir después para sobreescribir a Bulma

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')