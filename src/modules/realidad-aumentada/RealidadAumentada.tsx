import React, { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Typography } from "@mui/material";
import { ViewInAr } from "@mui/icons-material";
import "@google/model-viewer";
import type { ModelViewerElement } from "@google/model-viewer";

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

const MODELO_VENTANA = `${import.meta.env.BASE_URL}models/ventana.glb`;
// Android y Safari usan el .glb; iOS con navegadores que no son Safari (Chrome, Edge, Firefox) exige un .usdz propio.
const MODELO_VENTANA_IOS = `${import.meta.env.BASE_URL}models/ventana.usdz`;

const mensajeNoSoportado = () => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) {
        return "No se pudo abrir la realidad aumentada. Abre esta página directamente en Safari, no dentro de otra aplicación.";
    }
    if (/android/i.test(ua)) {
        return "No se pudo abrir la realidad aumentada. Abre esta página en Chrome; Firefox no la admite.";
    }
    return "Este dispositivo no permite realidad aumentada. Abre esta página desde un teléfono compatible.";
};

export const RealidadAumentada = () => {
    const viewerRef = useRef<ModelViewerElement | null>(null);
    const [modeloCargado, setModeloCargado] = useState(false);
    const [noSoportado, setNoSoportado] = useState(false);
    const [errorAr, setErrorAr] = useState(false);

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

    const handleActivarAr = () => {
        const viewer = viewerRef.current;
        setErrorAr(false);
        // canActivateAR se consulta al pulsar, cuando model-viewer ya eligió el modo de AR del dispositivo.
        if (!viewer?.canActivateAR) {
            setNoSoportado(true);
            return;
        }
        setNoSoportado(false);
        viewer.activateAR();
    };

    return (
        <Card>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<ViewInAr />}
                        onClick={handleActivarAr}
                        disabled={!modeloCargado}
                    >
                        Ver ventana en realidad aumentada
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

                    <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 600 }}>
                        Al presionar el botón se abrirá la cámara del teléfono. Apunta hacia una pared y coloca la ventana
                        a escala real para ver cómo se vería instalada.
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
                            src={MODELO_VENTANA}
                            ios-src={MODELO_VENTANA_IOS}
                            alt="Modelo 3D de una ventana corrediza"
                            loading="eager"
                            ar
                            ar-modes="webxr scene-viewer quick-look"
                            ar-placement="wall"
                            ar-scale="fixed"
                            camera-controls
                            shadow-intensity="1"
                            style={{ width: "100%", height: "100%", backgroundColor: "#edf2f7", borderRadius: 8 }}
                        />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};
