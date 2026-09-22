import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Toolbar,
    Box,
    Typography
} from '@mui/material';
import {
    Home,
    AddBox,
    Group,
    ViewAgenda,
    Assignment,
    Window,
    Palette,
    ViewList,
    AccountTree,
    CropFree,
    DesignServices,
    ViewInAr
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import useWindowDimensions from '../hooks/useWindowDimensions';

const menuItems = [
    { text: 'Inicio', icon: Home, path: '/inicio' },
    { text: 'Venta al Publico', icon: ViewList, path: '/accesorios' },
    { text: 'Crear Cotización', icon: AddBox, path: '/cotizacion' },
    { text: 'Cotizaciones', icon: Assignment, path: '/cotizaciones' },
    { text: 'Clientes', icon: Group, path: '/clientes' },
    { text: 'Pautas', icon: ViewAgenda, path: '/pautas' },
    { text: 'Tipo Pautas', icon: ViewAgenda, path: '/tipo-pautas' },
    { text: 'Perfil', icon: CropFree, path: '/perfil' },
    { text: 'Tipo Perfil', icon: AccountTree, path: '/tipo-perfil' },
    { text: 'Quincalleria', icon: DesignServices, path: '/quincalleria' },
    { text: 'Vidrios', icon: Window, path: '/vidrios' },
    { text: 'Colores', icon: Palette, path: '/colores' },
    { text: 'Series', icon: ViewList, path: '/series' },
    { text: 'Realidad Aumentada', icon: ViewInAr, path: '/realidad-aumentada' },

];

interface MenuLateralProps {
    open: boolean;
    onClose: () => void;
    width?: number;
}

export const MenuLateral: React.FC<MenuLateralProps> = ({ open, onClose, width = 240 }) => {
    const { width: windowWidth } = useWindowDimensions();
    const isMobile = windowWidth < 960;
    const navigate = useNavigate();
    const location = useLocation();

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Espaciador para evitar que el Header fijo tape el menú */}
            <Toolbar sx={{ justifyContent: 'center', py: 1 }}>
                {!isMobile && (
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff', letterSpacing: '0.5px' }}>
                        Glass Maipo
                    </Typography>
                )}
            </Toolbar>

            <List sx={{ px: 1.5, py: 1, flexGrow: 1 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) onClose();
                                }}
                                sx={{
                                    borderRadius: '8px',
                                    py: 1,
                                    px: 2,
                                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                    borderLeft: isActive ? '4px solid #b3e5fc' : '4px solid transparent',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{
                                    minWidth: 40,
                                    color: isActive ? '#b3e5fc' : 'rgba(255, 255, 255, 0.7)'
                                }}>
                                    {React.createElement(item.icon, { fontSize: 'small' })}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: '0.875rem',
                                        fontWeight: isActive ? 600 : 400,
                                        color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );

    return (
        <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            open={open}
            onClose={onClose}
            anchor="left"
            PaperProps={{
                sx: {
                    width: width,
                    boxSizing: 'border-box',
                    backgroundColor: '#1a2332', // Azul oscuro premium refinado
                    borderRight: 'none',
                    boxShadow: '4px 0px 10px rgba(0, 0, 0, 0.05)'
                },
            }}
        >
            {drawerContent}
        </Drawer>
    );
};
