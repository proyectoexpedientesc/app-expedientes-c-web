<template>
  <div class="home-container">

    <section class="home-hero">
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
    </section>

    <!-- 📊 SECCIÓN DE GRÁFICOS (PANEL DE TRANSPARENCIA) -->
    <section class="home-charts">
      <div class="macro-header">
        <h2 class="macro-title">Panel de Transparencia</h2>
        <p class="macro-desc">Métricas generales en tiempo real sobre causas y estados judiciales.</p>
      </div>

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
      </div>
    </section>
    <!-- FIN SECCIÓN GRÁFICOS -->

    <section class="home-categories">
      
      <div v-for="macro in macroCategorias" :key="macro.id" class="macro-section">
        <div class="macro-header">
          <h2 class="macro-title">{{ macro.titulo }}</h2>
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
import { ref, computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'

// Registro de componentes de Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale)

// --------------------------------------------------------
// 1. DICCIONARIOS Y CONSTANTES
// --------------------------------------------------------
const GRUPOS_ESTADO = {
  'Limpio':      ['Limpio'],
  'Observación': ['Observación', 'Prescrita', 'En Litigio', 'En Litigio / Delatora'],
  'Crítico':     ['Crítico', 'Condenado', 'Condenada', 'Condenada / Delatora'],
}

const CARGOS_POR_TIPO = {
  'diputados':                    ['Diputado', 'Diputada', 'Ex Diputado', 'Ex Diputada'],
  'dictador':                     ['Dictador', 'Dictadora'],
  'senadores':                    ['Senador', 'Senadora', 'Ex Senador', 'Ex Senadora'],
  'presidentes':                  ['Presidente', 'Presidenta', 'Ex Presidente', 'Ex Presidenta'],
  'ministros':                    ['Ministro', 'Ministra', 'Ex Ministro', 'Ex Ministra'],
  'subsecretarios':               ['Subsecretario', 'Subsecretaria', 'Ex Subsecretario', 'Ex Subsecretaria'],
  'seremis':                      ['Seremis', 'seremis', 'Seremi', 'seremi', 'SEREMI', 'Ex Seremi', 'Ex seremi', 'Ex SEREMI', 'Ex Seremi de Vivienda y Urbanismo', 'Ex Seremi (Designado, nunca asumió)'],
  'gobernadores':                 ['Gobernador', 'Gobernadora', 'Ex Gobernador', 'Ex Gobernadora'],
  'alcaldes':                     ['Alcalde', 'Alcaldesa', 'Ex Alcalde', 'Ex Alcaldesa'],
  'delegados-presidenciales-reg': ['Delegado Presidencial Regional', 'Delegada Presidencial Regional'],
  'delegados-presidenciales-pro': ['Delegado Presidencial Provincial', 'Delegada Presidencial Provincial'],
  'concejales':                   ['Concejal', 'Concejala', 'Ex Concejal', 'Ex Concejala'],
  'consejeros':                   ['Consejero', 'Consejera', 'Ex Consejero', 'Ex Consejera'],
  'jueces':                       ['Juez', 'Jueza', 'Ex Juez', 'Ex Jueza'],
  'ministros-corte-apelaciones':  ['Ministro de Corte de Apelaciones', 'Ministra de Corte de Apelaciones', 'Exministro de Corte de Apelaciones', 'Exministra de Corte de Apelaciones'],
  'ministros-corte-suprema':      ['Ministro de Corte Suprema', 'Ministra de Corte Suprema'],
  'fiscales':                     ['Fiscal Nacional', 'Fiscal Regional', 'Fiscal Adjunto'],
  'contraloria':                  ['Contralor General', 'Subcontralor', 'Auditor de Contraloría'],
  'tc':                           ['Ministro del TC', 'Ministra del TC', 'Presidente del TC'],
  'carabineros':                  ['General Director', 'Oficial de Carabineros', 'Funcionario de Carabineros'],
  'pdi':                          ['Director General', 'Prefecto', 'Detective'],
  'ejercito':                     ['Comandante en Jefe', 'Oficial de Ejército', 'Militar', 'Jefe de Inteligencia', 'Exjefe de Inteligencia', 'General', 'General (r)'],
  'empresas':                     ['Gerente', 'Directorio', 'Empresa', 'Empresario'],
  'fundaciones':                  ['Directiva', 'Representante Legal', 'Fundación'],
}

const COLORES = {
  Limpio: '#10b981',       // Verde esmeralda
  Observación: '#f59e0b',  // Ámbar/Naranja
  Crítico: '#ef4444'       // Rojo
}

const textColor = '#cbd5e1'
const gridColor = '#334155'

// --------------------------------------------------------
// 2. CONFIGURACIÓN VISUAL DE LOS GRÁFICOS (Dark Mode)
// --------------------------------------------------------
const opcionesDona = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { color: textColor, padding: 20 } },
    tooltip: { callbacks: { label: (context) => ` ${context.label}: ${context.raw} registros` } }
  },
  cutout: '70%',
  borderWidth: 0
}

const opcionesBarrasApiladas = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y', // Barras horizontales
  plugins: {
    legend: { position: 'top', labels: { color: textColor, boxWidth: 12 } }
  },
  scales: {
    x: { stacked: true, grid: { color: gridColor }, ticks: { color: textColor } },
    y: { stacked: true, grid: { display: false }, ticks: { color: textColor } }
  }
}

