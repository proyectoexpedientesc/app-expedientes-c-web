<template>
  <div class="app-container">

    <section class="hero-section">
      <div class="hero-inner">
        <router-link to="/" class="volver-inicio-btn">← Volver al Inicio</router-link>
        <h1 class="title-main">Redes e Investigaciones</h1>
        <p class="subtitle-main">Mapa de relaciones judiciales y causas de interés público</p>
      </div>
    </section>

    <!-- ── LÍNEA DE TIEMPO HORIZONTAL (solo mobile) ───── -->
    <div class="timeline-mobile page-inner">
      <div class="timeline-mobile-track">
        <button
          class="tm-punto"
          :class="{ activo: anoSeleccionado === null }"
          @click="filtrarPorAno(null)"
        >
          <span class="tm-circulo"></span>
          <span class="tm-texto">Todas</span>
        </button>
        <div class="tm-linea"></div>
        <template v-for="(ano, i) in anosDisponibles" :key="ano">
          <button
            class="tm-punto"
            :class="{ activo: anoSeleccionado === ano }"
            @click="filtrarPorAno(ano)"
          >
            <span class="tm-circulo"></span>
            <span class="tm-texto">{{ ano }}</span>
          </button>
          <div v-if="i < anosDisponibles.length - 1" class="tm-linea"></div>
        </template>
      </div>
    </div>

    <!-- ── LAYOUT PRINCIPAL: timeline | sidebar | grafo ── -->
    <div class="layout-principal page-inner">

      <!-- Línea de tiempo VERTICAL (desktop) -->
      <aside class="timeline-desktop">

        <div class="td-label">Período</div>

        <div class="td-track">
          <div class="td-punto-wrap">
            <button
              class="td-punto"
              :class="{ activo: anoSeleccionado === null }"
              @click="filtrarPorAno(null)"
              title="Todas las causas"
            >
              <span class="td-circulo"></span>
              <span class="td-texto">Todas</span>
            </button>
          </div>

          <div class="td-linea-wrap">
            <div class="td-linea"></div>
          </div>

          <template v-for="(ano, i) in anosDisponibles" :key="ano">
            <div class="td-punto-wrap">
              <button
                class="td-punto"
                :class="{ activo: anoSeleccionado === ano }"
                @click="filtrarPorAno(ano)"
              >
                <span class="td-circulo"></span>
                <span class="td-texto">{{ ano }}</span>
              </button>
            </div>
            <div v-if="i < anosDisponibles.length - 1" class="td-linea-wrap">
              <div class="td-linea"></div>
            </div>
          </template>
        </div>

      </aside>

      <!-- ── SIDEBAR: lista de causas ───────────────────── -->
      <aside class="sidebar-causas">

        <!-- Sombra top -->
        <div class="sidebar-fade-top" :class="{ visible: showTopShadow }"></div>

        <!-- Contenido scrolleable -->
        <div class="sidebar-scroll" ref="sidebarRef" @scroll="actualizarSombras">

          <h2 class="sidebar-title">
            Expedientes
            <span class="sidebar-count">{{ listaCausasFiltradas.length }}</span>
          </h2>

          <div v-if="cargando" class="loading-state">
            <span class="loading-spinner"></span>
          </div>

          <div v-else-if="listaCausasFiltradas.length === 0" class="empty-state">
            Sin causas para este período.
          </div>

          <ul v-else class="lista-casos">
            <li
              v-for="causa in listaCausasFiltradas"
              :key="causa.id_causa"
              class="caso-item"
              :class="{ activo: causaSeleccionada?.id_causa === causa.id_causa }"
              @click="seleccionarCausa(causa)"
            >
              <div class="caso-ano">{{ causa.anio }}</div>
              <div class="caso-titulo">{{ causa.titulo }}</div>
              <div class="caso-nodos">{{ causa.politicos.length }} involucrado(s)</div>
            </li>
          </ul>

        </div>

        <!-- Sombra bottom -->
        <div class="sidebar-fade-bottom" :class="{ visible: showBottomShadow }"></div>

      </aside>

      <!-- ── GRAFO PRINCIPAL ────────────────────────────── -->
      <main class="grafo-causas">

        <div v-if="!causaSeleccionada && !cargando" class="empty-grafo">
          <span class="empty-icon">🕸️</span>
          <p>Selecciona un expediente para visualizar la red de vínculos.</p>
        </div>

        <div v-else-if="causaSeleccionada" class="visor-nodos">
          <div class="arbol-container">

            <div class="nodo-central">
              <div class="nodo-icono">📁</div>
              <h2 class="nodo-titulo">{{ causaSeleccionada.titulo }}</h2>
              <p class="nodo-detalle">{{ causaSeleccionada.detalle }}</p>
              <div class="nodo-meta" v-if="causaSeleccionada.fecha_delito">
                Fecha: {{ causaSeleccionada.fecha_delito }}
              </div>
            </div>

            <div class="arbol-ramas">
              <div
                v-for="politico in causaSeleccionada.politicos"
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

      </main>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { obtenerTodos } from '../firebase'
