<template>
  <div class="app-container">

    <section class="hero-section">
      <div class="hero-inner">
        <div class="hero-text">
          <router-link to="/" class="volver-inicio-btn">← Volver a Categorías</router-link>
          <h1 class="title-main">{{ tituloVista }}</h1>
          <p class="subtitle-main">Registro público de probidad y transparencia</p>
        </div>
        <div class="search-wrapper">
          <input
            v-model="filtroBusqueda"
            class="search-input"
            type="text"
            placeholder="Buscar por nombre, apellido o entidad..."
          />
        </div>
      </div>
    </section>

    <section class="menu-section">
      <div class="page-inner menu-inner">
        <div class="categorias-menu">
          <button
            v-for="cat in categoriasVisibles"
            :key="cat.tipo"
            class="categoria-btn"
            :class="{ activo: selectedTipos.includes(cat.tipo) }"
            @click="toggleTipo(cat.tipo)"
          >
            <span class="btn-check" v-if="selectedTipos.includes(cat.tipo)">✓</span>
            {{ cat.label }}
          </button>
        </div>
        <div class="menu-actions">
          <button class="action-btn" @click="seleccionarTodos">Todos</button>
          <button class="action-btn" @click="limpiarFiltros">Ninguno</button>
        </div>
      </div>
    </section>

    <section class="stats-section">
      <div class="page-inner stats-grid">
        <div
          class="stat-card clickable"
          :class="{ 'stat-active': filtroEstado === 'Todos' }"
          @click="filtroEstado = 'Todos'"
        >
          <span class="stat-number">{{ listaPoliticos.length }}</span>
          <span class="stat-label">Total registros</span>
        </div>
        <div
          class="stat-card clickable success-hover"
          :class="{ 'stat-active-success': filtroEstado === 'Limpio' }"
          @click="toggleFiltroEstado('Limpio')"
        >
          <span class="stat-number success">{{ limpios }}</span>
          <span class="stat-label">Limpios</span>
        </div>
        <div
          class="stat-card clickable warning-hover"
          :class="{ 'stat-active-warning': filtroEstado === 'Observación' }"
          @click="toggleFiltroEstado('Observación')"
        >
          <span class="stat-number warning">{{ enObservacion }}</span>
          <span class="stat-label">En observación</span>
        </div>
        <div
          class="stat-card clickable danger-hover"
          :class="{ 'stat-active-danger': filtroEstado === 'Crítico' }"
          @click="toggleFiltroEstado('Crítico')"
        >
          <span class="stat-number danger">{{ criticos }}</span>
          <span class="stat-label">Críticos</span>
        </div>
      </div>
    </section>

    <section class="table-section">
      <div class="page-inner">

        <div v-if="selectedTipos.length === 0" class="feedback-state">
          <p class="empty-icon">☝️</p>
          <p>Selecciona al menos una categoría para ver registros.</p>
        </div>

        <div v-else-if="cargando" class="feedback-state">
          <span class="loading-spinner"></span>
          <p>Cargando registros...</p>
        </div>

        <div v-else-if="politicosFiltrados.length === 0" class="feedback-state">
          <p class="empty-icon">🔍</p>
          <p>Sin resultados para los filtros actuales.</p>
          <button class="clear-btn" @click="resetearFiltrosAbsolutos">Restablecer filtros</button>
        </div>

        <div v-else class="table-wrapper">
          <div class="table-header-bar">
            <span class="result-count">
              {{ politicosFiltrados.length }} registro{{ politicosFiltrados.length !== 1 ? 's' : '' }}
              <template v-if="filtroEstado !== 'Todos'"> · estado "{{ filtroEstado }}"</template>
              <template v-if="filtroBusqueda"> · "{{ filtroBusqueda }}"</template>
            </span>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th></th>
                <th>Nombre / Entidad</th>
                <th class="hide-sm">Categoría</th>
                <th class="hide-sm">Período de Ejercicio</th>
                <th class="hide-md">Filiación</th>
                <th class="hide-lg">Nacimiento</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="politico in politicosFiltrados"
                :key="politico.id"
                class="fila-clickable"
                @click="irADetalle(politico)"
              >
                <td class="td-avatar">
                  <div class="list-avatar">
                    <img
                      v-if="getFoto(politico, politico.tipo) && !fotosRotas.has(politico.id_oficial)"
                      :src="getFoto(politico, politico.tipo)"
                      :alt="politico.nombre"
                      class="list-foto"
                      @error="marcarFotoRota(politico.id_oficial)"
                    />
                    <span v-else class="list-iniciales">
                      {{ getInitials(politico.nombre, politico.apellidos) }}
                    </span>
                  </div>
                </td>

                <td>
                  <div class="nombre-cell">
                    <strong>{{ politico.nombre }} {{ politico.apellidos }}</strong>
                    <span class="cargo-mobile hide-desktop">
                      {{ politico.cargo }}
                      <template v-if="formatPeriodos(politico) !== '—'">({{ formatPeriodos(politico) }})</template>
                    </span>
                  </div>
                </td>

                <td class="hide-sm">
                  <span class="tipo-badge">{{ getLabelDeTipo(politico.tipo) }}</span>
                </td>

                <td class="hide-sm">
                  <span class="periodo-texto-tabla">{{ formatPeriodos(politico) }}</span>
                </td>

                <td class="hide-md">{{ politico.partido_actual || '—' }}</td>

                <td class="hide-lg">{{ politico.fecha_nacimiento || '—' }}</td>

                <td>
                  <span class="estado-tag" :class="getEstadoClass(politico.estado_judicial)">
                    {{ politico.estado_judicial }}
                  </span>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { obtenerTodos } from '../firebase'
