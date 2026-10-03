import * as THREE from "three";
import { colocacionEnPared, type ColocacionPared } from "./colocacionPared.ts";
import { CONFIG_POR_DEFECTO, crearVentana, dimensionesM, liberar, type ConfigVentana } from "./ventana3d.ts";

const PASO_AJUSTE_M = 0.02;
// Una detección deja de servir para "Colocar aquí" si tiene más de este tiempo.
const VIGENCIA_DETECCION_MS = 300;
const COLOR_CONTORNO = 0x22ffbb;

const MENSAJES = {
    buscando: "Busca la pared donde irá la ventana. Mueve el teléfono lentamente.",
    sinPared: "No se detecta una pared vertical. Apunta a un muro con buena luz, evitando el suelo y los vidrios.",
    paredDetectada: "Pared detectada. Centra el contorno verde donde irá la ventana y pulsa «Colocar aquí».",
    colocada: "Ventana colocada a escala real. Ajústala con los botones o pulsa «Reubicar».",
};

const crearBoton = (texto: string, acento = false) => {
    const boton = document.createElement("button");
    boton.textContent = texto;
    Object.assign(boton.style, {
        minHeight: "48px",
        padding: "0 16px",
        border: "0",
        borderRadius: "8px",
        background: acento ? "#b3e5fc" : "#ffffff",
        color: "#1a2332",
        font: "600 14px sans-serif",
        pointerEvents: "auto",
    });
    return boton;
};

const habilitar = (boton: HTMLButtonElement, activo: boolean) => {
    boton.disabled = !activo;
    boton.style.opacity = activo ? "1" : "0.45";
};

/**
 * AR guiada con WebXR (Android/Chrome): detecta una pared con hit-test, muestra un contorno verde
 * del tamaño real de la ventana y, al confirmar, la coloca vertical sobre la pared a escala 1:1.
 * Lanza un error si el navegador o el dispositivo no pueden iniciar la sesión.
 */
