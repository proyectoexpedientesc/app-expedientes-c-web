<template>
  <div class="app-container">

    <section class="hero-section">
      <div class="hero-inner">
        <router-link to="/" class="volver-inicio-btn">← Volver al Inicio</router-link>
        <h1 class="title-main">Partidos Políticos</h1>
        <p class="subtitle-main">Directorio de autoridades por afiliación partidaria</p>
      </div>
    </section>

    <div class="page-inner">

      <div v-if="cargando" class="feedback-state">
        <span class="loading-spinner"></span>
        <p>Cargando partidos...</p>
      </div>

      <div v-else-if="partidosConDatos.length === 0" class="feedback-state">
        <p class="empty-icon">🏛️</p>
        <p>Sin partidos con registros disponibles.</p>
      </div>

      <div v-else class="partidos-grid">
        <router-link
          v-for="partido in partidosConDatos"
          :key="partido.id"
          :to="`/partidos/${partido.id}`"
          class="partido-card"
          :style="{ borderColor: partido.color }"
        >
          <div class="partido-card-logo">
            <img
              v-if="partido.logo && !logosRotos.has(partido.id)"
              :src="partido.logo"
              :alt="partido.nombre"
              @error="marcarLogoRoto(partido.id)"
            />
            <span v-else class="partido-card-logo-fallback">🏛️</span>
          </div>
          <div class="partido-card-info">
            <strong class="partido-card-nombre">{{ partido.nombre }}</strong>
            <span class="partido-card-cantidad">{{ partido.cantidad }} político(s)</span>
          </div>
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { obtenerTodos } from '../firebase'
import { PARTIDOS_CONFIG, TIPOS_POLITICOS, resolverIdPartido } from '../utils/partidos'

const politicos  = ref([])
const cargando   = ref(true)
const logosRotos = ref(new Set())

const marcarLogoRoto = (id) => {
  logosRotos.value = new Set([...logosRotos.value, id])
}

// ── Solo cargos con afiliación partidaria real, agrupados por partido ──
const politicosPorPartido = computed(() => {
  const mapa = {}
  politicos.value.forEach(p => {
    if (!TIPOS_POLITICOS.includes(p.tipo)) return
    const idPartido = resolverIdPartido(p)
    if (!idPartido) return
    if (!mapa[idPartido]) mapa[idPartido] = []
    mapa[idPartido].push(p)
  })
  return mapa
})

// Partidos con al menos 1 político registrado, ordenados por cantidad descendente
const partidosConDatos = computed(() => {
  return PARTIDOS_CONFIG
    .map(p => ({
      id: p.id,
      nombre: p.nombre,
      color: p.color,
      logo: p.logo,
      cantidad: (politicosPorPartido.value[p.id] || []).length
    }))
    .filter(p => p.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad)
})

onMounted(async () => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  cargando.value = true
  politicos.value = await obtenerTodos()
  cargando.value = false
})
</script>