import { getFoto } from '../utils/fotos'

const props  = defineProps(['tipo'])
const router = useRouter()

const fotosRotas = ref(new Set())
const marcarFotoRota = (id) => { fotosRotas.value = new Set([...fotosRotas.value, id]) }

const getInitials = (nombre, apellidos) =>
  ((nombre?.[0] ?? '') + (apellidos?.[0] ?? '')).toUpperCase() || '?'

// ── Navegar al detalle usando directamente p.tipo ─────────────────────
const irADetalle = (politico) => {
  if (politico.tipo && politico.id_oficial) {
    router.push(`/detalle/${politico.tipo}/${politico.id_oficial}`)
  }
}

// ── Grupos de estado para los filtros de tarjetas ─────────────────────
const GRUPOS_ESTADO = {
  'Limpio':      ['Limpio'],
  'Observación': ['Observación', 'Prescrita', 'En Litigio', 'En Litigio / Delatora'],
  'Crítico':     ['Crítico', 'Condenado', 'Condenada', 'Condenada / Delatora'],
}

// ── Categorías ────────────────────────────────────────────────────────
const categorias = [
  { tipo: 'diputados',                    label: 'Diputados' },
  { tipo: 'dictador',                     label: 'Dictador' },
  { tipo: 'senadores',                    label: 'Senadores' },
  { tipo: 'presidentes',                  label: 'Presidentes' },
  { tipo: 'ministros',                    label: 'Ministros' },
  { tipo: 'subsecretarios',               label: 'Subsecretarios' },
  { tipo: 'seremis',                      label: 'Seremis' },
  { tipo: 'gobernadores',                 label: 'Gobernadores' },
  { tipo: 'delegados-presidenciales-reg', label: 'Delegados Regionales' },
  { tipo: 'delegados-presidenciales-pro', label: 'Delegados Provinciales' },
  { tipo: 'alcaldes',                     label: 'Alcaldes' },
  { tipo: 'concejales',                   label: 'Concejales' },
  { tipo: 'consejeros',                   label: 'Consejeros' },
  { tipo: 'jueces',                       label: 'Jueces' },
  { tipo: 'ministros-corte-apelaciones',  label: 'Corte Apelaciones' },
  { tipo: 'ministros-corte-suprema',      label: 'Corte Suprema' },
  { tipo: 'fiscales',                     label: 'Fiscales' },
  { tipo: 'contraloria',                  label: 'Contraloría' },
  { tipo: 'tc',                           label: 'Tribunal Const.' },
  { tipo: 'carabineros',                  label: 'Carabineros' },
  { tipo: 'pdi',                          label: 'PDI' },
  { tipo: 'ejercito',                     label: 'Ejército' },
  { tipo: 'empresas',                     label: 'Empresas' },
  { tipo: 'empresarios',                  label: 'Empresarios' },
  { tipo: 'abogados',                     label: 'Abogados' },
  { tipo: 'fundaciones',                  label: 'Fundaciones' },
]

