import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import { RUTA_INICIAL, useAuth } from '../../context/AuthContext.tsx';
import { loginConPassword, mensajeDeError } from '../../context/authApi.ts';

const ROL_FRONT = { ADMIN: 'admin', CLIENTE: 'cliente', PROVEEDOR: 'empresa' } as const;

/**
 * Usuario y contraseña para todos los roles.
 * El backend también acepta códigos por correo y Google (authApi.ts, BotonGoogle.tsx) por si se vuelven a mostrar.
 */
export const Login = () => {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setCargando(true);
        try {
            const sesion = await loginConPassword(usuario, password);
            login(sesion);
            navigate(RUTA_INICIAL[ROL_FRONT[sesion.cuenta.rol]]);
        } catch (err) {
            setError(mensajeDeError(err));
        } finally {
            setCargando(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                px: 2,
                backgroundImage: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
            }}
        >
            <Box
                component="form"
                onSubmit={(e) => void handleSubmit(e)}
                sx={{
                    padding: { xs: 3, sm: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    width: '100%',
                    maxWidth: 400,
                    backgroundColor: 'white',
                    borderRadius: 2,
                    boxShadow: 3,
                }}
            >
                <Typography variant="h4" align="center">
                    Iniciar Sesión
                </Typography>
                <TextField
                    label="Usuario"
                    autoComplete="username"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    fullWidth
                    required
                    autoFocus
                />
                <TextField
                    label="Contraseña"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    required
                />
                <Button type="submit" variant="contained" fullWidth disabled={cargando || !usuario.trim() || !password}>
                    Ingresar
                </Button>

                {error && <Alert severity="error">{error}</Alert>}
            </Box>
        </Box>
    );
};