export const iniciarArGuiada = async (config: ConfigVentana = CONFIG_POR_DEFECTO): Promise<void> => {
    const xr = navigator.xr;
    if (!xr) throw new Error("WebXR no está disponible en este navegador.");

    // Interfaz sobre la cámara (DOM overlay): mensaje arriba y controles abajo.
    const superposicion = document.createElement("div");
    Object.assign(superposicion.style, {
        position: "fixed",
        inset: "0",
        zIndex: "99999",
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px 16px max(24px, env(safe-area-inset-bottom))",
        color: "#fff",
        fontFamily: "sans-serif",
    });
    const estado = document.createElement("p");
    estado.setAttribute("role", "status");
    Object.assign(estado.style, {
        margin: "0", padding: "14px 16px", borderRadius: "12px",
        background: "rgba(26, 35, 50, 0.92)", fontSize: "14px", lineHeight: "1.5",
    });
    estado.textContent = MENSAJES.buscando;
    const controles = document.createElement("div");
    Object.assign(controles.style, { display: "flex", flexWrap: "wrap", gap: "8px" });

    const botonColocar = crearBoton("Colocar aquí", true);
    const botonReubicar = crearBoton("Reubicar");
    const botonSubir = crearBoton("Subir 2 cm");
    const botonBajar = crearBoton("Bajar 2 cm");
    const botonIzquierda = crearBoton("← 2 cm");
    const botonDerecha = crearBoton("2 cm →");
    const botonSalir = crearBoton("Salir");
    habilitar(botonColocar, false);
    controles.append(botonColocar, botonReubicar, botonSubir, botonBajar, botonIzquierda, botonDerecha, botonSalir);
    superposicion.append(estado, controles);
    // Los toques sobre la interfaz no deben interpretarse como toques sobre la escena AR.
    superposicion.addEventListener("beforexrselect", (evento) => evento.preventDefault());
    document.body.append(superposicion);

    const escena = new THREE.Scene();
    const camara = new THREE.PerspectiveCamera();
    escena.add(new THREE.HemisphereLight(0xffffff, 0x666666, 3));
    const ventana = crearVentana(config);
    ventana.visible = false;
    escena.add(ventana);
    const { ancho, alto } = dimensionesM(config);
    const contorno = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(ancho, alto, 0.01)),
        new THREE.LineBasicMaterial({ color: COLOR_CONTORNO }),
    );
    contorno.visible = false;
    escena.add(contorno);

    let sesion: XRSession | undefined;
    let renderizador: THREE.WebGLRenderer | undefined;
    let fuenteHitTest: XRHitTestSource | undefined;
    let candidata: ColocacionPared | null = null;
    let fijada = false;
    let ultimaDeteccion = 0;
    let limpio = false;

    const limpiar = () => {
        if (limpio) return;
        limpio = true;
        fuenteHitTest?.cancel();
        renderizador?.setAnimationLoop(null);
        renderizador?.dispose();
        renderizador?.domElement.remove();
        liberar(escena);
        superposicion.remove();
    };

    try {
        sesion = await xr.requestSession("immersive-ar", {
            requiredFeatures: ["hit-test", "local-floor", "dom-overlay"],
            domOverlay: { root: superposicion },
        });
        const sesionActiva = sesion;
        sesionActiva.addEventListener("end", limpiar, { once: true });

        renderizador = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderizador.xr.enabled = true;
        renderizador.xr.setReferenceSpaceType("local-floor");
        renderizador.setSize(window.innerWidth, window.innerHeight);
        document.body.append(renderizador.domElement);
        await renderizador.xr.setSession(sesionActiva);

        const espacioVisor = await sesionActiva.requestReferenceSpace("viewer");
        fuenteHitTest = await sesionActiva.requestHitTestSource?.({ space: espacioVisor });
        if (!fuenteHitTest) throw new Error("Este dispositivo no permite detectar superficies.");
        const fuente = fuenteHitTest;

        botonSalir.onclick = () => void sesionActiva.end();
        botonColocar.onclick = () => {
            if (!candidata || performance.now() - ultimaDeteccion > VIGENCIA_DETECCION_MS) return;
            ventana.position.set(candidata.posicion.x, candidata.posicion.y, candidata.posicion.z);
            ventana.rotation.set(0, candidata.giro, 0);
            ventana.visible = true;
            fijada = true;
            contorno.visible = false;
            habilitar(botonColocar, false);
            estado.textContent = MENSAJES.colocada;
        };
        botonReubicar.onclick = () => {
            fijada = false;
            ventana.visible = false;
            candidata = null;
            estado.textContent = MENSAJES.buscando;
        };

        // Los desplazamientos siguen la orientación de la pared: "derecha" es a lo largo del muro.
        const mover = (lateral: number, vertical: number) => {
            if (!fijada) return;
            ventana.position.x += lateral * Math.cos(ventana.rotation.y);
            ventana.position.z -= lateral * Math.sin(ventana.rotation.y);
            ventana.position.y += vertical;
        };
        botonSubir.onclick = () => mover(0, PASO_AJUSTE_M);
        botonBajar.onclick = () => mover(0, -PASO_AJUSTE_M);
        botonIzquierda.onclick = () => mover(-PASO_AJUSTE_M, 0);
        botonDerecha.onclick = () => mover(PASO_AJUSTE_M, 0);

        renderizador.setAnimationLoop((_tiempo: number, cuadro?: XRFrame) => {
            if (cuadro && !fijada) {
                candidata = null;
                const espacio = renderizador?.xr.getReferenceSpace();
                const pose = espacio ? cuadro.getViewerPose(espacio) : undefined;
                if (espacio && pose) {
                    for (const resultado of cuadro.getHitTestResults(fuente)) {
                        const poseHit = resultado.getPose(espacio);
                        const colocacion = poseHit && colocacionEnPared(poseHit.transform.matrix, pose.transform.position);
                        if (colocacion) {
                            candidata = colocacion;
                            break;
                        }
                    }
                }
                contorno.visible = candidata !== null;
                habilitar(botonColocar, candidata !== null);
                if (candidata) {
                    ultimaDeteccion = performance.now();
                    contorno.position.set(candidata.posicion.x, candidata.posicion.y, candidata.posicion.z);
                    contorno.rotation.set(0, candidata.giro, 0);
                    estado.textContent = MENSAJES.paredDetectada;
                } else {
                    estado.textContent = MENSAJES.sinPared;
                }
            }
            renderizador?.render(escena, camara);
        });
    } catch (error) {
        await sesion?.end().catch(() => undefined);
        limpiar();
        throw error;
    }
};
