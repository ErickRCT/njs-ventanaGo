import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext.tsx'; // Importar el contexto de autenticación

export const Login = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();
    const { login } = useAuth(); // Obtener la función login del contexto

    const handleLogin = () => {
        // Datos en duro para la autenticación
        if (username === 'admin' && password === 'admin') {
            login(); // Llamar a la función login del contexto
            navigate('/inicio'); // Redirigir al inicio
        } else {
            setError('Usuario o contraseña incorrectos');
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundImage: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
            }}
        >
            <Box
                sx={{
                    padding: 4,
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
                <Typography variant="h4" align="center" gutterBottom>
                    Iniciar Sesión
                </Typography>
                <TextField
                    label="Usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                />
                {error && (
                    <Typography color="error" align="center">
                        {error}
                    </Typography>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleLogin}
                    fullWidth
                >
                    Ingresar
                </Button>
            </Box>
        </Box>
    );
};