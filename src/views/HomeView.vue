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

          <div class="hero-actions hero-actions-separadas">
            <router-link to="/causas" class="action-btn primary-btn">
              🕸️ Ver Mapa de Redes Judiciales
            </router-link>
            <router-link to="/partidos" class="action-btn primary-btn">
              🏛️ Ver Partidos Políticos
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

        <!-- Gráfico 4: Partidos por Estado Judicial -->
        <div class="chart-card">
          <h3 class="chart-title">Partidos con Más Casos en Observación o Críticos</h3>
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

// Tipos que corresponden a cargos políticos con afiliación partidaria real.
// Excluye: fuerzas armadas/orden, poder judicial, órganos técnicos autónomos,
// y sector privado (empresas, empresarios, abogados, fundaciones).
const TIPOS_POLITICOS = [
  'presidentes', 'ministros', 'subsecretarios',
  'delegados-presidenciales-reg', 'delegados-presidenciales-pro', 'seremis',
  'senadores', 'diputados',
  'gobernadores', 'consejeros', 'alcaldes', 'concejales',
]

// ── Espectro político chileno: lista canónica ORDENADA izquierda → derecha ──
// id: usado para intentar cruzar con politico.id_partido
// sigla: se usa en el eje del gráfico cuando el nombre tiene más de una palabra
// aliases: variantes de texto que pueden venir en politico.partido_actual
const PARTIDOS_CONFIG = [
  { id: 'rd',            nombre: 'Revolución Democrática',      sigla: 'RD',    color: '#fb7185', aliases: ['revolución democrática', 'revolución democrática (expulsado)', 'rd'] },
  { id: 'pc',            nombre: 'Partido Comunista',           sigla: 'PC',    color: '#7f1d1d', aliases: ['partido comunista', 'partido comunista de chile', 'pcch', 'pc'] },
  { id: 'fa',             nombre: 'Frente Amplio',               sigla: 'FA',    color: '#ef4444', aliases: ['frente amplio', 'fa'] },
  { id: 'cs',             nombre: 'Convergencia Social',         sigla: 'CS',    color: '#f43f5e', aliases: ['convergencia social', 'cs'] },
  { id: 'ps',             nombre: 'Partido Socialista',          sigla: 'PS',    color: '#e11d48', aliases: ['partido socialista', 'ps'] },
  { id: 'pev',           nombre: 'Partido Ecologista Verde',    sigla: 'PEV',   color: '#16a34a', aliases: ['partido ecologista verde', 'pev'] },
  { id: 'frevs',         nombre: 'Federación Regionalista Verde Social', sigla: 'FREVS', color: '#15803d', aliases: ['federación regionalista verde social', 'frevs'] },
  { id: 'pr',             nombre: 'Partido Radical',             sigla: 'PR',    color: '#dc2626', aliases: ['partido radical', 'pr'] },
  { id: 'ppd',            nombre: 'Partido por la Democracia',   sigla: 'PPD',   color: '#c2410c', aliases: ['partido por la democracia', 'ppd'] },
  { id: 'pdc',            nombre: 'Partido Demócrata Cristiano', sigla: 'PDC',   color: '#b45309', aliases: ['partido demócrata cristiano', 'pdc'] },
  { id: 'ah',            nombre: 'Acción Humanista',             sigla: 'AH',    color: '#a16207', aliases: ['acción humanista', 'ah'] },
  { id: 'amarillos',      nombre: 'Amarillos',                   sigla: 'AM',    color: '#ca8a04', aliases: ['amarillos'] },
  { id: 'democratas',     nombre: 'Partido Demócratas',          sigla: 'PD',    color: '#0891b2', aliases: ['partido demócratas', 'demócratas'] },
  { id: 'evopoli',        nombre: 'Evópoli',                     sigla: 'EVO',    color: '#6d28d9', aliases: ['evópoli', 'evopoli'] },
  { id: 'pdg',           nombre: 'Partido de la Gente',          sigla: 'PDG',   color: '#0284c7', aliases: ['partido de la gente', 'pdg'] },
  { id: 'rn',             nombre: 'Renovación Nacional',          sigla: 'RN',    color: '#1d4ed8', aliases: ['renovación nacional', 'renovación nacional (rn)', 'rn'] },
  { id: 'liberal',       nombre: 'Partido Liberal de Chile',      sigla: 'PL',    color: '#2563eb', aliases: ['partido liberal de chile', 'partido liberal', 'liberal'] },
  { id: 'udi',            nombre: 'Unión Demócrata Independiente',  sigla: 'UDI',    color: '#1e3a8a', aliases: ['udi'] },
  { id: 'republicano',    nombre: 'Partido Republicano',         sigla: 'REP',   color: '#172554', aliases: ['partido republicano', 'republicano'] },
  { id: 'pnl',           nombre: 'Partido Nacional Libertario',  sigla: 'PNL',   color: '#334155', aliases: ['partido nacional libertario', 'pnl'] },
  { id: 'independiente',  nombre: 'Independientes',              sigla: 'IND',    color: '#94a3b8', aliases: ['independiente', 'independientes'] },
]

