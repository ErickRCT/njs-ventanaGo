import { ETIQUETA_ESTADO, formatoPesos, type Solicitud } from "./tipos.ts";

const RESUMEN_ESTADO = {
    ACEPTADA: "La empresa aceptó tu solicitud de cotización.",
    MODIFICADA: "La empresa modificó tu solicitud de cotización. Revisa el detalle a continuación.",
    RECHAZADA: "La empresa no pudo aceptar tu solicitud de cotización.",
} as const;

/**
 * Prepara el correo con la respuesta de la empresa y lo abre en el programa de correo del usuario.
 * Enviarlo desde el servidor requiere un endpoint en el backend; cuando exista, se reemplaza solo esta función.
 */
export const abrirCorreoRespuesta = (solicitud: Solicitud) => {
    const { respuesta, estado } = solicitud;
    if (!respuesta || estado === "PENDIENTE") return;

    const lineas = [
        `Hola ${solicitud.contacto.nombre},`,
        "",
        RESUMEN_ESTADO[estado],
        "",
        respuesta.mensaje,
        "",
    ];

    if (estado !== "RECHAZADA") {
        lineas.push("Detalle:");
        solicitud.items.forEach((item) => {
            const precio = item.precioUnitario === null ? "" : ` · ${formatoPesos(item.precioUnitario)} c/u`;
            lineas.push(
                `- ${item.cantidad} × ${item.descripcion} ${item.anchoMm} × ${item.altoMm} mm, ${item.colorNombre}, vidrio ${item.vidrioNombre}${precio}`,
            );
        });
        if (respuesta.total !== null) lineas.push("", `Total: ${formatoPesos(respuesta.total)}`);
        lineas.push("", "Las medidas definitivas se confirman en terreno.");
    }
    lineas.push("", "Saludos,", "Glass Maipo · VentanaGo");

    const asunto = `Cotización N°${solicitud.numero} ${ETIQUETA_ESTADO[estado].toLowerCase()}`;
    const enlace = `mailto:${solicitud.contacto.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(lineas.join("\n"))}`;
    window.location.href = enlace;
};
