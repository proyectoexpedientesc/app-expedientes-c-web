import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANYrrNXlx4UROGp1nsz0mkI4uZI1Vp7yI",
  authDomain: "expedientes-c.firebaseapp.com",
  projectId: "expedientes-c",
  storageBucket: "expedientes-c.firebasestorage.app",
  messagingSenderId: "779973564316",
  appId: "1:779973564316:web:43777c70c68bb137609a59"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// Cache para no releer Firebase en cada navegación
let cacheTotal = null;

// Trae TODOS los políticos y CAUSAS una sola vez, los cruza y guarda en memoria
export async function obtenerTodos() {
  if (cacheTotal) return cacheTotal;

  try {
    // 1. Descargar todos los Políticos
    const politicosSnap = await getDocs(collection(db, "politicos"));
    const politicos = politicosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Descargar todas las Causas Generales
    const causasSnap = await getDocs(collection(db, "causas"));
    const causasGenerales = causasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 3. Crear un diccionario (mapa) de causas para búsqueda rápida
    const mapaCausas = {};
    causasGenerales.forEach(causa => {
      mapaCausas[causa.id_causa] = causa;
    });

    // 4. Cruzar los datos (Inyectar la info general al perfil del político)
    politicos.forEach(politico => {
      if (politico.causas && Array.isArray(politico.causas)) {
        politico.causas = politico.causas.map(causaPersonal => {
          // Buscamos la causa en la nueva colección usando el id_causa
          const causaGeneral = mapaCausas[causaPersonal.id_causa] || {};
          
          return {
            ...causaGeneral,    // Inyecta: titulo, anio, fecha_delito, etc.
            ...causaPersonal,   // Mantiene los datos específicos del político
            
            // Separamos las descripciones para poder usarlas en las vistas .vue
            detalle_general: causaGeneral.detalle || "",
            detalle_personal: causaPersonal.detalle || "",
            resolucion_general: causaGeneral.resolucion || "",
            resolucion_personal: causaPersonal.resolucion || ""
          };
        });
      }
    });

    // 5. Guardar en caché y retornar
    cacheTotal = politicos;
    return cacheTotal;
    
  } catch (error) {
    console.error("Error al obtener y cruzar datos de Firebase:", error);
    return [];
  }
}

// Mantener compatibilidad si algo más usa obtenerPoliticos
export async function obtenerPoliticos() {
  return obtenerTodos();
}