import { getFoto } from '../utils/fotos'

const politicos         = ref([])
const cargando          = ref(true)
const causaSeleccionada = ref(null)
const anoSeleccionado   = ref(null)
const fotosRotas        = ref(new Set())
const route             = useRoute()

// ── Sombras dinámicas del sidebar ─────────────────────────────────────
const sidebarRef       = ref(null)
const showTopShadow    = ref(false)
const showBottomShadow = ref(false)

const actualizarSombras = () => {
  const el = sidebarRef.value
  if (!el) return
  showTopShadow.value    = el.scrollTop > 10
  showBottomShadow.value = el.scrollTop + el.clientHeight < el.scrollHeight - 10
}

const marcarFotoRota = (id) => {
  fotosRotas.value = new Set([...fotosRotas.value, id])
}

const getInitials = (nombre, apellidos) =>
  ((nombre?.[0] ?? '') + (apellidos?.[0] ?? '')).toUpperCase() || '?'

// ── CAUSAS AGRUPADAS ──────────────────────────────────────────────────
const listaCausas = computed(() => {
  const mapa = {}
  politicos.value.forEach(politico => {
    if (!Array.isArray(politico.causas)) return
    politico.causas.forEach(causa => {
      if (!mapa[causa.id_causa]) mapa[causa.id_causa] = { ...causa, politicos: [] }
      if (!mapa[causa.id_causa].politicos.find(p => p.id_oficial === politico.id_oficial)) {
        mapa[causa.id_causa].politicos.push(politico)
      }
    })
  })
  return Object.values(mapa).sort((a, b) => (parseInt(b.anio) || 0) - (parseInt(a.anio) || 0))
})

const anosDisponibles = computed(() => {
  const anos = new Set(listaCausas.value.map(c => c.anio).filter(Boolean))
  return Array.from(anos).sort((a, b) => b - a)
})

const listaCausasFiltradas = computed(() =>
  anoSeleccionado.value === null
    ? listaCausas.value
    : listaCausas.value.filter(c => c.anio === anoSeleccionado.value)
)

const filtrarPorAno = (ano) => {
  anoSeleccionado.value = ano
  if (
    causaSeleccionada.value &&
    !listaCausasFiltradas.value.some(c => c.id_causa === causaSeleccionada.value.id_causa)
  ) {
    causaSeleccionada.value = null
  }
  // Resetear scroll y recalcular sombras al cambiar filtro
  nextTick(() => {
    if (sidebarRef.value) sidebarRef.value.scrollTop = 0
    actualizarSombras()
  })
}

const seleccionarCausa = (causa) => { causaSeleccionada.value = causa }

// Recalcular sombras cuando cambia el contenido
watch(listaCausasFiltradas, () => {
  nextTick(actualizarSombras)
})

watch(
  [listaCausasFiltradas, () => route.query.id],
  ([filtradas, idUrl]) => {
    if (filtradas.length === 0) { causaSeleccionada.value = null; return }
    if (idUrl) {
      const encontrada = filtradas.find(c => c.id_causa === idUrl)
      if (encontrada) { causaSeleccionada.value = encontrada; return }
    }
    if (!causaSeleccionada.value || !filtradas.some(c => c.id_causa === causaSeleccionada.value.id_causa)) {
      causaSeleccionada.value = filtradas[0]
    }
  },
  { immediate: true }
)

onMounted(async () => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  cargando.value = true
  politicos.value = await obtenerTodos()
  cargando.value = false
  nextTick(actualizarSombras)
})

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
</script>