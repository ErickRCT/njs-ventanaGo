import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Menu,
    MenuItem,
    Box,
    Typography,
    Avatar,
    Badge,
} from '@mui/material';
import { Settings, Notifications, Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import {
    DESTINATARIO_EMPRESA, destinatarioCliente, marcarAvisosLeidos, useAvisos,
} from '../../modules/solicitudes/solicitudesService.ts';

interface EncabezadoProps {
    isMobile: boolean;
    onOpenMenu: () => void;
}

export const Encabezado: React.FC<EncabezadoProps> = ({ isMobile, onOpenMenu }) => {
    const [anchorElSettings, setAnchorElSettings] = useState<null | HTMLElement>(null);
    const [anchorElNotifications, setAnchorElNotifications] = useState<null | HTMLElement>(null);
    const [anchorElProfile, setAnchorElProfile] = useState<null | HTMLElement>(null);
    const { logout, rol, usuario } = useAuth();
    const navigate = useNavigate();

    // Los avisos son de la empresa (solicitudes nuevas) o del cliente (respuestas); el administrador no recibe.
    const destinatario = rol === 'empresa' ? DESTINATARIO_EMPRESA : rol === 'cliente' ? destinatarioCliente(usuario) : null;
    const avisos = useAvisos(destinatario ?? '');
    const sinLeer = avisos.filter((aviso) => !aviso.leido).length;
    const rutaAvisos = rol === 'empresa' ? '/empresa/solicitudes' : '/cliente/mis-cotizaciones';

    const cerrarAvisos = () => {
        setAnchorElNotifications(null);
        if (destinatario) marcarAvisosLeidos(destinatario);
    };

    const handleMenuOpen = (
        event: React.MouseEvent<HTMLButtonElement>,
        setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>
    ) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (
        setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>
    ) => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleMenuClose(setAnchorElProfile);
    };

    return (
        <AppBar
            position="fixed"
            elevation={0} // Eliminamos la sombra por defecto de MUI
            sx={{
                backgroundColor: '#ffffff !important', // Forzamos el color blanco premium
                borderBottom: '1px solid #e2e8f0', // Línea inferior sutil
                zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* El botón de hamburguesa solo aparece en móviles */}
                    {isMobile && (
                        <IconButton
                            aria-label="open drawer"
                            edge="start"
                            onClick={onOpenMenu}
                            sx={{ mr: 2, color: '#4a5568' }}
                        >
                            {React.createElement(MenuIcon)}
                        </IconButton>
                    )}

                    {/* CORRECCIÓN: El nombre ahora SE MUESTRA SIEMPRE (Quitamos la condición isMobile) */}
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#1a2332',
                            fontWeight: 700,
                            letterSpacing: '0.3px'
                        }}
                    >
                        Glass Maipo
                    </Typography>
                </Box>

                {/* Bloque de acciones del lado derecho */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>

                    {/* Configuración */}
                    <IconButton
                        onClick={(e) => handleMenuOpen(e, setAnchorElSettings)}
                        sx={{ color: '#4a5568', '&:hover': { backgroundColor: '#f7fafc' } }}
                    >
                        {React.createElement(Settings, { fontSize: "medium" })}
                    </IconButton>
                    <Menu
                        anchorEl={anchorElSettings}
                        open={Boolean(anchorElSettings)}
                        onClose={() => handleMenuClose(setAnchorElSettings)}
                    >
                        <MenuItem onClick={() => handleMenuClose(setAnchorElSettings)}>Configuración 1</MenuItem>
                        <MenuItem onClick={() => handleMenuClose(setAnchorElSettings)}>Configuración 2</MenuItem>
                    </Menu>

                    {/* Notificaciones */}
                    <IconButton
                        onClick={(e) => handleMenuOpen(e, setAnchorElNotifications)}
                        sx={{ color: '#4a5568', '&:hover': { backgroundColor: '#f7fafc' } }}
                    >
                        <Badge badgeContent={sinLeer} color="error">
                            {React.createElement(Notifications, { fontSize: "medium" })}
                        </Badge>
                    </IconButton>
                    <Menu
                        anchorEl={anchorElNotifications}
                        open={Boolean(anchorElNotifications)}
                        onClose={cerrarAvisos}
                        PaperProps={{ sx: { maxWidth: 360, maxHeight: 400 } }}
                    >
                        {avisos.length === 0 && <MenuItem disabled>Sin notificaciones</MenuItem>}
                        {avisos.map((aviso) => (
                            <MenuItem
                                key={aviso.id}
                                onClick={() => {
                                    cerrarAvisos();
                                    navigate(rutaAvisos);
                                }}
                                sx={{ whiteSpace: 'normal', alignItems: 'flex-start' }}
                            >
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: aviso.leido ? 400 : 700 }}>
                                        {aviso.titulo}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        {aviso.mensaje}
                                    </Typography>
                                </Box>
                            </MenuItem>
                        ))}
                    </Menu>

                    {/* Perfil del usuario */}
                    <IconButton
                        onClick={(e) => handleMenuOpen(e, setAnchorElProfile)}
                        sx={{ ml: 1, p: 0 }}
                    >
                        <Avatar sx={{
                            bgcolor: '#2d3748',
                            width: 36,
                            height: 36,
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#ffffff'
                        }}>
                            {usuario.slice(0, 2).toUpperCase()}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorElProfile}
                        open={Boolean(anchorElProfile)}
                        onClose={() => handleMenuClose(setAnchorElProfile)}
                    >
                        <MenuItem onClick={() => handleMenuClose(setAnchorElProfile)}>Perfil</MenuItem>
                        <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};
