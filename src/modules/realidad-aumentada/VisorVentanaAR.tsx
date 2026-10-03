import React, { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import { ViewInAr } from "@mui/icons-material";
import "@google/model-viewer";
import type { ModelViewerElement } from "@google/model-viewer";
import { CONFIG_POR_DEFECTO, dimensionesM, type ConfigVentana, type ModelosVentana } from "./ventana3d.ts";

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<ModelViewerElement>, ModelViewerElement> & {
                src?: string;
                "ios-src"?: string;
                alt?: string;
                ar?: boolean;
                "ar-modes"?: string;
                "ar-placement"?: "floor" | "wall";
                "ar-scale"?: "auto" | "fixed";
                "camera-controls"?: boolean;
                "shadow-intensity"?: string;
                loading?: "auto" | "lazy" | "eager";
            };
        }
    }
}

// Mientras se escriben las medidas no se regenera el modelo en cada tecla.
const DEMORA_REGENERAR_MS = 300;

const mensajeNoSoportado = () => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) {
        return "No se pudo abrir la realidad aumentada. Abre esta página directamente en Safari, no dentro de otra aplicación.";
    }
    if (/android/i.test(ua)) {
        return window.isSecureContext
            ? "No se pudo abrir la realidad aumentada. Abre esta página en Chrome y comprueba que tu teléfono sea compatible con ARCore."
            : "En Android la realidad aumentada solo funciona si la página se abre por HTTPS.";
    }
    return "Este dispositivo no permite realidad aumentada. Abre esta página desde un teléfono compatible.";
};

const formatoMetros = (metros: number) => metros.toLocaleString("es-CL", { maximumFractionDigits: 2 });

interface VisorVentanaARProps {
    /** Ventana a mostrar; si cambia, el modelo 3D se vuelve a generar. */
    config?: ConfigVentana;
}

