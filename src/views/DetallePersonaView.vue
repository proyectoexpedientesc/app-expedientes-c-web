<template>
  <div class="detalle-container">

    <div v-if="cargando" class="feedback-state">
      <span class="loading-spinner"></span>
      <p>Cargando expediente...</p>
    </div>

    <div v-else-if="!persona" class="feedback-state">
      <p class="empty-icon">🔍</p>
      <p>No se encontró el registro solicitado.</p>
      <router-link :to="`/${tipo}`" class="back-btn">← Volver</router-link>
    </div>

    <template v-else>

      <nav class="breadcrumb-nav">
        <router-link to="/">Inicio</router-link>
        <span class="sep">›</span>
        <router-link :to="`/${tipo}`">{{ tipoLabel }}</router-link>
        <span class="sep">›</span>
        <span>{{ persona.nombre }} {{ persona.apellidos }}</span>
      </nav>

      <router-link :to="`/${tipo}`" class="back-btn">← Volver al listado</router-link>

      <div class="perfil-card">
        <div class="perfil-avatar">
          <img
            v-if="getFoto(persona, tipo) && !fotoError"
            :src="getFoto(persona, tipo)"
            :alt="`${persona.nombre} ${persona.apellidos}`"
            class="perfil-foto"
            @error="fotoError = true"
          />
          <span v-else class="perfil-iniciales">{{ initials }}</span>
        </div>

        <div class="perfil-info">
          <!--<div class="perfil-tipo">{{ tipoLabel }}</div>-->
          <h1 class="perfil-nombre">{{ persona.nombre }} {{ persona.apellidos }}</h1>
          <p class="perfil-cargo">{{ persona.cargo }}</p>
          <div class="perfil-badges">
            <span class="estado-tag" :class="getEstadoClass(persona.estado_judicial)">
              {{ persona.estado_judicial }}
            </span>
            <span v-if="persona.partido_actual" class="partido-tag">
              {{ persona.partido_actual }}
            </span>
          </div>
        </div>
      </div>

      <div class="info-grid">

        <div class="info-card">
          <h2 class="card-titulo">Datos Generales</h2>
          <dl class="info-lista">
            <div class="info-row">
              <dt>Nombre / Razón Social</dt>
              <dd>{{ persona.nombre }} {{ persona.apellidos }}</dd>
            </div>
            <div class="info-row">
              <dt>RUT / ID</dt>
              <dd>{{ persona.id_oficial || '—' }}</dd>
            </div>
            <div class="info-row">
              <dt>Nacimiento / Creación</dt>
              <dd>{{ persona.fecha_nacimiento || '—' }}</dd>
            </div>
            <div class="info-row">
              <dt>Región</dt>
              <dd>{{ persona.region || '—' }}</dd>
            </div>
            <div class="info-row">
              <dt>Filiación / Relación</dt>
              <dd>{{ persona.partido_actual || '—' }}</dd>
            </div>
          </dl>
        </div>

        <div class="info-card">
          <h2 class="card-titulo">Estado Judicial</h2>
          <dl class="info-lista">
            <div class="info-row">
              <dt>Estado</dt>
              <dd>
                <span class="estado-tag" :class="getEstadoClass(persona.estado_judicial)">
                  {{ persona.estado_judicial }}
                </span>
              </dd>
            </div>
            <div class="info-row">
              <dt>Última actualización</dt>
              <dd>{{ persona.ultima_actualizacion || '—' }}</dd>
            </div>
          </dl>
        </div>

      </div>

      <div v-if="persona.causas && persona.causas.length > 0" class="info-card info-card-full">
        <h2 class="card-titulo">Causas e Investigaciones Asociadas</h2>
        <div class="causas-grid">
          <div v-for="causa in persona.causas" :key="causa.id_causa" class="causa-item">
            <div class="causa-cabecera">
              <h3>
                <router-link :to="`/causas?id=${causa.id_causa}`" class="ver-red-btn">
                  {{ causa.titulo }}
                </router-link>
              </h3>
              <span class="causa-ano" v-if="causa.anio">Año: {{ causa.anio }}</span>
            </div>
            
            <p class="causa-detalle">{{ causa.detalle }}</p>
            
            <!-- BLOQUE DE METADATOS REESTRUCTURADO -->
            <div class="causa-metadatos">
              <p class="causa-fecha" v-if="causa.fecha_delito">
                <strong>Fecha del suceso estimado:</strong> <span>{{ causa.fecha_delito }}</span>
              </p>
              <p class="causa-fecha" v-if="causa.fecha_resolucion">
                <strong>Resolución del tribunal:</strong> <span>{{ causa.fecha_resolucion }}</span>
              </p>
              <p class="causa-fecha" v-if="causa.estado_del_caso">
                <strong>Estado del caso:</strong> <span>{{ causa.estado_del_caso }}</span>
              </p>
            </div>

            <!-- BLOQUE DE SENTENCIA REESTRUCTURADO -->
            <div class="causa-sentencia-bloque" v-if="causa.resolucion">
              <p class="causa-fecha"><strong>Sentencia / Conclusión:</strong></p>
              <p class="causa-sentencia">{{ causa.resolucion }}</p>
            </div>

          </div>
        </div>
      </div>

      <div v-if="persona.observaciones" class="info-card info-card-full">
        <h2 class="card-titulo">Observaciones</h2>
        <p class="observaciones-texto">{{ persona.observaciones }}</p>
      </div>

      <div v-if="persona.fuentes?.length" class="info-card info-card-full">
        <h2 class="card-titulo">Fuentes</h2>
        <ul class="fuentes-lista">
          <li v-for="(fuente, i) in persona.fuentes" :key="i">
            <a :href="fuente" target="_blank" rel="noopener noreferrer">{{ fuente }}</a>
          </li>
        </ul>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { obtenerTodos } from '../firebase'
