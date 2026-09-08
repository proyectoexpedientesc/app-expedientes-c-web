<template>
  <div class="detalle-container">

    <div v-if="cargando" class="feedback-state">
      <span class="loading-spinner"></span>
      <p>Cargando datos de la votación...</p>
    </div>

    <div v-else-if="!votacion" class="feedback-state">
      <p class="empty-icon">🔍</p>
      <p>No se encontró la votación solicitada.</p>
      <router-link to="/votaciones" class="back-btn">← Volver al listado</router-link>
    </div>

    <template v-else>
      <nav class="breadcrumb-nav">
        <router-link to="/">Inicio</router-link>
        <span class="sep">›</span>
        <router-link to="/votaciones">Votaciones</router-link>
        <span class="sep">›</span>
        <span>ID: {{ votacion.id_votacion }}</span>
      </nav>

      <router-link to="/votaciones" class="back-btn back-btn-votacion">← Volver al listado</router-link>

      <!-- Encabezado de Votación -->
      <div class="info-card info-card-full votacion-header">
        <h1 class="perfil-nombre">{{ votacion.titulo }}</h1>
        <p class="votacion-materia">{{ votacion.materia }}</p>

        <div class="perfil-badges">
          <span class="partido-tag">🏛️ {{ votacion.camara }}</span>
          <span class="partido-tag">📅 {{ votacion.fecha }} | {{ votacion.hora }}</span>
          <span class="partido-tag">🆔 ID: {{ votacion.id_votacion }}</span>
          <span class="estado-tag" :class="votacion.estado === 'Aprobado' ? 'estado-success' : 'estado-danger'">
            {{ votacion.estado }}
          </span>
        </div>
      </div>

      <!-- MARCADOR GIGANTE -->
      <div class="marcadores-wrap">
        <div class="marcador m-favor">
          <span class="m-valor">{{ votacion.totales?.a_favor ?? 0 }}</span>
          <span class="m-label">A FAVOR</span>
        </div>
        <div class="marcador m-contra">
          <span class="m-valor">{{ votacion.totales?.en_contra ?? 0 }}</span>
          <span class="m-label">EN CONTRA</span>
        </div>
        <div class="marcador m-abs">
          <span class="m-valor">{{ votacion.totales?.abstencion ?? 0 }}</span>
          <span class="m-label">ABSTENCIÓN</span>
        </div>
        <div class="marcador m-ausente">
          <span class="m-valor">{{ totalAusentes }}</span>
          <span class="m-label">AUSENTES</span>
        </div>
      </div>

      <!-- Leyenda de colores -->
      <div class="leyenda-votos">
        <span class="leyenda-item"><span class="leyenda-punto bg-a-favor">✓</span> A favor</span>
        <span class="leyenda-item"><span class="leyenda-punto bg-en-contra">✗</span> En contra</span>
        <span class="leyenda-item"><span class="leyenda-punto bg-abstencion">○</span> Abstención</span>
        <span class="leyenda-item"><span class="leyenda-punto bg-ausente">–</span> Ausente / Sin registro</span>
      </div>

      <!-- TABLERO TIPO TV -->
      <p class="tablero-titulo">Voto por político ({{ listaVotos.length }})</p>
      <div class="tablero-grilla">
        <router-link
          v-for="voto in listaVotos"
          :key="voto.id"
          :to="`/detalle/${voto.tipo_cargo}/${voto.id}`"
          class="voto-item"
          :class="claseVoto(voto.tipo_voto)"
        >
          <!-- El span siempre se renderiza para mantener la estructura Flexbox -->
          <span class="voto-icono">{{ iconoVoto(voto.tipo_voto) }}</span>
          <span class="voto-nombre">{{ voto.nombre_display }}</span>
        </router-link>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { db, obtenerTodos } from '../firebase'

const props = defineProps(['id'])

const votacion = ref(null)
const politicos = ref([])
const cargando = ref(true)

// Prefijos de apellidos compuestos: si el apellido empieza con uno de estos,
// tomamos las DOS primeras palabras en vez de solo la primera
// (ej. "Del Real Mihovilovic" -> "Del Real", no solo "Del")
const PREFIJOS_APELLIDO = ['de', 'del', 'los', 'las', 'la', 'san', 'santa', 'von', 'van']

const primerApellido = (apellidos) => {
  if (!apellidos) return ''
  const partes = apellidos.trim().split(' ')
  if (partes.length > 1 && PREFIJOS_APELLIDO.includes(partes[0].toLowerCase())) {
    return `${partes[0]} ${partes[1]}`
  }
  return partes[0]
}

onMounted(async () => {
  window.scrollTo({ top: 0, behavior: 'instant' })

  try {
    politicos.value = await obtenerTodos()
    const docSnap = await getDoc(doc(db, 'votaciones', props.id))
    if (docSnap.exists()) {
      votacion.value = docSnap.data()
    }
  } catch (error) {
    console.error("Error:", error)
  }
  cargando.value = false
})

const listaVotos = computed(() => {
  if (!votacion.value || !votacion.value.votos) return []

  const lista = []
  
  // En lugar de recorrer la base de datos completa, iteramos SOLAMENTE 
  // sobre los IDs que tú declaraste explícitamente en el JSON de la votación.
  for (const [id_politico, tipo_voto] of Object.entries(votacion.value.votos)) {
    
    // Buscamos sus datos reales en la base para obtener el nombre
    const p = politicos.value.find(pol => pol.id_oficial === id_politico)
    
    const apellido1 = p?.apellidos ? primerApellido(p.apellidos) : ''
    const nombre1 = p?.nombre ? p.nombre.split(' ')[0] : ''

    lista.push({
      id: id_politico,
      // Si el político no está en la base por algún error, muestra el ID por defecto
      nombre_display: p ? `${apellido1} ${nombre1}` : id_politico,
      apellidos: p?.apellidos || id_politico, 
      tipo_cargo: p?.tipo || 'diputados',
      tipo_voto: tipo_voto
    })
  }

  // Orden alfabético estricto para calzar con la gráfica
  return lista.sort((a, b) => a.apellidos.localeCompare(b.apellidos))
})

// Cantidad de ausentes / sin registro de voto (no viene en votacion.totales,
// se calcula desde la lista real de votos)
const totalAusentes = computed(() =>
  listaVotos.value.filter(v => v.tipo_voto === 'ausente').length
)

const claseVoto = (tipo) => {
  const clases = { 'a_favor': 'bg-a-favor', 'en_contra': 'bg-en-contra', 'abstencion': 'bg-abstencion' }
  return clases[tipo] || 'bg-ausente'
}

const iconoVoto = (tipo) => {
  const iconos = { 'a_favor': '✓', 'en_contra': 'X', 'abstencion': 'O' }
  return iconos[tipo] || '' 
}
</script>