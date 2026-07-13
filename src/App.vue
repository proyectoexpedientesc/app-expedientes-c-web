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
        <img :src="temaClaro ? '/logo_b.png' : '/logo_w.png'" alt="Logo Expedientes C" class="nav-logo-img">
        <span>Expedientes <span class="logo-accent">C</span></span>
      </router-link>

      <!-- Menú desktop (ahora SOLO contiene los links) -->
      <div class="navbar-menu">
        <router-link to="/causas" class="nav-item">🕸️ Mapa Judicial</router-link>
        <router-link to="/transparencia" class="nav-item nav-item-accent">Transparencia</router-link>
      </div>

      <!-- NUEVO: Contenedor de acciones siempre visible -->
      <div style="display: flex; align-items: center; gap: 12px;">
        
        <!-- Botón de tema -->
        <button class="tema-btn" @click="toggleTema" :title="temaClaro ? 'Modo oscuro' : 'Modo claro'">
          {{ temaClaro ? '☀️' : '🌙' }}
        </button>

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