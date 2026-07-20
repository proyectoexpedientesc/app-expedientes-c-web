export const getFoto = (persona, tipoCargo) => {
  if (!persona || !persona.id_oficial) return null;
  
  // 1. Extraemos solo el número del ID oficial (ej: de "mcs_22" o "mca_71" obtenemos el número)
  const idNumerico = persona.id_oficial.split('_')[1];
  
  // 2. Usamos el tipoCargo tal cual viene del JSON (ej: "corte_suprema" o "corte_apelaciones")
  // Asegúrate de que tu carpeta en public/fotos/ se llame exactamente igual.
  return `/fotos/${tipoCargo}/${idNumerico}.jpg`;
}