import { getFoto } from '../utils/fotos'

const props = defineProps(['tipo', 'id'])

const persona   = ref(null)
const fotoError = ref(false)
const cargando  = ref(true)

const LABELS = {
  'diputados':                    'Diputados',
  'senadores':                    'Senadores',
  'presidentes':                  'Presidentes',
  'ministros':                    'Ministros',
  'subsecretarios':               'Subsecretarios',
  'seremis':                      'Seremis',
  'gobernadores':                 'Gobernadores',
  'delegados-presidenciales-reg': 'Delegados Regionales',
  'delegados-presidenciales-pro': 'Delegados Provinciales',
  'alcaldes':                     'Alcaldes',
  'concejales':                   'Concejales',
  'consejeros':                   'Consejeros',
  'jueces':                       'Jueces',
  'ministros-corte-apelaciones':  'Corte de Apelaciones',
  'ministros-corte-suprema':      'Corte Suprema',
  'carabineros':                  'Carabineros',
  'pdi':                          'PDI',
  'ejercito':                     'Ejército',
  'empresas':                     'Empresas',
  'fundaciones':                  'Fundaciones',
  'dictador':                     'Dictador',
  'fiscales':                     'Fiscales',
  'contraloria':                  'Contraloría',
  'tc':                           'Tribunal Constitucional',
}

const tipoLabel = computed(() => LABELS[props.tipo] ?? props.tipo)

const initials = computed(() => {
  if (!persona.value) return '?'
  const n = persona.value.nombre?.[0] ?? ''
  const a = persona.value.apellidos?.[0] ?? ''
  return (n + a).toUpperCase()
})

watch(persona, () => { fotoError.value = false })

onMounted(async () => {
  // Scroll al top al abrir la página
  window.scrollTo({ top: 0, behavior: 'instant' })

  const lista = await obtenerTodos()
  persona.value = lista?.find(p => String(p.id_oficial) === String(props.id)) ?? null
  cargando.value = false
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

<style scoped>
/* Estilos específicos para forzar la correcta lectura en ambos modos (Claro/Oscuro) */
.causa-metadatos {
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.causa-fecha {
  font-size: 0.85rem;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.causa-fecha strong {
  color: var(--text-dim) !important;
  font-weight: 700;
}

.causa-fecha span {
  color: var(--text-body) !important;
}

.causa-sentencia-bloque {
  margin-top: 16px;
  background: var(--bg-card);
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 3px solid var(--border-mid);
}

.causa-sentencia {
  color: var(--text-main) !important;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-top: 6px;
}
</style>