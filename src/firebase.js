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

// Trae TODOS los políticos una sola vez y los guarda en memoria
export async function obtenerTodos() {
  if (cacheTotal) return cacheTotal;

  try {
    const snapshot = await getDocs(collection(db, "politicos"));
    cacheTotal = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return cacheTotal;
  } catch (error) {
    console.error("Error al obtener datos de Firebase:", error);
    return [];
  }
}

// Mantener compatibilidad si algo más usa obtenerPoliticos
export async function obtenerPoliticos() {
  return obtenerTodos();
}