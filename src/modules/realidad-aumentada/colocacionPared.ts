export interface Punto3D {
    x: number;
    y: number;
    z: number;
}

export interface ColocacionPared {
    posicion: Punto3D;
    /** Giro alrededor del eje vertical, en radianes, para que el frente de la ventana mire a la cámara. */
    giro: number;
}

const DISTANCIA_MAXIMA_M = 5;
// Una superficie cuenta como vertical si su normal apunta casi horizontal.
const INCLINACION_MAXIMA = 0.25;

/**
 * Convierte la pose de un hit-test de WebXR en una colocación sobre una pared,
 * o devuelve null si la superficie no sirve (suelo, techo, lejana o datos inválidos).
 */
export const colocacionEnPared = (matriz: ArrayLike<number>, camara: Punto3D): ColocacionPared | null => {
    if (matriz.length !== 16 || !Array.from(matriz).every(Number.isFinite)) return null;

    // En WebXR la normal de la superficie es el eje +Y local de la pose (columna 1 de la matriz).
    let nx = matriz[4];
    const ny = matriz[5];
    let nz = matriz[6];
    const largo = Math.hypot(nx, ny, nz);
    if (largo < 0.9 || Math.abs(ny / largo) > INCLINACION_MAXIMA) return null;

    const posicion = { x: matriz[12], y: matriz[13], z: matriz[14] };
    const distancia = Math.hypot(posicion.x - camara.x, posicion.y - camara.y, posicion.z - camara.z);
    if (distancia > DISTANCIA_MAXIMA_M) return null;

    // El frente de la ventana debe mirar hacia quien sostiene el teléfono.
    if (nx * (camara.x - posicion.x) + nz * (camara.z - posicion.z) < 0) {
        nx = -nx;
        nz = -nz;
    }

    return { posicion, giro: Math.atan2(nx, nz) };
};