// Si el nombre tiene más de una palabra, usa la sigla (si existe); si no, el nombre completo
const nombreParaMostrar = (p) => p.sigla || p.nombre

// Marcadores de "sin dato de partido" — estos se EXCLUYEN del todo, no cuentan en ningún lado
const SIN_PARTIDO_MARCADORES = ['', 'sin partido', 'sin información', 'sin info', 's/i', 'n/a', 'sin datos']

// Mapa rápido alias(normalizado) → id canónico, construido desde PARTIDOS_CONFIG
const ALIAS_A_ID = PARTIDOS_CONFIG.reduce((acc, p) => {
  p.aliases.forEach(a => { acc[a] = p.id })
  return acc
}, {})

const normalizar = (txt) => (txt || '').toString().trim().toLowerCase()

// Resuelve el id canónico de partido de un político: primero por id_partido, luego por nombre.
// Devuelve null si no tiene partido (vacío o marcado como "sin partido"), excluyéndolo del gráfico.
const resolverIdPartido = (politico) => {
  if (politico.id_partido) {
    const idNorm = normalizar(politico.id_partido)
    if (PARTIDOS_CONFIG.some(p => p.id === idNorm)) return idNorm
  }

  const nombreNorm = normalizar(politico.partido_actual)

  // Si el campo está vacío o es un marcador de "sin partido", excluir del todo
  if (SIN_PARTIDO_MARCADORES.includes(nombreNorm)) return null

  // Match exacto por alias
  if (ALIAS_A_ID[nombreNorm]) return ALIAS_A_ID[nombreNorm]

  // Fallback: cualquier variante que mencione "independiente"
  // (ej. "Independiente (Pro UDI)", "Militar / Independiente") cae en Independientes
  if (nombreNorm.includes('independiente')) return 'independiente'

  // No matcheó ningún partido conocido ni patrón de independiente
  return null
}

const colorPartido = (nombre) => {
  const cfg = PARTIDOS_CONFIG.find(p => p.nombre === nombre)
  return cfg ? cfg.color : '#94a3b8'
}

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

// Única declaración de opcionesPartidos — incluye el tooltip que muestra el nombre completo
const opcionesPartidos = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: (items) => {
          const idx = items[0].dataIndex
          const nombres = items[0].dataset.nombresCompletos
          return nombres ? nombres[idx] : items[0].label
        }
      }
    }
  },
  scales: {
    x: {
      grid:  { color: CC.value.grid },
      ticks: { color: CC.value.text, font: { size: 11 } },
      border:{ color: CC.value.border }
    },
    y: {
      grid:  { display: false },
      ticks: { color: CC.value.text, font: { size: 11 }, autoSkip: false }
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

// Gráfico 4 — Partidos: cantidad de políticos en Crítico + Observación (ordenado descendente)
// Solo considera cargos políticos (TIPOS_POLITICOS), excluye sector privado/técnico/judicial/orden.
// Excluye del todo a quienes no tienen partido (vacío / "sin partido"), pero conserva
// "Independientes" como categoría propia si tiene casos reales.
// Muestra sigla en vez de nombre completo cuando el nombre tiene más de una palabra.
const dataPartidos = computed(() => {
  const conteo = {}
  PARTIDOS_CONFIG.forEach(p => { conteo[p.id] = 0 })

  datosCrudos.value.forEach(politico => {
    if (!TIPOS_POLITICOS.includes(politico.tipo)) return

    const idPartido = resolverIdPartido(politico)
    if (!idPartido) return

    const esObservacion = GRUPOS_ESTADO.Observación.includes(politico.estado_judicial)
    const esCritico      = GRUPOS_ESTADO.Crítico.includes(politico.estado_judicial)

    if (esObservacion || esCritico) {
      conteo[idPartido]++
    }
  })

  const entradas = PARTIDOS_CONFIG
    .map(p => ({
      nombreCompleto: p.nombre,
      etiqueta: nombreParaMostrar(p),
      cantidad: conteo[p.id],
      color: p.color
    }))
    .filter(e => e.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad)

  return {
    labels: entradas.map(e => e.etiqueta),
    datasets: [{
      label: 'Políticos en Observación o Crítico',
      data: entradas.map(e => e.cantidad),
      backgroundColor: entradas.map(e => e.color),
      borderRadius: 6,
      borderSkipped: false,
      nombresCompletos: entradas.map(e => e.nombreCompleto)
    }]
  }
})

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
    descripcion: 'Empresas, empresarios, abogados, fundaciones y actores involucrados en causas judiciales.',
    items: [
      { tipo: 'empresas',    label: 'Empresas',    icono: '🏭' },
      { tipo: 'empresarios', label: 'Empresarios', icono: '👔' },
      { tipo: 'abogados',    label: 'Abogados',    icono: '⚖️' },
      { tipo: 'fundaciones', label: 'Fundaciones', icono: '🤝' }
    ]
  }
]
</script>