import { Box, Typography } from "@mui/material";

export const Footer = () => (
    <Box
        component="footer"
        sx={{
            height: 50, // Un poco más compacto y elegante
            borderTop: "1px solid #e2e8f0",
            bgcolor: "#f1f3f5", // Gris sutil mate acorde al resultado final planteado
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 4,
            mt: "auto" // Asegura empujar el footer al fondo si hay poco contenido
        }}
    >
        <Typography variant="caption" sx={{ color: "#718096", fontWeight: 500 }}>
            © 2026 Glass Maipo, S.A.
        </Typography>

        <Typography variant="caption" sx={{ color: "#718096", fontWeight: 500 }}>
            Sistema de Gestión de Cotizaciones
        </Typography>
    </Box>
);
