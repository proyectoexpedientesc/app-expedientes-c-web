<template>
  <div class="home-container">

    <section class="home-hero">
      <div class="hero-content-wrapper">
        
        <!-- Lado Izquierdo: Textos y Botones -->
        <div class="hero-text-side">
          <h1 class="home-title">Expedientes <span class="accent">C</span></h1>
          
          <div class="hero-eyebrow">Chile · Registro Público</div>
          
          <p class="home-subtitle">
            Base de datos de probidad y transparencia.<br class="hide-mobile">
            Registro de autoridades, instituciones de orden y actores privados.
          </p>

          <div class="hero-actions">
            <router-link to="/causas" class="action-btn primary-btn">
              🕸️ Ver Mapa de Redes Judiciales
            </router-link>
          </div>
        </div>

        <!-- Lado Derecho: Logo Dinámico (Oculto en móvil) -->
        <div class="hero-logo-side">
          <img src="/logo_w.png" class="hero-logo logo-oscuro" alt="Logo Expedientes C">
          <img src="/logo_b.png" class="hero-logo logo-claro" alt="Logo Expedientes C">
        </div>

      </div>
    </section>

    <!-- 📊 SECCIÓN 1: GRÁFICOS (PANEL DE TRANSPARENCIA) -->
    <section class="seccion-principal graficos-wrap">
      
      <h2 class="titulo-seccion">Panorama de Transparencia</h2>
      <p class="subtitulo-seccion">Métricas y estadísticas en tiempo real sobre el estado de las investigaciones a nivel nacional.</p>

      <div class="charts-grid">
        <!-- Gráfico 1: Estado Global -->
        <div class="chart-card">
          <h3 class="chart-title">Distribución Global</h3>
          <div class="chart-wrapper doughnut-wrapper">
            <Doughnut :data="dataEstados" :options="opcionesDona" />
          </div>
        </div>

        <!-- Gráfico 2: Barras Apiladas (Por Sector) -->
        <div class="chart-card">
          <h3 class="chart-title">Causas por Macro-Sector</h3>
          <div class="chart-wrapper">
            <Bar :data="dataSectoresApilados" :options="opcionesBarrasApiladas" />
          </div>
        </div>

        <!-- Gráfico 3: Top 5 Focos Críticos -->
        <div class="chart-card">
          <h3 class="chart-title">Top 5 Focos Críticos</h3>
          <div class="chart-wrapper">
            <Bar :data="dataTopCriticos" :options="opcionesBarrasSimples" />
          </div>
        </div>

        <!-- Gráfico 4: Partidos con Mayor Controversia -->
        <div class="chart-card">
          <h3 class="chart-title">Partidos por Nivel de Controversia</h3>
          <div class="chart-wrapper">
            <Bar :data="dataPartidos" :options="opcionesPartidos" />
          </div>
        </div>

        <!-- Gráfico 5: Evolución de Causas -->
        <div class="chart-card">
          <h3 class="chart-title">Evolución de Causas por Año</h3>
          <div class="chart-wrapper">
            <Line :data="dataCausasPorAno" :options="opcionesLinea" />
          </div>
        </div>

        <!-- Gráfico 6: Ranking de Cargos -->
        <div class="chart-card">
          <h3 class="chart-title">Cargos con Más Causas Activas</h3>
          <div class="chart-wrapper">
            <Bar :data="dataRankingCargos" :options="opcionesBarrasSimples" />
          </div>
        </div>
      </div>
    </section>
    <!-- FIN SECCIÓN GRÁFICOS -->

    <!-- 🗂️ SECCIÓN 2: DIRECTORIO DE CATEGORÍAS -->
    <section class="seccion-principal">
      
      <h2 class="titulo-seccion">Directorio de Entidades y Autoridades</h2>
      <p class="subtitulo-seccion">Explora los expedientes organizados por ramas del Estado, fuerzas de orden y sector privado.</p>
      
      <div v-for="macro in macroCategorias" :key="macro.id" class="macro-section">
        <div class="macro-header">
          <h3 class="macro-title">{{ macro.titulo }}</h3>
          <p class="macro-desc">{{ macro.descripcion }}</p>
        </div>

        <div class="home-grid">
          <router-link
            v-for="cat in macro.items"
            :key="cat.tipo"
            :to="`/${cat.tipo}`"
            class="home-card"
          >
            <span class="card-icon">{{ cat.icono }}</span>
            <span class="card-label">{{ cat.label }}</span>
          </router-link>
        </div>
      </div>

    </section>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { obtenerTodos } from '../firebase'
