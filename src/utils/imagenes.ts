// Las imágenes de catálogo (pautas, quincallería, etc.) se sirven junto al front, desde public/pautas.
// VITE_IMAGEN_BASE_URL permite moverlas a otro servidor sin tocar el código (por defecto, el mismo sitio).
const BASE_IMAGENES = new URL(import.meta.env.VITE_IMAGEN_BASE_URL || '/', window.location.origin);

/** URL completa de una imagen guardada en la BD como ruta relativa (p. ej. "pautas/ventana.jpg"). */
export const urlImagen = (rutaImagen?: string | null): string =>
    rutaImagen ? new URL(rutaImagen, BASE_IMAGENES).href : '';

/** Imágenes disponibles para elegir en los formularios (listadas en public/pautas/imagenes.json). */
export const getImagenesDisponibles = async (): Promise<string[]> => {
    try {
        const respuesta = await fetch(urlImagen('pautas/imagenes.json'));
        const rutas: string[] = await respuesta.json();
        return rutas.map(urlImagen);
    } catch (err) {
        console.error('Error al obtener imágenes:', err);
        return [];
    }
};
