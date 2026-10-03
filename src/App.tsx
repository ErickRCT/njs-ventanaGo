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
import { AuthProvider, RUTA_INICIAL, useAuth } from './context/AuthContext';
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
import {DisenarVentana} from "./modules/cliente/DisenarVentana.tsx";
import {Carrito} from "./modules/cliente/Carrito.tsx";
import {MisCotizaciones} from "./modules/cliente/MisCotizaciones.tsx";
import {SolicitudesEmpresa} from "./modules/empresa/SolicitudesEmpresa.tsx";

const AppContent = () => {
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const { isAuthenticated, rol } = useAuth();
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
                        <Route path="/" element={<Navigate to={rol ? RUTA_INICIAL[rol] : "/inicio"} />} />

                        {/* Administrador: todos los módulos de gestión */}
                        <Route path="/inicio" element={<ProtectedRoute roles={['admin']}><NuevoInicio /></ProtectedRoute>} />
                        <Route path="/cotizacion" element={<ProtectedRoute roles={['admin']}><CrearCotizacion /></ProtectedRoute>} />
                        <Route path="/clientes" element={<ProtectedRoute roles={['admin']}><NuevoCliente /></ProtectedRoute>} />
                        <Route path="/cotizacion-rapida" element={<ProtectedRoute roles={['admin']}><CotizacionRapida /></ProtectedRoute>} />
                        <Route path="/pautas" element={<ProtectedRoute roles={['admin']}><NuevoPautas /></ProtectedRoute>} />
                        <Route path="/cotizaciones" element={<ProtectedRoute roles={['admin']}><NuevoCotizaciones /></ProtectedRoute>} />
                        <Route path="/vidrios" element={<ProtectedRoute roles={['admin']}><NuevoVidrios /></ProtectedRoute>} />
                        <Route path="/colores" element={<ProtectedRoute roles={['admin']}><NuevoColor /></ProtectedRoute>} />
                        <Route path="/series" element={<ProtectedRoute roles={['admin']}><NuevoSerie /></ProtectedRoute>} />
                        <Route path="/tipo-perfil" element={<ProtectedRoute roles={['admin']}><TipoPerfil /></ProtectedRoute>} />
                        <Route path="/perfil" element={<ProtectedRoute roles={['admin']}><Perfil /></ProtectedRoute>} />
                        <Route path="/quincalleria" element={<ProtectedRoute roles={['admin']}><Quincalleria /></ProtectedRoute>} />
                        <Route path="/tipo-pautas" element={<ProtectedRoute roles={['admin']}><TipoPauta /></ProtectedRoute>} />
                        <Route path="/accesorios" element={<ProtectedRoute roles={['admin']}><Accesorios /></ProtectedRoute>} />
                        <Route path="/realidad-aumentada" element={<ProtectedRoute roles={['admin']}><RealidadAumentada /></ProtectedRoute>} />

                        {/* Cliente: diseña ventanas, las ve en RA, arma su carrito y pide cotización */}
                        <Route path="/cliente/disenar" element={<ProtectedRoute roles={['cliente']}><DisenarVentana /></ProtectedRoute>} />
                        <Route path="/cliente/carrito" element={<ProtectedRoute roles={['cliente']}><Carrito /></ProtectedRoute>} />
                        <Route path="/cliente/mis-cotizaciones" element={<ProtectedRoute roles={['cliente']}><MisCotizaciones /></ProtectedRoute>} />

                        {/* Empresa: recibe las solicitudes y las acepta, modifica o rechaza */}
                        <Route path="/empresa/solicitudes" element={<ProtectedRoute roles={['empresa']}><SolicitudesEmpresa /></ProtectedRoute>} />
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