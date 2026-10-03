import { Box, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";

export const EncabezadoPagina = () => {
    const location = useLocation();

    const paginas: Record<string, { titulo: string; subtitulo: string }> = {
        "/inicio": {
            titulo: "Inicio",
            subtitulo: "Accede rápidamente a los distintos módulos del sistema y visualiza las funcionalidades disponibles para la gestión de cotizaciones, clientes and productos.",
        },
        "/cotizacion": {
            titulo: "Crear Cotización",
            subtitulo: "Genera una nueva cotización seleccionando series, perfiles, vidrios, colores y accesorios para calcular automáticamente los valores del proyecto.",
        },
        "/cotizaciones": {
            titulo: "Cotizaciones",
            subtitulo: "Consulta, edita y administra todas las cotizaciones registradas, revisando sus detalles, estados y valores asociados.",
        },
        "/clientes": {
            titulo: "Clientes",
            subtitulo: "Administra la información de tus clientes, manteniendo actualizados sus datos para agilizar la creación y seguimiento de cotizaciones.",
        },
        "/pautas": {
            titulo: "Pautas",
            subtitulo: "Gestiona las pautas disponibles en el sistema, definiendo sus características, configuraciones e imágenes asociadas.",
        },
        "/tipo-pautas": {
            titulo: "Tipos de Pauta",
            subtitulo: "Crea y administra las categorías de pautas utilizadas para clasificar y organizar los distintos productos disponibles.",
        },
        "/perfil": {
            titulo: "Perfiles",
            subtitulo: "Mantén actualizado el catálogo de perfiles utilizados en la fabricación, incluyendo dimensiones, pesos y configuraciones especiales.",
        },
        "/tipo-perfil": {
            titulo: "Tipos de Perfil",
            subtitulo: "Administra las categorías de perfiles para facilitar la organización y selección de componentes en las cotizaciones.",
        },
        "/vidrios": {
            titulo: "Vidrios",
            subtitulo: "Gestiona los distintos tipos de vidrio disponibles, configurando espesores, características y valores utilizados en los cálculos.",
        },
        "/colores": {
            titulo: "Colores",
            subtitulo: "Administra los colores disponibles para perfiles y productos, permitiendo una correcta personalización de las cotizaciones.",
        },
        "/series": {
            titulo: "Series",
            subtitulo: "Configura y administra las series de productos utilizadas en el sistema para organizar y administrar las distintas soluciones ofrecidas.",
        },
        "/quincalleria": {
            titulo: "Quincallería",
            subtitulo: "Administra accesorios, herrajes y componentes complementarios que pueden ser incorporados a los productos cotizados.",
        },
        "/accesorios": {
            titulo: "Venta al Publico",
            subtitulo: "Catálogo general de herrajes, accesorios y complementos.",
        },
        "/realidad-aumentada": {
            titulo: "Realidad Aumentada",
            subtitulo: "Visualiza una ventana a escala real en tu espacio usando la cámara del teléfono.",
        },
        "/cliente/disenar": {
            titulo: "Diseñar Ventana",
            subtitulo: "Elige una pauta, ingresa las medidas y elige el color y el vidrio de tu ventana; mírala en realidad aumentada sobre tu pared y agrégala al carrito.",
        },
        "/cliente/carrito": {
            titulo: "Carrito",
            subtitulo: "Revisa las ventanas que quieres cotizar y envía tu solicitud a la empresa indicando los servicios que necesitas.",
        },
        "/cliente/mis-cotizaciones": {
            titulo: "Mis Cotizaciones",
            subtitulo: "Sigue el estado de tus solicitudes y revisa la respuesta de la empresa.",
        },
        "/empresa/solicitudes": {
            titulo: "Solicitudes de Cotización",
            subtitulo: "Recibe las solicitudes de los clientes, define precios y acepta, modifica o rechaza cada una; el cliente es informado en la app o por correo.",
        },
    };

    const paginaActual = paginas[location.pathname] ?? {
        titulo: "Glass Maipo",
        subtitulo: "",
    };

    return (
        <Box
            sx={{
                width: "100%",
                px: { xs: 3, md: 4 },
                // CORRECCIÓN: pt: 11 (88px) da el espacio perfecto para librar los 64px del Header fijo + 24px de margen limpio
                pt: { xs: 11, md: 11 },
                pb: 2.5,
                backgroundColor: "#edf2f7",
                borderBottom: "1px solid #cbd5e0",
            }}
        >
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 700,
                    color: "#1a2332",
                    letterSpacing: "-0.5px"
                }}
            >
                {paginaActual.titulo}
            </Typography>

            {paginaActual.subtitulo && (
                <Typography
                    variant="body2"
                    sx={{
                        mt: 0.8,
                        maxWidth: "850px",
                        lineHeight: 1.6,
                        color: "#4a5568"
                    }}
                >
                    {paginaActual.subtitulo}
                </Typography>
            )}
        </Box>
    );
};