/** Vista 3D de una ventana y botón para proyectarla a escala real sobre la pared con la cámara. */
export const VisorVentanaAR = ({ config = CONFIG_POR_DEFECTO }: VisorVentanaARProps) => {
    const viewerRef = useRef<ModelViewerElement | null>(null);
    const [modelos, setModelos] = useState<ModelosVentana | null>(null);
    const [modeloCargado, setModeloCargado] = useState(false);
    const [errorModelo, setErrorModelo] = useState(false);
    const [arGuiadaLista, setArGuiadaLista] = useState(false);
    const [noSoportado, setNoSoportado] = useState(false);
    const [errorAr, setErrorAr] = useState(false);

    const { anchoMm, altoMm, hojas, modelo, colorMarco, colorVidrio } = config;

    // Genera la ventana 3D en el navegador; three.js se descarga aparte, solo al entrar a este visor.
    useEffect(() => {
        let cancelado = false;
        let generados: ModelosVentana | null = null;

        // Hasta que el modelo nuevo cargue, el botón de AR no debe usar medidas antiguas.
        setModeloCargado(false);
        setErrorModelo(false);

        const temporizador = window.setTimeout(() => {
            import("./ventana3d.ts")
                .then((modulo) => modulo.exportarModelos({ anchoMm, altoMm, hojas, modelo, colorMarco, colorVidrio }))
                .then((resultado) => {
                    if (cancelado) return resultado.liberar();
                    generados = resultado;
                    setModelos(resultado);
                })
                .catch((error) => {
                    console.error("Error al generar el modelo de la ventana:", error);
                    if (!cancelado) setErrorModelo(true);
                });
        }, DEMORA_REGENERAR_MS);

        return () => {
            cancelado = true;
            window.clearTimeout(temporizador);
            generados?.liberar();
        };
    }, [anchoMm, altoMm, hojas, modelo, colorMarco, colorVidrio]);

    // WebXR (Android/Chrome con HTTPS y ARCore) da la experiencia guiada; sin él se usa Quick Look en iPhone.
    useEffect(() => {
        navigator.xr
            ?.isSessionSupported("immersive-ar")
            .then(setArGuiadaLista)
            .catch(() => setArGuiadaLista(false));
    }, []);

    useEffect(() => {
        const viewer = viewerRef.current;
        if (!viewer) return;

        const handleLoad = () => setModeloCargado(true);
        const handleArStatus = (event: Event) => {
            const { status } = (event as CustomEvent<{ status: string }>).detail;
            setErrorAr(status === "failed");
        };

        viewer.addEventListener("load", handleLoad);
        viewer.addEventListener("ar-status", handleArStatus);
        if (viewer.loaded) handleLoad();
        return () => {
            viewer.removeEventListener("load", handleLoad);
            viewer.removeEventListener("ar-status", handleArStatus);
        };
    }, []);

    const handleActivarAr = async () => {
        const viewer = viewerRef.current;
        setErrorAr(false);
        setNoSoportado(false);

        if (arGuiadaLista) {
            try {
                const { iniciarArGuiada } = await import("./arGuiada.ts");
                await iniciarArGuiada({ anchoMm, altoMm, hojas, modelo, colorMarco, colorVidrio });
            } catch (error) {
                console.error("Error al iniciar la AR guiada:", error);
                setErrorAr(true);
            }
            return;
        }

        // canActivateAR se consulta al pulsar, cuando model-viewer ya eligió el modo de AR del dispositivo.
        if (!viewer?.canActivateAR) {
            setNoSoportado(true);
            return;
        }
        viewer.activateAR();
    };

    const { ancho, alto } = dimensionesM({ anchoMm, altoMm, hojas, modelo, colorMarco, colorVidrio });

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Button
                variant="contained"
                size="large"
                startIcon={<ViewInAr />}
                onClick={handleActivarAr}
                disabled={!modeloCargado}
            >
                {arGuiadaLista ? "AR guiada · colocar en la pared" : "Ver ventana en realidad aumentada"}
            </Button>

            {noSoportado && (
                <Alert severity="info" sx={{ width: "100%", maxWidth: 600 }}>
                    {mensajeNoSoportado()}
                </Alert>
            )}

            {!window.isSecureContext && (
                <Alert severity="warning" sx={{ width: "100%", maxWidth: 600 }}>
                    Esta página no se sirve por HTTPS, por lo que algunos navegadores pueden bloquear el acceso a la cámara.
                </Alert>
            )}

            {errorAr && (
                <Alert severity="error" sx={{ width: "100%", maxWidth: 600 }}>
                    No se pudo iniciar la realidad aumentada. Revisa que hayas permitido el acceso a la cámara e inténtalo nuevamente.
                </Alert>
            )}

            {errorModelo && (
                <Alert severity="error" sx={{ width: "100%", maxWidth: 600 }}>
                    No se pudo preparar el modelo 3D de la ventana. Recarga la página.
                </Alert>
            )}

            <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 600 }}>
                Apunta a una pared con buena luz y mueve el teléfono lentamente. Confirma dónde irá la ventana:
                se coloca a escala real ({formatoMetros(ancho)} × {formatoMetros(alto)} m) y queda fija en la pared.
                En iPhone, abre esta página en Safari.
            </Typography>

            <Box
                sx={{
                    width: "100%",
                    maxWidth: 600,
                    height: { xs: 320, md: 420 },
                    // El botón de AR es el de arriba; se oculta el que model-viewer dibuja por defecto.
                    "& model-viewer::part(default-ar-button)": { display: "none" },
                }}
            >
                <model-viewer
                    ref={viewerRef}
                    src={modelos?.glbUrl}
                    ios-src={modelos?.usdzUrl}
                    alt="Modelo 3D de la ventana"
                    loading="eager"
                    ar
                    ar-modes="quick-look"
                    ar-placement="wall"
                    ar-scale="fixed"
                    camera-controls
                    shadow-intensity="1"
                    style={{ width: "100%", height: "100%", backgroundColor: "#edf2f7", borderRadius: 8 }}
                />
            </Box>
        </Box>
    );
};
