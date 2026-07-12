export const getFoto = (persona, tipoCargo) => {
  if (!persona || !persona.id_oficial) return null;
  
  // Extraemos solo el número del ID oficial (ej: de "dip_1009" obtenemos "1009")
  const idNumerico = persona.id_oficial.split('_')[1];
  
  // Apuntamos a la carpeta "fotos" que está dentro de "public"
  // Vue lo interpretará automáticamente desde la raíz del sitio
  return `/fotos/${tipoCargo}/${idNumerico}.jpg`;
}