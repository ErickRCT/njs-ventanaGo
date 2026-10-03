import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Rol, RUTA_INICIAL, useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
    /** Roles que pueden entrar; el administrador siempre puede. Sin esta lista basta con haber iniciado sesión. */
    roles?: Rol[];
}

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
    const { isAuthenticated, rol } = useAuth();

    if (!isAuthenticated || !rol) {
        return <Navigate to="/login" replace />;
    }

    if (roles && rol !== 'admin' && !roles.includes(rol)) {
        return <Navigate to={RUTA_INICIAL[rol]} replace />;
    }

    return <>{children}</>;
};
