import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ListadosView from '../views/ListadosView.vue'
import DetallePersonaView from '../views/DetallePersonaView.vue'
import CausasView from '../views/CausasView.vue'
import TransparencyPolicy from '../views/TransparencyPolicy.vue'

// 🌟 ARREGLO ACTUALIZADO CON TODAS LAS NUEVAS INSTITUCIONES
const tiposValidos = [
  // Poder Ejecutivo
  'presidentes', 'ministros', 'subsecretarios', 'seremis', 'dictador',
  'delegados-presidenciales-reg', 'delegados-presidenciales-pro',
  
  // Poder Legislativo
  'senadores', 'diputados',
  
  // Poder Judicial
  'ministros-corte-suprema', 'ministros-corte-apelaciones', 'jueces',
  
  // Administración Local
  'gobernadores', 'alcaldes', 'concejales', 'consejeros',
  
  // Órganos Autónomos
  'fiscales', 'contraloria', 'tc',
  
  // Policías y Fuerzas Armadas
  'carabineros', 'pdi', 'ejercito',
  
  // Sector Privado, Legal y Fundaciones
  'empresas', 'empresarios', 'abogados', 'fundaciones'
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/causas',
      name: 'causas',
      component: CausasView,
    },
    {
      path: '/partidos',
      name: 'partidos',
      component: () => import('../views/PartidosView.vue')
    },
    {
      path: '/partidos/:id',
      name: 'detalle-partido',
      component: () => import('../views/DetallePartidoView.vue'),
      props: true
    },
    {
      path: '/transparencia',
      name: 'transparencia',
      component: TransparencyPolicy,
    },
    {
      path: '/:tipo',
      name: 'politicos',
      component: ListadosView,
      props: true,
      beforeEnter: (to) => {
        // Si el usuario intenta entrar a una URL que no está en tiposValidos, rebota al Home
        if (!tiposValidos.includes(to.params.tipo)) {
          return { path: '/' }
        }
      },
    },
    {
      path: '/detalle/:tipo/:id',
      name: 'detalle-persona',
      component: DetallePersonaView,
      props: true,
    },
  ],
})

export default router