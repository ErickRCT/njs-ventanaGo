import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const SCRIPT_GOOGLE = "https://accounts.google.com/gsi/client";

interface GoogleIdentity {
    accounts: {
        id: {
            initialize: (opciones: { client_id: string; callback: (respuesta: { credential: string }) => void }) => void;
            renderButton: (contenedor: HTMLElement, opciones: Record<string, unknown>) => void;
        };
    };
}

declare global {
    interface Window {
        google?: GoogleIdentity;
    }
}

let cargaScript: Promise<void> | null = null;
const cargarScriptGoogle = () => {
    cargaScript ??= new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = SCRIPT_GOOGLE;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
            cargaScript = null;
            reject(new Error("No se pudo cargar Google"));
        };
        document.head.appendChild(script);
    });
    return cargaScript;
};

/** true si el front tiene el client ID de Google configurado (VITE_GOOGLE_CLIENT_ID). */
export const googleDisponible = Boolean(GOOGLE_CLIENT_ID);

interface BotonGoogleProps {
    /** Recibe el ID token de Google, que se valida en el backend. */
    onCredencial: (idToken: string) => void;
    onError: () => void;
}

/** Botón oficial "Continuar con Google" (Google Identity Services). */
export const BotonGoogle = ({ onCredencial, onError }: BotonGoogleProps) => {
    const contenedor = useRef<HTMLDivElement | null>(null);
    const [ancho, setAncho] = useState(320);
    // El botón se inicializa una vez; los callbacks se leen del ref para usar siempre los últimos.
    const callbacks = useRef({ onCredencial, onError });
    callbacks.current = { onCredencial, onError };

    useEffect(() => {
        if (contenedor.current) setAncho(Math.min(400, contenedor.current.offsetWidth || 320));
    }, []);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return;
        let cancelado = false;
        cargarScriptGoogle()
            .then(() => {
                if (cancelado || !contenedor.current || !window.google) return;
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: (respuesta) => callbacks.current.onCredencial(respuesta.credential),
                });
                window.google.accounts.id.renderButton(contenedor.current, {
                    theme: "outline", size: "large", text: "continue_with", shape: "rectangular", locale: "es", width: ancho,
                });
            })
            .catch(() => callbacks.current.onError());
        return () => {
            cancelado = true;
        };
    }, [ancho]);

    return <Box ref={contenedor} sx={{ width: "100%", display: "flex", justifyContent: "center", minHeight: 44 }} />;
};