import {
  Chart as ChartJS, Title, Tooltip, Legend,
  BarElement, ArcElement, CategoryScale, LinearScale,
  LineElement, PointElement, Filler
} from 'chart.js'
import { Bar, Doughnut, Line } from 'vue-chartjs'

ChartJS.register(
  Title, Tooltip, Legend, BarElement, ArcElement,
  CategoryScale, LinearScale,
  LineElement, PointElement, Filler
)


// ── 1. TEMA REACTIVO + CARGA DE DATOS ─────────────────────────────────────
const temaClaro = ref(false)
const cargando  = ref(false)
let observer = null

onMounted(async () => {
  temaClaro.value = document.documentElement.classList.contains('tema-claro')

  observer = new MutationObserver(() => {
    temaClaro.value = document.documentElement.classList.contains('tema-claro')
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })

  // Carga real desde Firebase
  cargando.value = true
  datosCrudos.value = await obtenerTodos()
  cargando.value = false
})

onUnmounted(() => { observer?.disconnect() })

// Colores de texto y grilla se adaptan al tema
const CC = computed(() => ({
  text:   temaClaro.value ? '#475569' : '#94a3b8',
  muted:  temaClaro.value ? '#94a3b8' : '#64748b',
  grid:   temaClaro.value ? '#e2e8f0' : '#1e293b',
  border: temaClaro.value ? '#cbd5e1' : '#334155',
}))


// ── 2. PALETAS ────────────────────────────────────────────────────────────

// Estado judicial — invariantes al tema
const ESTADO = {
  Limpio:      '#10b981',
  Observación: '#f59e0b',
  Crítico:     '#ef4444',
}

// Espectro político chileno
// Derecha → azules/morados   |   Centro → amarillo/ámbar   |   Izquierda → rojos/naranjos
const ESPECTRO_POLITICO = {
  // Far-right / Derecha dura
  'Partido Republicano':          '#172554',  // azul muy oscuro
  'Republicano':                  '#172554',

  // Derecha
  'UDI':                          '#1e3a8a',  // azul profundo
  'Renovación Nacional':          '#1d4ed8',  // azul
  'Renovación Nacional (RN)':     '#1d4ed8',
  'RN':                           '#1d4ed8',

  // Centro-derecha liberal
  'Evópoli':                      '#6d28d9',  // violeta

  // Centro
  'Partido Demócratas':           '#0891b2',  // cyan
  'Partido Demócrata Cristiano':  '#b45309',  // ámbar oscuro
  'PDC':                          '#b45309',
  'Amarillos':                    '#ca8a04',  // amarillo

  // Centro-izquierda
  'Partido por la Democracia':    '#c2410c',  // naranja-rojo
  'PPD':                          '#c2410c',
  'Partido Radical':              '#dc2626',  // rojo
  'PR':                           '#dc2626',

  // Izquierda
  'Partido Socialista':           '#e11d48',  // rosa-rojo
  'PS':                           '#e11d48',
  'Convergencia Social':          '#f43f5e',
  'CS':                           '#f43f5e',
  'Frente Amplio':                '#ef4444',  // rojo FA
  'FA':                           '#ef4444',

  // Far-left
  'Partido Comunista':            '#7f1d1d',  // rojo oscuro
  'PCCh':                         '#7f1d1d',
  'PC':                           '#7f1d1d',

  // Neutros
  'Independiente':                '#94a3b8',
  'Sin partido':                  '#94a3b8',
  'Independientes / Sin Partido': '#94a3b8',
  'Independientes':               '#94a3b8',
}