const MACRO_MAP = {
  'presidentes': 'ejecutivo', 'ministros': 'ejecutivo', 'subsecretarios': 'ejecutivo',
  'delegados-presidenciales-reg': 'ejecutivo', 'delegados-presidenciales-pro': 'ejecutivo',
  'seremis': 'ejecutivo', 'dictador': 'ejecutivo',
  'senadores': 'legislativo', 'diputados': 'legislativo',
  'ministros-corte-suprema': 'judicial', 'ministros-corte-apelaciones': 'judicial', 'jueces': 'judicial',
  'gobernadores': 'local', 'consejeros': 'local', 'alcaldes': 'local', 'concejales': 'local',
  'fiscales': 'autonomos', 'contraloria': 'autonomos', 'tc': 'autonomos',
  'carabineros': 'policias', 'pdi': 'policias', 'ejercito': 'policias',
  'empresas': 'privado', 'empresarios': 'privado', 'abogados': 'privado', 'fundaciones': 'privado', // <-- ACTUALIZADO EN SECTOR PRIVADO
}

const macroActual        = computed(() => MACRO_MAP[props.tipo] || 'ejecutivo')
const categoriasVisibles = computed(() => categorias.filter(c => (MACRO_MAP[c.tipo] || 'gobierno') === macroActual.value))
const getLabelDeTipo     = (tipo) => categorias.find(c => c.tipo === tipo)?.label ?? tipo

// ── Estado ────────────────────────────────────────────────────────────
const todosLosPoliticos = ref([])
const filtroBusqueda    = ref('')
const cargando          = ref(false)
const selectedTipos     = ref([props.tipo].filter(Boolean))
const filtroEstado      = ref('Todos')

watch(() => props.tipo, (nuevoTipo) => {
  if (nuevoTipo && !selectedTipos.value.includes(nuevoTipo)) {
    selectedTipos.value = [nuevoTipo]
  }
  filtroEstado.value   = 'Todos'
  filtroBusqueda.value = ''
})

onMounted(async () => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  cargando.value = true
  todosLosPoliticos.value = await obtenerTodos()
  cargando.value = false
})

// ── Auxiliar: año más reciente para ordenamiento ──────────────────────
const getAnoMasReciente = (politico) => {
  if (!politico.periodos_ejercicio || !Array.isArray(politico.periodos_ejercicio) || politico.periodos_ejercicio.length === 0) {
    return 0
  }
  const anos = politico.periodos_ejercicio.map(p => {
    const ano = p.inicio ? parseInt(p.inicio.split('-')[0]) : 0
    return isNaN(ano) ? 0 : ano
  })
  return Math.max(...anos)
}

// ── Auxiliar: formatea períodos en una línea ──────────────────────────
const formatPeriodos = (politico) => {
  if (!politico.periodos_ejercicio || !Array.isArray(politico.periodos_ejercicio) || politico.periodos_ejercicio.length === 0) {
    return '—'
  }
  return politico.periodos_ejercicio.map(p => {
    const ini = p.inicio  ? p.inicio.split('-')[0]  : '????'
    const ter = p.termino
      ? (p.termino.toLowerCase() === 'presente' ? 'Pres.' : p.termino.split('-')[0])
      : '????'
    return `${ini}-${ter}`
  }).join(', ')
}

