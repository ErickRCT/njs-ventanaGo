import { colorMarcoHex, colorVidrioHex, hexACss } from "./catalogo.ts";
import type { ItemVentana } from "../solicitudes/tipos.ts";

interface MiniVentanaProps {
    item: Pick<ItemVentana, "anchoMm" | "altoMm" | "hojas" | "colorNombre" | "vidrioNombre">;
    /** Lado mayor del dibujo, en píxeles. */
    tamano?: number;
}

/** Dibujo esquemático de la ventana, con las mismas proporciones y colores que el modelo 3D. */
export const MiniVentana = ({ item, tamano = 88 }: MiniVentanaProps) => {
    const escala = tamano / Math.max(item.anchoMm, item.altoMm);
    const ancho = item.anchoMm * escala;
    const alto = item.altoMm * escala;
    const marco = hexACss(colorMarcoHex(item.colorNombre));
    const vidrio = hexACss(colorVidrioHex(item.vidrioNombre));
    const borde = Math.max(3, tamano / 16);

    return (
        <svg
            width={tamano}
            height={tamano}
            viewBox={`0 0 ${tamano} ${tamano}`}
            role="img"
            aria-label={`Ventana de ${item.anchoMm} por ${item.altoMm} milímetros`}
        >
            <g transform={`translate(${(tamano - ancho) / 2} ${(tamano - alto) / 2})`}>
                <rect width={ancho} height={alto} fill={marco} stroke="rgba(0,0,0,0.25)" />
                <rect x={borde} y={borde} width={ancho - 2 * borde} height={alto - 2 * borde} fill={vidrio} fillOpacity={0.6} />
                {Array.from({ length: item.hojas - 1 }, (_, i) => (
                    <rect
                        key={i}
                        x={borde + ((i + 1) * (ancho - 2 * borde)) / item.hojas - 1.5}
                        y={borde}
                        width={3}
                        height={alto - 2 * borde}
                        fill={marco}
                    />
                ))}
            </g>
        </svg>
    );
};