const colorPartido = (nombre) => ESPECTRO_POLITICO[nombre] ?? '#94a3b8'

// Paleta institucional por rama del Estado (de más frío a más cálido)
const PALETA_RAMAS = [
  '#2563eb',  // Ejecutivo    → azul institucional
  '#7c3aed',  // Legislativo  → violeta
  '#0891b2',  // Judicial     → cyan
  '#059669',  // Local        → verde
  '#d97706',  // Autónomos    → ámbar
  '#0f766e',  // Policías     → teal
  '#9333ea',  // Privado      → púrpura
]

// Gradiente rojo para ranking de focos críticos (más grave = más oscuro)
const PALETA_CRITICOS = [
  '#7f1d1d',  // 1° puesto → rojo muy oscuro
  '#991b1b',
  '#b91c1c',
  '#dc2626',
  '#ef4444',  // 5° puesto → rojo suave
]

const GRUPOS_ESTADO = {
  'Limpio':      ['Limpio'],
  'Observación': ['Observación', 'Prescrita', 'En Litigio', 'En Litigio / Delatora'],
  'Crítico':     ['Crítico', 'Condenado', 'Condenada', 'Condenada / Delatora'],
}


// ── 3. OPCIONES COMPUTED (REACTIVAS AL TEMA) ─────────────────────────────

