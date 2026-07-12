<script setup>
import { RouterView, useRoute } from 'vue-router'
import { ref, watch, onMounted } from 'vue'

const temaClaro = ref(false)
const menuAbierto = ref(false)
const route = useRoute()

// Función para cambiar el tema
const toggleTema = () => {
  temaClaro.value = !temaClaro.value
}

// Cargar preferencia guardada al iniciar
onMounted(() => {
  const guardado = localStorage.getItem('tema')
  if (guardado === 'claro') {
    temaClaro.value = true
    document.documentElement.classList.add('tema-claro')
  }
})

// Cerrar menú al navegar
watch(() => route.path, () => { menuAbierto.value = false })

// Aplicar tema al cambiar
watch(temaClaro, (esClaro) => {
  if (esClaro) {
    document.documentElement.classList.add('tema-claro')
    localStorage.setItem('tema', 'claro')
  } else {
    document.documentElement.classList.remove('tema-claro')
    localStorage.setItem('tema', 'oscuro')
  }
})

const toggleMenu = () => { menuAbierto.value = !menuAbierto.value }
</script>

<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-inner">

      <!-- Logo -->
      <router-link to="/" class="navbar-logo">
        Expedientes <span class="logo-accent">C</span>
      </router-link>

      <!-- Menú desktop y botón de tema -->
      <div class="navbar-menu">
        <router-link to="/causas" class="nav-item">🕸️ Mapa Judicial</router-link>
        <router-link to="/transparencia" class="nav-item nav-item-accent">Transparencia</router-link>
        
        <button class="tema-btn" @click="toggleTema" :title="temaClaro ? 'Modo oscuro' : 'Modo claro'">
          {{ temaClaro ? '☀️' : '🌙' }}
        </button>
      </div>

      <!-- Hamburger mobile -->
      <button
        class="hamburger"
        :class="{ abierto: menuAbierto }"
        @click="toggleMenu"
        aria-label="Abrir menú"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

    </div>

    <!-- Menú mobile desplegable -->
    <div class="mobile-menu" :class="{ visible: menuAbierto }">
      <router-link to="/" class="mobile-item">🏠 Inicio</router-link>
      <router-link to="/causas" class="mobile-item">🕸️ Mapa Judicial</router-link>
      <router-link to="/transparencia" class="mobile-item mobile-item-accent">Transparencia</router-link>
    </div>
  </nav>

  <!-- AQUÍ SE CARGA EL HOMEVIEW Y LAS DEMÁS PÁGINAS -->
  <RouterView />
</template>