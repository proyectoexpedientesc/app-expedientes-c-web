<template>
  <div class="app-container">

    <section class="hero-section">
      <div class="hero-inner">
        <div class="hero-text">
          <router-link to="/" class="volver-inicio-btn">← Volver al Inicio</router-link>
          <h1 class="title-main">Registro de Votaciones</h1>
          <p class="subtitle-main">Historial de proyectos aprobados o rechazados en el Congreso Nacional</p>
        </div>
        <div class="search-wrapper">
          <input
            v-model="filtroBusqueda"
            class="search-input"
            type="text"
            placeholder="Buscar por título o materia..."
          />
        </div>
      </div>
    </section>

    <section class="table-section table-section-top">
      <div class="page-inner">

        <div v-if="cargando" class="feedback-state">
          <span class="loading-spinner"></span>
          <p>Cargando votaciones...</p>
        </div>

        <div v-else-if="votacionesFiltradas.length === 0" class="feedback-state">
          <p class="empty-icon">🔍</p>
          <p>No se encontraron votaciones registradas.</p>
        </div>

        <div v-else class="table-wrapper">
          <div class="table-header-bar">
            <span class="result-count">{{ votacionesFiltradas.length }} votación(es) encontradas</span>
          </div>

          <table class="data-table tabla-votaciones">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cámara</th>
                <th>Título del Proyecto</th>
                <th>Estado</th>
                <th>Votación</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="vot in votacionesFiltradas"
                :key="vot.id_votacion"
                class="fila-clickable"
                @click="$router.push(`/votaciones/${vot.id_votacion}`)"
              >
                <td data-label="Fecha"><strong>{{ vot.fecha || 'Sin fecha' }}</strong></td>
                <td data-label="Cámara"><span class="tipo-badge">{{ vot.camara || '—' }}</span></td>
                <td data-label="Título del Proyecto">{{ vot.titulo || 'Sin título' }}</td>
                <td data-label="Estado">
                  <span class="estado-tag" :class="vot.estado === 'Aprobado' ? 'estado-success' : 'estado-danger'">
                    {{ vot.estado || 'Sin estado' }}
                  </span>
                </td>
                <td data-label="Votación" class="votos-resumen">
                  <span class="voto-favor">{{ vot.totales?.a_favor ?? 0 }}</span>
                  <span class="votos-sep">/</span>
                  <span class="voto-contra">{{ vot.totales?.en_contra ?? 0 }}</span>
                  <span class="votos-sep">/</span>
                  <span class="voto-abs">{{ vot.totales?.abstencion ?? 0 }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase' // Asegúrate de que esta ruta apunte a tu config de Firebase

const votaciones = ref([])
const cargando = ref(true)
const filtroBusqueda = ref('')

onMounted(async () => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  try {
    const snap = await getDocs(collection(db, 'votaciones'))
    votaciones.value = snap.docs.map(doc => doc.data())
      // Orden descendente por fecha — tolerante a documentos sin fecha
      .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
  } catch (error) {
    console.error("Error cargando votaciones:", error)
  }
  cargando.value = false
})

const votacionesFiltradas = computed(() => {
  if (!filtroBusqueda.value) return votaciones.value
  const t = filtroBusqueda.value.toLowerCase()
  return votaciones.value.filter(v =>
    (v.titulo || '').toLowerCase().includes(t) ||
    (v.materia || '').toLowerCase().includes(t)
  )
})
</script>