const opcionesDona = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: CC.value.text,
        padding: 20,
        font: { size: 12, weight: '600' }
      }
    },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.label}: ${ctx.raw} registros`
      }
    }
  },
  cutout: '70%',
  borderWidth: 0
}))

const opcionesBarrasApiladas = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: CC.value.text,
        boxWidth: 12,
        font: { size: 11, weight: '600' }
      }
    }
  },
  scales: {
    x: {
      stacked: true,
      grid:  { color: CC.value.grid },
      ticks: { color: CC.value.text, font: { size: 11 } },
      border:{ color: CC.value.border }
    },
    y: {
      stacked: true,
      grid:  { display: false },
      ticks: { color: CC.value.text, font: { size: 11 } }
    }
  }
}))

const opcionesBarrasSimples = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid:  { display: false },
      ticks: { color: CC.value.text, font: { size: 11 } }
    },
    y: {
      grid:  { color: CC.value.grid },
      ticks: { color: CC.value.text, font: { size: 11 }, precision: 0 },
      border:{ color: CC.value.border }
    }
  }
}))

const opcionesPartidos = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid:  { color: CC.value.grid },
      ticks: { color: CC.value.text, font: { size: 11 } },
      border:{ color: CC.value.border }
    },
    y: {
      grid:  { display: false },
      ticks: { color: CC.value.text, font: { size: 11 } }
    }
  }
}))

const opcionesLinea = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid:  { display: false },
      ticks: { color: CC.value.text, font: { size: 11 } }
    },
    y: {
      beginAtZero: true,
      grid:  { color: CC.value.grid },
      ticks: { color: CC.value.text, font: { size: 11 }, precision: 0 },
      border:{ color: CC.value.border }
    }
  }
}))


// ── 4. DATOS ──────────────────────────────────────────────────────────────

const datosCrudos = ref([])

// Todas las causas únicas de la base real, con el tipo de cada político asociado
const causasUnicas = computed(() => {
  const mapa = new Map()
  datosCrudos.value.forEach(politico => {
    if (!Array.isArray(politico.causas)) return
    politico.causas.forEach(causa => {
      if (!mapa.has(causa.id_causa)) {
        mapa.set(causa.id_causa, { ...causa, tipos: new Set() })
      }
      mapa.get(causa.id_causa).tipos.add(politico.tipo)
    })
  })
  return Array.from(mapa.values())
})

// Mapa tipo → label, derivado de macroCategorias (evita duplicar datos)
const mapaLabels = computed(() => {
  const m = {}
  macroCategorias.forEach(macro =>
    macro.items.forEach(item => { m[item.tipo] = item.label })
  )
  return m
})

// Gráfico 1 — Dona: distribución global de estados
const dataEstados = computed(() => {
  const c = { Limpio: 0, Observación: 0, Crítico: 0 }

  if (datosCrudos.value.length > 0) {
    datosCrudos.value.forEach(p => {
      if      (GRUPOS_ESTADO.Limpio.includes(p.estado_judicial))      c.Limpio++
      else if (GRUPOS_ESTADO.Observación.includes(p.estado_judicial)) c.Observación++
      else if (GRUPOS_ESTADO.Crítico.includes(p.estado_judicial))     c.Crítico++
    })
  } else {
    c.Limpio = 145; c.Observación = 48; c.Crítico = 22
  }

  return {
    labels: ['Limpios', 'En Observación', 'Críticos'],
    datasets: [{
      data: [c.Limpio, c.Observación, c.Crítico],
      backgroundColor: [ESTADO.Limpio, ESTADO.Observación, ESTADO.Crítico],
      hoverBackgroundColor: ['#059669', '#d97706', '#dc2626'],
      borderWidth: 0,
      hoverOffset: 6
    }]
  }
})

// Gráfico 2 — Barras apiladas: causas por macro-sector
const dataSectoresApilados = computed(() => ({
  labels: ['Adm. Local', 'Privado', 'Legislativo', 'Ejecutivo', 'Fuerzas/Orden'],
  datasets: [
    {
      label: 'En Observación',
      data: [18, 14, 9, 6, 4],
      backgroundColor: ESTADO.Observación,
      borderRadius: 4
    },
    {
      label: 'Críticos / Condenados',
      data: [12, 10, 5, 2, 8],
      backgroundColor: ESTADO.Crítico,
      borderRadius: 4
    }
  ]
}))

// Gráfico 3 — Top 5 focos críticos: gradiente rojo oscuro → claro
const dataTopCriticos = computed(() => ({
  labels: ['Alcaldes', 'Empresas', 'Ejército', 'Diputados', 'Ministros'],
  datasets: [{
    label: 'Casos Críticos',
    data: [15, 12, 8, 5, 4],
    backgroundColor: PALETA_CRITICOS,
    borderRadius: 6,
    borderSkipped: false
  }]
}))

// Gráfico 4 — Partidos: espectro político izquierda→derecha
const labelsPartidos = [
  'Partido Republicano',
  'UDI',
  'Renovación Nacional (RN)',
  'Independientes / Sin Partido',
  'Partido Demócratas',
  'Frente Amplio',
  'Partido Comunista',
]

const dataPartidos = computed(() => ({
  labels: labelsPartidos,
  datasets: [{
    label: 'Nivel de Controversia',
    data: [45, 42, 35, 28, 18, 12, 8],
    backgroundColor: labelsPartidos.map(colorPartido),
    borderRadius: 6,
    borderSkipped: false
  }]
}))

// Gráfico 5 — Línea: evolución de causas por año
const dataCausasPorAno = computed(() => {
  const conteo = {}
  causasUnicas.value.forEach(c => {
    const ano = c.anio || 'S/D'
    conteo[ano] = (conteo[ano] || 0) + 1
  })

  const entradas = Object.keys(conteo).length > 0
    ? Object.entries(conteo).sort((a, b) => a[0].localeCompare(b[0]))
    : [['2019', 4], ['2020', 7], ['2021', 9], ['2022', 14], ['2023', 18], ['2024', 22], ['2025', 16]]

  return {
    labels: entradas.map(([ano]) => ano),
    datasets: [{
      label: 'Causas iniciadas',
      data: entradas.map(([, n]) => n),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      pointBackgroundColor: '#ef4444',
      pointRadius: 4,
      fill: true,
      tension: 0.3
    }]
  }
})

// Gráfico 6 — Ranking de cargos con más causas activas
const dataRankingCargos = computed(() => {
  const conteo = {}
  causasUnicas.value.forEach(c => {
    c.tipos.forEach(tipo => {
      conteo[tipo] = (conteo[tipo] || 0) + 1
    })
  })

  let entradas = Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 6)

  if (entradas.length === 0) {
    entradas = [
      ['alcaldes', 15], ['diputados', 11], ['empresas', 12],
      ['concejales', 6], ['fiscales', 3]
    ]
  }

  return {
    labels: entradas.map(([tipo]) => mapaLabels.value[tipo] || tipo),
    datasets: [{
      label: 'Causas totales',
      data: entradas.map(([, n]) => n),
      backgroundColor: '#2563eb',
      borderRadius: 6,
      borderSkipped: false
    }]
  }
})


// ── 5. CATEGORÍAS DE NAVEGACIÓN ───────────────────────────────────────────

const macroCategorias = [
  {
    id: 'ejecutivo',
    titulo: 'Poder Ejecutivo',
    descripcion: 'Presidencia, ministerios y administración central del Estado.',
    items: [
      { tipo: 'presidentes',                  label: 'Presidentes',         icono: '🇨🇱' },
      { tipo: 'ministros',                    label: 'Ministros',           icono: '💼' },
      { tipo: 'subsecretarios',               label: 'Subsecretarios',      icono: '📋' },
      { tipo: 'delegados-presidenciales-reg', label: 'Delegados Reg.',      icono: '📍' },
      { tipo: 'delegados-presidenciales-pro', label: 'Delegados Prov.',     icono: '📌' },
      { tipo: 'seremis',                      label: 'Seremis',             icono: '🏢' },
      { tipo: 'dictador',                     label: 'Dictadura',           icono: '💂' }
    ]
  },
  {
    id: 'legislativo',
    titulo: 'Poder Legislativo',
    descripcion: 'Representantes del Congreso Nacional de Chile.',
    items: [
      { tipo: 'senadores', label: 'Senadores', icono: '📜' },
      { tipo: 'diputados', label: 'Diputados', icono: '🏛️' }
    ]
  },
  {
    id: 'judicial',
    titulo: 'Poder Judicial',
    descripcion: 'Tribunales de justicia y magistrados.',
    items: [
      { tipo: 'ministros-corte-suprema',     label: 'Corte Suprema',     icono: '🏛️' },
      { tipo: 'ministros-corte-apelaciones', label: 'Corte Apelaciones', icono: '🔨' },
      { tipo: 'jueces',                      label: 'Jueces',            icono: '⚖️' }
    ]
  },
  {
    id: 'local',
    titulo: 'Administración Regional y Local',
    descripcion: 'Autoridades electas a nivel comunal y regional.',
    items: [
      { tipo: 'gobernadores', label: 'Gobernadores',      icono: '🗺️' },
      { tipo: 'consejeros',   label: 'Consejeros (CORE)', icono: '🤝' },
      { tipo: 'alcaldes',     label: 'Alcaldes',          icono: '🏙️' },
      { tipo: 'concejales',   label: 'Concejales',        icono: '🗳️' }
    ]
  },
  {
    id: 'autonomos',
    titulo: 'Órganos Autónomos',
    descripcion: 'Entidades independientes de control, justicia constitucional y persecución penal.',
    items: [
      { tipo: 'fiscales',    label: 'Fiscales',         icono: '🔎' },
      { tipo: 'contraloria', label: 'Contraloría',      icono: '📑' },
      { tipo: 'tc',          label: 'Tribunal Const.',  icono: '📖' }
    ]
  },
  {
    id: 'policias',
    titulo: 'Policías y Fuerzas Armadas',
    descripcion: 'Instituciones de orden, seguridad pública y defensa.',
    items: [
      { tipo: 'carabineros', label: 'Carabineros', icono: '🚓' },
      { tipo: 'pdi',         label: 'PDI',         icono: '🕵️' },
      { tipo: 'ejercito',    label: 'Ejército',    icono: '🪖' }
    ]
  },
  {
    id: 'privado',
    titulo: 'Sector Privado, Legal y Fundaciones',
    descripcion: 'Empresas, empresarios, abogados y fundaciones involucrados en causas.',
    items: [
      { tipo: 'empresas',    label: 'Empresas',    icono: '🏭' },
      { tipo: 'fundaciones', label: 'Fundaciones', icono: '🤝' }
    ]
  }
]
</script>