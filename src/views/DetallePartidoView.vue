<template>
  <div class="app-container">

    <section class="hero-section">
      <div class="hero-inner">
        <router-link to="/partidos" class="volver-inicio-btn">← Volver a Partidos</router-link>
        <h1 class="title-main">{{ partidoActual?.nombre || 'Partido' }}</h1>
        <p class="subtitle-main">
          <template v-if="partidoActual"> {{ politicosDelPartido.length }} político(s) registrados</template>
        </p>
      </div>
    </section>

    <div class="page-inner">

      <div v-if="cargando" class="feedback-state">
        <span class="loading-spinner"></span>
        <p>Cargando políticos...</p>
      </div>

      <div v-else-if="!partidoActual" class="feedback-state">
        <p class="empty-icon">🏛️</p>
        <p>Partido no encontrado.</p>
      </div>

      <div v-else class="visor-nodos">
        <div class="arbol-container">

          <div class="tarjeta-partido-wrapper">
          <div class="nodo-central nodo-central-logo-solo" :style="{ borderColor: partidoActual.color }">
            <div class="nodo-icono partido-logo-central">
              <img
                v-if="partidoActual.logo && !logoRoto"
                :src="partidoActual.logo"
                :alt="partidoActual.nombre"
                @error="logoRoto = true"
              />
              <span v-else>🏛️</span>
            </div>
          </div>
          </div>

          <div v-if="politicosDelPartido.length === 0" class="empty-state">
            Sin políticos registrados para este partido.
          </div>

          <div v-else class="arbol-ramas">
            <div
              v-for="politico in politicosDelPartido"
              :key="politico.id_oficial"
              class="rama-hijo"
            >
              <div class="nodo-politico">
                <div class="nodo-avatar">
                  <img
                    v-if="getFoto(politico, politico.tipo) && !fotosRotas.has(politico.id_oficial)"
                    :src="getFoto(politico, politico.tipo)"
                    :alt="politico.nombre"
                    class="nodo-foto"
                    @error="marcarFotoRota(politico.id_oficial)"
                  />
                  <span v-else class="nodo-iniciales">
                    {{ getInitials(politico.nombre, politico.apellidos) }}
                  </span>
                </div>
                <div class="nodo-info">
                  <strong>{{ politico.nombre }} {{ politico.apellidos }}</strong>
                  <span>{{ politico.cargo }}</span>
                  <span class="estado-micro" :class="getEstadoClass(politico.estado_judicial)">
                    {{ politico.estado_judicial }}
                  </span>
                </div>
                <router-link
                  :to="`/detalle/${politico.tipo}/${politico.id_oficial}`"
                  class="nodo-link"
                >
                  Abrir Ficha
                </router-link>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { obtenerTodos } from '../firebase'
import { getFoto } from '../utils/fotos'
import { PARTIDOS_CONFIG, TIPOS_POLITICOS, resolverIdPartido } from '../utils/partidos'

const props = defineProps(['id'])

const politicos   = ref([])
const cargando    = ref(true)
const fotosRotas  = ref(new Set())
const logoRoto    = ref(false)

const marcarFotoRota = (id) => {
  fotosRotas.value = new Set([...fotosRotas.value, id])
}

const getInitials = (nombre, apellidos) =>
  ((nombre?.[0] ?? '') + (apellidos?.[0] ?? '')).toUpperCase() || '?'

const getEstadoClass = (estado) => {
  switch (estado) {
    case 'Limpio':      return 'estado-success'
    case 'Observación': return 'estado-warning'
    case 'Prescrita': return 'estado-warning'
    case 'En Litigio': return 'estado-warning'
    case 'En Litigio / Delatora': return 'estado-warning'
    case 'Crítico':     return 'estado-danger'
    case 'Condenado':     return 'estado-danger'
    case 'Condenada':     return 'estado-danger'
    case 'Condenada / Delatora':     return 'estado-danger'
    default:            return 'estado-default'
  }
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

const partidoActual = computed(() => {
  const config = PARTIDOS_CONFIG.find(p => p.id === props.id)
  if (!config) return null
  return {
    id: config.id,
    nombre: config.nombre,
    color: config.color,
    logo: config.logo
  }
})

const politicosDelPartido = computed(() => {
  const lista = politicosPorPartido.value[props.id] || []
  return [...lista].sort((a, b) => (a.apellidos ?? '').localeCompare(b.apellidos ?? ''))
})

// Reinicia el estado del logo roto al cambiar de partido (deep-link entre partidos)
watch(() => props.id, () => {
  logoRoto.value = false
  window.scrollTo({ top: 0, behavior: 'instant' })
})

onMounted(async () => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  cargando.value = true
  politicos.value = await obtenerTodos()
  cargando.value = false
})
</script>

<style scoped>
/* Logo grande en el panel central (reemplaza el emoji 🏛️ cuando existe) */
.partido-logo-central img {
  width: 140px;
  height: 140px;
  object-fit: contain;
}

/* Tarjeta central reducida a solo el logo: menos alto, más ancho de imagen */
.nodo-central-logo-solo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 40px;
  min-width: 260px;
}

.nodo-central-logo-solo .nodo-icono {
  font-size: 64px;
  margin: 0;
}

/* Empuja la tarjeta central completa (borde incluido) hacia abajo,
   separándola del header. Usa un wrapper propio para no depender de
   clases globales compartidas con otras vistas (CausasView, etc). */
.tarjeta-partido-wrapper {
  display: block;
  margin-top: 40px;
}
</style>