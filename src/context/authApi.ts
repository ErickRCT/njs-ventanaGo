import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type RolBackend = "ADMIN" | "CLIENTE" | "PROVEEDOR";

export interface CuentaSesion {
    cuentaId: number;
    email: string;
    nombre: string | null;
    rol: RolBackend;
}

/** Respuesta de /auth: el token va en el header Authorization de cada petición. */
export interface Sesion {
    token: string;
    /** Fecha de vencimiento en milisegundos. */
    expiraEn: number;
    cuenta: CuentaSesion;
}

/** Mensaje que envía el backend ("Código incorrecto.", etc.) o uno genérico. */
export const mensajeDeError = (error: unknown, porDefecto = "No se pudo completar la operación. Inténtalo nuevamente.") => {
    if (axios.isAxiosError(error)) {
        const mensaje = (error.response?.data as { message?: string } | undefined)?.message;
        if (mensaje) return mensaje;
        if (!error.response) return "No hay conexión con el servidor.";
    }
    return porDefecto;
};

/** Administradores y proveedores. */
export const loginConPassword = async (email: string, password: string): Promise<Sesion> =>
    (await axios.post<Sesion>(`${API_BASE_URL}/auth/login`, { email, password })).data;

/** Clientes: envía un código de 6 dígitos al correo. */
export const solicitarCodigo = async (email: string): Promise<void> => {
    await axios.post(`${API_BASE_URL}/auth/codigo`, { email });
};

export const verificarCodigo = async (email: string, codigo: string): Promise<Sesion> =>
    (await axios.post<Sesion>(`${API_BASE_URL}/auth/codigo/verificar`, { email, codigo })).data;

/** Clientes: el ID token ("credential") que entrega el botón de Google. */
export const loginConGoogle = async (idToken: string): Promise<Sesion> =>
    (await axios.post<Sesion>(`${API_BASE_URL}/auth/google`, { idToken })).data;
