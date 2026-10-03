import axios from "axios";
import { useAuth } from "../../context/AuthContext.tsx";
import { crearRecurso } from "./recursoRemoto.ts";
import type { Aviso, DatosContacto, ItemVentana, Servicio, Solicitud } from "./tipos.ts";

/*
 * Carrito, solicitudes de cotización y avisos, guardados en el backend (ms-ventanaGo).
 * El backend identifica al usuario por el token: el parámetro "usuario" de estas funciones solo
 * separa los datos en memoria cuando cambia la sesión.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Datos de cuando todo vivía en el navegador; ya no se usan.
["ventanago.carritos", "ventanago.solicitudes", "ventanago.avisos"].forEach((clave) => localStorage.removeItem(clave));

// Las solicitudes nuevas y las respuestas llegan de otros usuarios: se revisan cada 30 s.
const INTERVALO_ACTUALIZACION_MS = 30_000;

const SIN_ITEMS: ItemVentana[] = [];
const SIN_SOLICITUDES: Solicitud[] = [];
const SIN_AVISOS: Aviso[] = [];

const carrito = crearRecurso(
    async () => (await axios.get<ItemVentana[]>(`${API_BASE_URL}/carrito`)).data, SIN_ITEMS,
);
const solicitudes = crearRecurso(
    async () => (await axios.get<Solicitud[]>(`${API_BASE_URL}/solicitudes`)).data, SIN_SOLICITUDES, INTERVALO_ACTUALIZACION_MS,
);
const avisos = crearRecurso(
    async () => (await axios.get<Aviso[]>(`${API_BASE_URL}/avisos`)).data, SIN_AVISOS, INTERVALO_ACTUALIZACION_MS,
);

// Se mantienen por compatibilidad con el encabezado: indican qué avisos mostrar según el rol.
export const DESTINATARIO_EMPRESA = "empresa";
export const destinatarioCliente = (usuario: string) => `cliente:${usuario}`;

// ---------- Hooks de lectura ----------

/** Solo clientes (y el administrador) tienen carrito. */
export const useCarrito = (usuario: string): ItemVentana[] => {
    const { rol } = useAuth();
    return carrito.useValor(usuario && (rol === "cliente" || rol === "admin") ? usuario : null);
};

/** El cliente recibe las suyas; proveedores y administrador, todas. */
export const useSolicitudes = (): Solicitud[] => {
    const { usuario } = useAuth();
    return solicitudes.useValor(usuario || null);
};

/** Avisos de la sesión actual; destinatario vacío si el rol no recibe avisos. */
export const useAvisos = (destinatario: string): Aviso[] => avisos.useValor(destinatario || null);

// ---------- Carrito ----------

export type NuevoItem = Omit<ItemVentana, "id" | "precioUnitario">;

export const agregarAlCarrito = async (_usuario: string, item: NuevoItem) => {
    carrito.setear((await axios.post<ItemVentana[]>(`${API_BASE_URL}/carrito`, item)).data);
};

export const cambiarCantidad = async (_usuario: string, itemId: string, cantidad: number) => {
    carrito.setear((await axios.put<ItemVentana[]>(`${API_BASE_URL}/carrito/${itemId}/cantidad`, { cantidad })).data);
};

export const quitarDelCarrito = async (_usuario: string, itemId: string) => {
    carrito.setear((await axios.delete<ItemVentana[]>(`${API_BASE_URL}/carrito/${itemId}`)).data);
};

// ---------- Solicitudes ----------

export interface DatosSolicitud {
    contacto: DatosContacto;
    servicios: Servicio[];
    observaciones: string;
}

/** Convierte el carrito del cliente en una solicitud pendiente; el backend vacía el carrito y avisa a los proveedores. */
export const enviarSolicitud = async (_usuario: string, datos: DatosSolicitud): Promise<Solicitud> => {
    const solicitud = (await axios.post<Solicitud>(`${API_BASE_URL}/solicitudes`, datos)).data;
    carrito.setear(SIN_ITEMS);
    solicitudes.setear([...solicitudes.leer().filter((s) => s.numero !== solicitud.numero), solicitud]);
    return solicitud;
};

export interface RespuestaDeEmpresa {
    estado: Exclude<Solicitud["estado"], "PENDIENTE">;
    mensaje: string;
    /** Ventanas con los precios definidos (y las medidas cambiadas si la solicitud se modifica). */
    items: ItemVentana[];
    notificarEnApp: boolean;
    notificarPorCorreo: boolean;
}

/** Registra lo que la empresa decidió; el backend calcula el total y avisa al cliente si corresponde. */
export const responderSolicitud = async (numero: number, respuesta: RespuestaDeEmpresa): Promise<Solicitud> => {
    const actualizada = (await axios.post<Solicitud>(`${API_BASE_URL}/solicitudes/${numero}/respuesta`, respuesta)).data;
    solicitudes.setear(solicitudes.leer().map((s) => (s.numero === numero ? actualizada : s)));
    return actualizada;
};

// ---------- Avisos ----------

export const marcarAvisosLeidos = async (_destinatario: string) => {
    const actuales = avisos.leer();
    if (!actuales.some((a) => !a.leido)) return;
    avisos.setear(actuales.map((a) => ({ ...a, leido: true })));
    try {
        await axios.post(`${API_BASE_URL}/avisos/leidos`);
    } catch (error) {
        console.error("No se pudieron marcar los avisos como leídos:", error);
        void avisos.refrescar();
    }
};
