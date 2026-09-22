import {useEffect, useState} from 'react';
import { Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import {theme} from './components/theme.ts'
import { Encabezado } from './components/Encabezado/Encabezado';
import { MenuLateral } from './components/MenuLateral';
import { CrearCotizacion } from './modules/crear-cotizacion/CrearCotizacion';
import CotizacionRapida from './modules/CotizacionRapida';
import {NuevoColor} from './modules/color/NuevoColor';
import { Login } from './modules/login/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import useWindowDimensions from "./hooks/useWindowDimensions.ts";
import {NuevoCliente} from "./modules/clientes/NuevoCliente.tsx";
import {NuevoVidrios} from "./modules/vidrios/NuevoVidrios.tsx";
import {NuevoSerie} from "./modules/serie/NuevoSerie.tsx";
import {NuevoCotizaciones} from "./modules/cotizaciones/NuevoCotizaciones.tsx";
import {TipoPerfil} from "./modules/tipo-perfil/TipoPerfil.tsx";
import {Perfil} from "./modules/perfil/Perfil.tsx";
import {NuevoPautas} from "./modules/crud-pautas/NuevoPautas.tsx";
import {Quincalleria} from "./modules/quincalleria/Quincalleria.tsx";
import {TipoPauta} from "./modules/tipo-pauta/TipoPauta.tsx";
import NuevoInicio from "./modules/inicio/NuevoInicio.tsx";
import {EncabezadoPagina} from "./components/EncabezadoPagina.tsx";
import {Footer} from "./components/Footer.tsx";
import {Accesorios} from "./modules/accesorios/Accesorios.tsx";
import {RealidadAumentada} from "./modules/realidad-aumentada/RealidadAumentada.tsx";

const AppContent = () => {
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const { isAuthenticated } = useAuth();
    const { width } = useWindowDimensions();
    const isMobile = width < 960;

    useEffect(() => {
        setMenuOpen(!isMobile);
    }, [isMobile]);

    if (!isAuthenticated) {
        return <Login />;
    }

    const drawerWidth = 240; // Ajustado exactamente al de tu componente menú

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Header Fijo */}
            <Encabezado isMobile={isMobile} onOpenMenu={() => setMenuOpen(true)} />

            {/* Menú Lateral */}
            <MenuLateral open={menuOpen} onClose={() => setMenuOpen(false)} width={drawerWidth} />

            {/* Contenedor Único Derecha: Contenido + Footer */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    // Compensación exacta del menú fijo lateral
                    ml: isMobile ? 0 : `${drawerWidth}px`,
                    width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`,
                }}
            >

                <EncabezadoPagina />

                {/* Área de Trabajo de las Rutas */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: { xs: 2, sm: 3, md: 4 },
                    }}
                >
                    <Routes>
                        <Route path="/inicio" element={<ProtectedRoute><NuevoInicio /></ProtectedRoute>} />
                        <Route path="/" element={<Navigate to="/inicio" />} />
                        <Route path="/cotizacion" element={<ProtectedRoute><CrearCotizacion /></ProtectedRoute>} />
                        <Route path="/clientes" element={<ProtectedRoute><NuevoCliente /></ProtectedRoute>} />
                        <Route path="/cotizacion-rapida" element={<ProtectedRoute><CotizacionRapida /></ProtectedRoute>} />
                        <Route path="/pautas" element={<ProtectedRoute><NuevoPautas /></ProtectedRoute>} />
                        <Route path="/cotizaciones" element={<ProtectedRoute><NuevoCotizaciones /></ProtectedRoute>} />
                        <Route path="/vidrios" element={<ProtectedRoute><NuevoVidrios /></ProtectedRoute>} />
                        <Route path="/colores" element={<ProtectedRoute><NuevoColor /></ProtectedRoute>} />
                        <Route path="/series" element={<ProtectedRoute><NuevoSerie /></ProtectedRoute>} />
                        <Route path="/tipo-perfil" element={<ProtectedRoute><TipoPerfil /></ProtectedRoute>} />
                        <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
                        <Route path="/quincalleria" element={<ProtectedRoute><Quincalleria /></ProtectedRoute>} />
                        <Route path="/tipo-pautas" element={<ProtectedRoute><TipoPauta /></ProtectedRoute>} />
                        <Route path="/accesorios" element={<ProtectedRoute><Accesorios /></ProtectedRoute>} />
                        <Route path="/realidad-aumentada" element={<ProtectedRoute><RealidadAumentada /></ProtectedRoute>} />
                    </Routes>
                </Box>

                {/* Footer perfectamente anclado abajo */}
                <Footer />
            </Box>
        </Box>
    );
};


const App = () => {
    return (
        <HashRouter>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </ThemeProvider>
        </HashRouter>
    );
};

export default App;