// ── Lista principal ordenada cronológicamente (usando directamente p.tipo)
const listaPoliticos = computed(() => {
  if (selectedTipos.value.length === 0) return []
  return todosLosPoliticos.value
    .filter(p => selectedTipos.value.includes(p.tipo))
    .sort((a, b) => {
      const anoA = getAnoMasReciente(a)
      const anoB = getAnoMasReciente(b)
      if (anoB !== anoA) return anoB - anoA
      return (a.apellidos ?? '').localeCompare(b.apellidos ?? '')
    })
})

// ── Filtrado por grupo de estado + búsqueda ───────────────────────────
const politicosFiltrados = computed(() => {
  let resultado = listaPoliticos.value

  if (filtroEstado.value !== 'Todos') {
    const estadosDelGrupo = GRUPOS_ESTADO[filtroEstado.value] ?? [filtroEstado.value]
    resultado = resultado.filter(p => estadosDelGrupo.includes(p.estado_judicial))
  }

  if (!filtroBusqueda.value) return resultado
  const texto = filtroBusqueda.value.toLowerCase()
  return resultado.filter(p =>
    p.nombre?.toLowerCase().includes(texto) ||
    p.apellidos?.toLowerCase().includes(texto) ||
    p.partido_actual?.toLowerCase().includes(texto)
  )
})

// ── Stats — usan también GRUPOS_ESTADO para ser consistentes ─────────
const limpios = computed(() =>
  listaPoliticos.value.filter(p =>
    GRUPOS_ESTADO['Limpio'].includes(p.estado_judicial)
  ).length
)

const enObservacion = computed(() =>
  listaPoliticos.value.filter(p =>
    GRUPOS_ESTADO['Observación'].includes(p.estado_judicial)
  ).length
)

const criticos = computed(() =>
  listaPoliticos.value.filter(p =>
    GRUPOS_ESTADO['Crítico'].includes(p.estado_judicial)
  ).length
)

// ── Título dinámico ───────────────────────────────────────────────────
const tituloVista = computed(() => {
  if (selectedTipos.value.length === 0)          return 'Sin selección'
  if (selectedTipos.value.length === 1)          return getLabelDeTipo(selectedTipos.value[0])
  if (macroActual.value === 'policias')          return 'Policías y Fuerzas Armadas'
  if (macroActual.value === 'privado')           return 'Sector Privado y Fundaciones'
  if (macroActual.value === 'autonomos')         return 'Órganos Autónomos'
  return 'Gobierno y Estado'
})

// ── Controles ─────────────────────────────────────────────────────────
const toggleTipo = (tipo) => {
  const idx = selectedTipos.value.indexOf(tipo)
  if (idx === -1) selectedTipos.value = [...selectedTipos.value, tipo]
  else            selectedTipos.value = selectedTipos.value.filter(t => t !== tipo)
}

const toggleFiltroEstado       = (estado) => { filtroEstado.value = filtroEstado.value === estado ? 'Todos' : estado }
const resetearFiltrosAbsolutos = () => { filtroBusqueda.value = ''; filtroEstado.value = 'Todos' }
const seleccionarTodos         = () => { selectedTipos.value = categoriasVisibles.value.map(c => c.tipo) }
const limpiarFiltros           = () => { selectedTipos.value = [] }

// ── Clase CSS por estado judicial ─────────────────────────────────────
const getEstadoClass = (estado) => {
  if (GRUPOS_ESTADO['Limpio'].includes(estado))      return 'estado-success'
  if (GRUPOS_ESTADO['Observación'].includes(estado)) return 'estado-warning'
  if (GRUPOS_ESTADO['Crítico'].includes(estado))     return 'estado-danger'
  return 'estado-default'
}
</script>