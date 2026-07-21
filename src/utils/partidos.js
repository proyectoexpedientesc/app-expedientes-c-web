// Tipos que corresponden a cargos políticos con afiliación partidaria real.
// Excluye: fuerzas armadas/orden, poder judicial, órganos técnicos autónomos,
// y sector privado (empresas, empresarios, abogados, fundaciones).
export const TIPOS_POLITICOS = [
  'presidentes', 'ministros', 'subsecretarios',
  'delegados-presidenciales-reg', 'delegados-presidenciales-pro', 'seremis',
  'senadores', 'diputados',
  'gobernadores', 'consejeros', 'alcaldes', 'concejales',
]

// ── Espectro político chileno: lista canónica ORDENADA izquierda → derecha ──
// id: usado para intentar cruzar con politico.id_partido
// sigla: se usa en el eje del gráfico / vistas compactas
// aliases: variantes de texto que pueden venir en politico.partido_actual
// logo: ruta esperada en /public/logos/<id>.png — súbelos tú (fuente oficial/SERVEL).
// Si el archivo no existe, la vista cae automáticamente al ícono 🏛️.
export const PARTIDOS_CONFIG = [
  { id: 'rd',       nombre: 'Revolución Democrática',        sigla: 'RD',    color: '#fb7185', logo: '/logos/rd.png',           aliases: ['revolución democrática', 'revolución democrática (expulsado)', 'rd'] },
  { id: 'pc',       nombre: 'Partido Comunista',              sigla: 'PC',    color: '#7f1d1d', logo: '/logos/pc.png',           aliases: ['partido comunista', 'partido comunista de chile', 'pcch', 'pc'] },
  { id: 'fa',       nombre: 'Frente Amplio',                  sigla: 'FA',    color: '#ef4444', logo: '/logos/fa.png',           aliases: ['frente amplio', 'fa'] },
  { id: 'cs',       nombre: 'Convergencia Social',             sigla: 'CS',    color: '#f43f5e', logo: '/logos/cs.png',           aliases: ['convergencia social', 'cs'] },
  { id: 'ps',       nombre: 'Partido Socialista',              sigla: 'PS',    color: '#e11d48', logo: '/logos/ps.png',           aliases: ['partido socialista', 'ps'] },
  { id: 'pev',      nombre: 'Partido Ecologista Verde',        sigla: 'PEV',   color: '#16a34a', logo: '/logos/pev.png',          aliases: ['partido ecologista verde', 'pev'] },
  { id: 'frevs',    nombre: 'Federación Regionalista Verde Social', sigla: 'FREVS', color: '#15803d', logo: '/logos/frevs.png',   aliases: ['federación regionalista verde social', 'frevs'] },
  { id: 'pr',       nombre: 'Partido Radical',                 sigla: 'PR',    color: '#dc2626', logo: '/logos/pr.png',           aliases: ['partido radical', 'pr'] },
  { id: 'ppd',      nombre: 'Partido por la Democracia',       sigla: 'PPD',   color: '#c2410c', logo: '/logos/ppd.png',          aliases: ['partido por la democracia', 'ppd'] },
  { id: 'pdc',      nombre: 'Partido Demócrata Cristiano',     sigla: 'PDC',   color: '#b45309', logo: '/logos/pdc.png',          aliases: ['partido demócrata cristiano', 'pdc'] },
  { id: 'ah',       nombre: 'Acción Humanista',                sigla: 'AH',    color: '#a16207', logo: '/logos/ah.png',           aliases: ['acción humanista', 'ah'] },
  { id: 'am',       nombre: 'Amarillos',                       sigla: 'AM',    color: '#ca8a04', logo: '/logos/am.png',    aliases: ['amarillos'] },
  { id: 'pd',       nombre: 'Partido Demócratas',              sigla: 'PD',    color: '#0891b2', logo: '/logos/pd.png',   aliases: ['partido demócratas', 'demócratas'] },
  { id: 'evo',      nombre: 'Evópoli',                         sigla: 'EVO',   color: '#6d28d9', logo: '/logos/evo.png',      aliases: ['evópoli', 'evopoli'] },
  { id: 'pdg',      nombre: 'Partido de la Gente',              sigla: 'PDG',   color: '#0284c7', logo: '/logos/pdg.png',          aliases: ['partido de la gente', 'pdg'] },
  { id: 'rn',       nombre: 'Renovación Nacional',              sigla: 'RN',    color: '#1d4ed8', logo: '/logos/rn.png',           aliases: ['renovación nacional', 'renovación nacional (rn)', 'rn'] },
  { id: 'pl',       nombre: 'Partido Liberal de Chile',         sigla: 'PL',    color: '#2563eb', logo: '/logos/pl.png',      aliases: ['partido liberal de chile', 'partido liberal', 'liberal'] },
  { id: 'udi',      nombre: 'Unión Demócrata Independiente',    sigla: 'UDI',   color: '#1e3a8a', logo: '/logos/udi.png',          aliases: ['udi'] },
  { id: 'rep',      nombre: 'Partido Republicano',              sigla: 'REP',   color: '#172554', logo: '/logos/rep.png',  aliases: ['partido republicano', 'republicano'] },
  { id: 'pnl',      nombre: 'Partido Nacional Libertario',      sigla: 'PNL',   color: '#334155', logo: '/logos/pnl.png',          aliases: ['partido nacional libertario', 'pnl'] },
  { id: 'ind',      nombre: 'Independientes',                  sigla: 'IND',   color: '#94a3b8', logo: null,                      aliases: ['independiente', 'independientes'] },
]

// Usa la sigla siempre que exista; si no tiene sigla definida, usa el nombre completo
export const nombreParaMostrar = (p) => p.sigla || p.nombre

// Marcadores de "sin dato de partido" — estos se EXCLUYEN del todo, no cuentan en ningún lado
export const SIN_PARTIDO_MARCADORES = ['', 'sin partido', 'sin información', 'sin info', 's/i', 'n/a', 'sin datos']

// Mapa rápido alias(normalizado) → id canónico, construido desde PARTIDOS_CONFIG
const ALIAS_A_ID = PARTIDOS_CONFIG.reduce((acc, p) => {
  p.aliases.forEach(a => { acc[a] = p.id })
  return acc
}, {})

const normalizar = (txt) => (txt || '').toString().trim().toLowerCase()

// Resuelve el id canónico de partido de un político: primero por id_partido, luego por nombre.
// Devuelve null si no tiene partido (vacío o marcado como "sin partido"), excluyéndolo.
export const resolverIdPartido = (politico) => {
  if (politico.id_partido) {
    const idNorm = normalizar(politico.id_partido)
    if (PARTIDOS_CONFIG.some(p => p.id === idNorm)) return idNorm
  }

  const nombreNorm = normalizar(politico.partido_actual)

  if (SIN_PARTIDO_MARCADORES.includes(nombreNorm)) return null

  if (ALIAS_A_ID[nombreNorm]) return ALIAS_A_ID[nombreNorm]

  // Fallback: cualquier variante que mencione "independiente"
  // (ej. "Independiente (Pro UDI)", "Militar / Independiente") cae en Independientes
  if (nombreNorm.includes('independiente')) return 'independiente'

  return null
}

export const colorPartido = (nombre) => {
  const cfg = PARTIDOS_CONFIG.find(p => p.nombre === nombre)
  return cfg ? cfg.color : '#94a3b8'
}

export const getPartidoPorId = (id) => PARTIDOS_CONFIG.find(p => p.id === id) || null