const opcionesBarrasSimples = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: textColor } },
    y: { grid: { color: gridColor }, ticks: { color: textColor, precision: 0 } }
  }
}

// --------------------------------------------------------
// 3. PROCESAMIENTO REACTIVO DE DATOS (COMPUTED)
// --------------------------------------------------------
// Nota: Aquí almacenarás los datos de Firebase cuando los conectes
const datosCrudos = ref([])

// Gráfico 1: Dona de Estados Globales
const dataEstados = computed(() => {
  // Si no hay datos (aún no conecta Firebase), mostramos datos simulados
  if (datosCrudos.value.length === 0) {
    return {
      labels: ['Limpios', 'En Observación', 'Críticos'],
      datasets: [{
        data: [145, 48, 22],
        backgroundColor: [COLORES.Limpio, COLORES.Observación, COLORES.Crítico],
        borderWidth: 0,
        hoverOffset: 4
      }]
    }
  }

  const conteo = { Limpio: 0, Observación: 0, Crítico: 0 }
  
  datosCrudos.value.forEach(item => {
    if (GRUPOS_ESTADO.Limpio.includes(item.estado_judicial)) conteo.Limpio++
    else if (GRUPOS_ESTADO.Observación.includes(item.estado_judicial)) conteo.Observación++
    else if (GRUPOS_ESTADO.Crítico.includes(item.estado_judicial)) conteo.Crítico++
  })

  return {
    labels: ['Limpios', 'En Observación', 'Críticos'],
    datasets: [{
      data: [conteo.Limpio, conteo.Observación, conteo.Crítico],
      backgroundColor: [COLORES.Limpio, COLORES.Observación, COLORES.Crítico],
      borderWidth: 0,
      hoverOffset: 4
    }]
  }
})

// Gráfico 2: Causas Apiladas por Macro-Sector
const dataSectoresApilados = computed(() => {
  if (datosCrudos.value.length === 0) {
    return {
      labels: ['Admin. Local', 'Sector Privado', 'Poder Legislativo', 'Poder Ejecutivo', 'Fuerzas/Orden'],
      datasets: [
        { label: 'En Observación', data: [18, 14, 9, 6, 4], backgroundColor: COLORES.Observación, borderRadius: 4 },
        { label: 'Críticos', data: [12, 10, 5, 2, 8], backgroundColor: COLORES.Crítico, borderRadius: 4 }
      ]
    }
  }

  // Lógica real para cuando Firebase esté conectado:
  // 1. Agrupar datosCrudos por "macroCategoria" identificando el tipo
  // 2. Contar "Observación" y "Crítico" para cada macroCategoria
  // 3. Retornar la estructura mapeada
  return { labels: [], datasets: [] } // Placeholder para lógica real
})

// Gráfico 3: Top 5 Tipos Específicos Críticos
const dataTopCriticos = computed(() => {
  if (datosCrudos.value.length === 0) {
    return {
      labels: ['Alcaldes', 'Empresas', 'Ejército', 'Diputados', 'Fundaciones'],
      datasets: [{
        label: 'Casos Críticos',
        data: [15, 12, 8, 5, 4],
        backgroundColor: COLORES.Crítico,
        borderRadius: 6
      }]
    }
  }

  // Lógica real: Filtrar solo Críticos, agrupar por `tipo`, ordenar y tomar los top 5
  return { labels: [], datasets: [] } // Placeholder para lógica real
})

// --------------------------------------------------------
// 4. CATEGORÍAS Y NAVEGACIÓN
// --------------------------------------------------------
const macroCategorias = [
  {
    id: 'ejecutivo',
    titulo: 'Poder Ejecutivo',
    descripcion: 'Presidencia, ministerios y administración central del Estado.',
    items: [
      { tipo: 'presidentes',                  label: 'Presidentes',            icono: '🇨🇱' },
      { tipo: 'ministros',                    label: 'Ministros',              icono: '💼' },
      { tipo: 'subsecretarios',               label: 'Subsecretarios',         icono: '📋' },
      { tipo: 'delegados-presidenciales-reg', label: 'Delegados Reg.',         icono: '📍' },
      { tipo: 'delegados-presidenciales-pro', label: 'Delegados Prov.',        icono: '📌' },
      { tipo: 'seremis',                      label: 'Seremis',                icono: '🏢' },
      { tipo: 'dictador',                     label: 'Dictadura',              icono: '💂' }
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
      { tipo: 'fiscales',      label: 'Fiscales',            icono: '🔎' },
      { tipo: 'contraloria',   label: 'Contraloría',         icono: '📑' },
      { tipo: 'tc',            label: 'Tribunal Const.',     icono: '📖' }
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
    titulo: 'Sector Privado y Fundaciones',
    descripcion: 'Empresas, fundaciones y ejecutivos involucrados en causas judiciales.',
    items: [
      { tipo: 'empresas',    label: 'Empresas',    icono: '🏭' },
      { tipo: 'fundaciones', label: 'Fundaciones', icono: '🤝' }
    ]
  }
]
</script>
