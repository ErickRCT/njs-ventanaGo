export type Servicio = "FABRICACION" | "INSTALACION" | "FLETE";

export const SERVICIOS: { valor: Servicio; etiqueta: string }[] = [
    { valor: "FABRICACION", etiqueta: "Fabricación" },
    { valor: "INSTALACION", etiqueta: "Instalación" },
    { valor: "FLETE", etiqueta: "Flete" },
];

/** Rangos que el cliente puede pedir y la empresa puede ajustar. Los mínimos coinciden con los de Crear Cotización. */
/** Límites generales; cada forma de ventana tiene los suyos al diseñarla (ver limitesDeModelo). */
export const LIMITES = { minMm: 300, maxAnchoMm: 9000, maxAltoMm: 3000, maxCantidad: 99 };

export type EstadoSolicitud = "PENDIENTE" | "ACEPTADA" | "MODIFICADA" | "RECHAZADA";

/** Una ventana diseñada por el cliente. Las medidas van en milímetros, como en las cotizaciones. */
export interface ItemVentana {
    id: string;
    /** Nombre de la pauta elegida (en solicitudes antiguas, el tipo de ventana). */
    descripcion: string;
    /** Pauta del backend con la que se cotiza; no existe en solicitudes hechas antes de elegir pauta. */
    pautaId?: number;
    serieNombre?: string;
    /** Ruta de la imagen de la pauta, relativa al servidor de imágenes. */
    imagenPauta?: string;
    /** Solo para dibujar la ventana: se deduce de la pauta. */
    hojas: number;
    anchoMm: number;
    altoMm: number;
    cantidad: number;
    /** null cuando el color viene del catálogo básico y no del backend. */
    colorId: number | null;
    colorNombre: string;
    vidrioId: number | null;
    vidrioNombre: string;
    observaciones: string;
    /** Lo define la empresa al responder; el cliente no ve precios antes. */
    precioUnitario: number | null;
}

export interface DatosContacto {
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
}

export interface RespuestaEmpresa {
    fecha: string;
    mensaje: string;
    /** Total en pesos; null cuando la solicitud se rechaza. */
    total: number | null;
    notificadoEnApp: boolean;
    notificadoPorCorreo: boolean;
}

export interface Solicitud {
    numero: number;
    fecha: string;
    /** Usuario que la envió; así cada cliente ve solo las suyas. */
    usuario: string;
    contacto: DatosContacto;
    servicios: Servicio[];
    observaciones: string;
    /** Ventanas vigentes: las del cliente, o las de la empresa si modificó la solicitud. */
    items: ItemVentana[];
    /** Solo si la empresa modificó la solicitud: lo que había pedido el cliente. */
    itemsOriginales: ItemVentana[] | null;
    estado: EstadoSolicitud;
    respuesta: RespuestaEmpresa | null;
}

export interface Aviso {
    id: string;
    /** "empresa" o "cliente:<usuario>". */
    destinatario: string;
    fecha: string;
    solicitudNumero: number;
    titulo: string;
    mensaje: string;
    leido: boolean;
}

export const ETIQUETA_ESTADO: Record<EstadoSolicitud, string> = {
    PENDIENTE: "Pendiente",
    ACEPTADA: "Aceptada",
    MODIFICADA: "Modificada",
    RECHAZADA: "Rechazada",
};

export const totalItems =(items: ItemVentana[]): number | null => {
    if (items.some((item) => item.precioUnitario === null)) return null;
    return items.reduce((suma, item) => suma + (item.precioUnitario ?? 0) * item.cantidad, 0);
};

export const cantidadVentanas = (items: ItemVentana[]) => items.reduce((suma, item) => suma + item.cantidad, 0);

export const formatoPesos = (valor: number) => `$${Math.round(valor).toLocaleString("es-CL")}`;
