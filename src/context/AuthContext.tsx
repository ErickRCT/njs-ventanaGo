import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import type { RolBackend, Sesion } from './authApi.ts';

export type Rol = 'admin' | 'cliente' | 'empresa';

/** Rol del backend -> rol de las pantallas. Los proveedores (empresas y particulares) usan el panel de empresa. */
const ROL_FRONT: Record<RolBackend, Rol> = { ADMIN: 'admin', CLIENTE: 'cliente', PROVEEDOR: 'empresa' };

/** Página a la que llega cada rol al entrar. */
export const RUTA_INICIAL: Record<Rol, string> = {
    admin: '/inicio',
    cliente: '/cliente/disenar',
    empresa: '/empresa/solicitudes',
};

const CLAVE_SESION = 'sesion';
// Claves de la sesión anterior, cuando el rol se guardaba sin token.
const CLAVES_ANTIGUAS = ['isAuthenticated', 'rol', 'usuario'];

interface AuthContextType {
    isAuthenticated: boolean;
    rol: Rol | null;
    /** Correo de la cuenta; identifica el carrito y las solicitudes del usuario. */
    usuario: string;
    nombre: string | null;
    login: (sesion: Sesion) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Todas las llamadas al backend usan la instancia global de axios. Los interceptores se instalan una vez aquí
// (y no en un efecto) para que ya estén activos en las primeras peticiones que hacen las páginas al montarse.
let tokenActual: string | null = null;
let cerrarSesion: () => void = () => undefined;

axios.interceptors.request.use((config) => {
    if (tokenActual) config.headers.Authorization = `Bearer ${tokenActual}`;
    return config;
});
// Si el backend rechaza el token (vencido o revocado), se cierra la sesión y ProtectedRoute lleva al login.
axios.interceptors.response.use(undefined, (error) => {
    if (tokenActual && axios.isAxiosError(error) && error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
        cerrarSesion();
    }
    return Promise.reject(error);
});

const leerSesion = (): Sesion | null => {
    CLAVES_ANTIGUAS.forEach((clave) => localStorage.removeItem(clave));
    try {
        const guardada = JSON.parse(localStorage.getItem(CLAVE_SESION) ?? 'null') as Sesion | null;
        return guardada && guardada.token && guardada.expiraEn > Date.now() ? guardada : null;
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [sesion, setSesion] = useState<Sesion | null>(() => {
        const inicial = leerSesion();
        tokenActual = inicial?.token ?? null;
        return inicial;
    });

    const login = (nueva: Sesion) => {
        localStorage.setItem(CLAVE_SESION, JSON.stringify(nueva));
        tokenActual = nueva.token;
        setSesion(nueva);
    };

    const logout = () => {
        localStorage.removeItem(CLAVE_SESION);
        tokenActual = null;
        setSesion(null);
    };
    cerrarSesion = logout;

    // Al vencer el token la sesión se cierra sola.
    useEffect(() => {
        if (!sesion) return;
        const vence = window.setTimeout(logout, Math.max(0, sesion.expiraEn - Date.now()));
        return () => window.clearTimeout(vence);
    }, [sesion]);

    const value: AuthContextType = {
        isAuthenticated: sesion !== null,
        rol: sesion ? ROL_FRONT[sesion.cuenta.rol] : null,
        usuario: sesion?.cuenta.email ?? '',
        nombre: sesion?.cuenta.nombre ?? null,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};
