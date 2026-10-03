import React, { useEffect, useState } from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Toolbar,
    Box,
    Typography,
    Collapse,
    Badge
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
    ViewInAr,
    AdminPanelSettings,
    Person,
    Business,
    ShoppingCart,
    History,
    Inbox,
    ExpandLess,
    ExpandMore
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import useWindowDimensions from '../hooks/useWindowDimensions';
import { Rol, useAuth } from '../context/AuthContext';
import { useCarrito, useSolicitudes } from '../modules/solicitudes/solicitudesService';

interface ItemMenu {
    text: string;
    icon: React.ElementType;
    path: string;
    /** Cantidad pendiente que se muestra como insignia. */
    insignia?: number;
}

interface GrupoMenu {
    id: string;
    titulo: string;
    icon: React.ElementType;
    /** Roles que ven el grupo. */
    roles: Rol[];
    items: ItemMenu[];
}

// Todos los módulos que ya existían quedan dentro del grupo Administrador.
const itemsAdministrador: ItemMenu[] = [
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
    const { rol, usuario } = useAuth();
    const carrito = useCarrito(usuario);
    const solicitudes = useSolicitudes();

    const grupos: GrupoMenu[] = [
        { id: 'administrador', titulo: 'Administrador', icon: AdminPanelSettings, roles: ['admin'], items: itemsAdministrador },
        {
            id: 'cliente', titulo: 'Cliente', icon: Person, roles: ['admin', 'cliente'],
            items: [
                { text: 'Diseñar Ventana', icon: ViewInAr, path: '/cliente/disenar' },
                { text: 'Carrito', icon: ShoppingCart, path: '/cliente/carrito', insignia: carrito.length },
                { text: 'Mis Cotizaciones', icon: History, path: '/cliente/mis-cotizaciones' },
            ],
        },
        {
            id: 'empresa', titulo: 'Empresa', icon: Business, roles: ['admin', 'empresa'],
            items: [
                {
                    text: 'Solicitudes', icon: Inbox, path: '/empresa/solicitudes',
                    insignia: solicitudes.filter((s) => s.estado === 'PENDIENTE').length,
                },
            ],
        },
    ];
    const gruposVisibles = grupos.filter((grupo) => rol !== null && grupo.roles.includes(rol));

    // Al llegar a una página se abre su grupo; después el usuario puede plegarlo o abrir otros.
    const [abiertos, setAbiertos] = useState<Record<string, boolean>>({});
    useEffect(() => {
        const grupoActual = grupos.find((g) => g.items.some((item) => item.path === location.pathname));
        if (grupoActual) setAbiertos((previo) => ({ ...previo, [grupoActual.id]: true }));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- los grupos se recalculan en cada render; solo importa la ruta
    }, [location.pathname]);
    const alternarGrupo = (id: string) => setAbiertos((previo) => ({ ...previo, [id]: !previo[id] }));

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

            <List sx={{ px: 1.5, py: 1, flexGrow: 1, overflowY: 'auto' }}>
                {gruposVisibles.map((grupo) => {
                    const grupoActivo = grupo.items.some((item) => item.path === location.pathname);
                    const expandido = Boolean(abiertos[grupo.id]);
                    return (
                        <React.Fragment key={grupo.id}>
                            <ListItem disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => alternarGrupo(grupo.id)}
                                    aria-expanded={expandido}
                                    sx={{
                                        borderRadius: '8px',
                                        py: 1,
                                        px: 2,
                                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: grupoActivo ? '#b3e5fc' : 'rgba(255, 255, 255, 0.7)' }}>
                                        {React.createElement(grupo.icon, { fontSize: 'small' })}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={grupo.titulo}
                                        primaryTypographyProps={{
                                            fontSize: '0.875rem',
                                            fontWeight: 700,
                                            color: '#ffffff',
                                        }}
                                    />
                                    {React.createElement(expandido ? ExpandLess : ExpandMore, {
                                        fontSize: 'small',
                                        sx: { color: 'rgba(255, 255, 255, 0.7)' },
                                    })}
                                </ListItemButton>
                            </ListItem>

                            <Collapse in={expandido} timeout="auto" unmountOnExit>
                                <List disablePadding sx={{ mb: 1 }}>
                                    {grupo.items.map((item) => {
                                        const isActive = location.pathname === item.path;
                                        return (
                                            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                                                <ListItemButton
                                                    onClick={() => {
                                                        navigate(item.path);
                                                        if (isMobile) onClose();
                                                    }}
                                                    sx={{
                                                        borderRadius: '8px',
                                                        py: 1,
                                                        pl: 3,
                                                        pr: 2,
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
                                                        <Badge badgeContent={item.insignia} color="error" max={99}>
                                                            {React.createElement(item.icon, { fontSize: 'small' })}
                                                        </Badge>
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
                            </Collapse>
                        </React.Fragment>
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
