import { useNavigate } from "react-router-dom";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Card, CardContent, Chip, Typography } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext.tsx";
import { ChipEstado } from "../solicitudes/ChipEstado.tsx";
import { TablaItems } from "../solicitudes/TablaItems.tsx";
import { useSolicitudes } from "../solicitudes/solicitudesService.ts";
import { formatoPesos, SERVICIOS, type Solicitud } from "../solicitudes/tipos.ts";

const etiquetaServicio = (valor: string) => SERVICIOS.find((s) => s.valor === valor)?.etiqueta ?? valor;

const formatoFecha = (iso: string) => new Date(iso).toLocaleDateString("es-CL");

const RespuestaEmpresa = ({ solicitud }: { solicitud: Solicitud }) => {
    const { respuesta, estado } = solicitud;
    if (!respuesta) return <Alert severity="info">La empresa aún no responde tu solicitud.</Alert>;

    const severidad = estado === "ACEPTADA" ? "success" : estado === "MODIFICADA" ? "info" : "error";
    const titulo = {
        ACEPTADA: "La empresa aceptó tu solicitud",
        MODIFICADA: "La empresa modificó tu solicitud",
        RECHAZADA: "La empresa rechazó tu solicitud",
        PENDIENTE: "",
    }[estado];

    return (
        <Alert severity={severidad} sx={{ "& .MuiAlert-message": { width: "100%" } }}>
            <Typography sx={{ fontWeight: 600 }}>{titulo} · {formatoFecha(respuesta.fecha)}</Typography>
            {respuesta.mensaje && <Typography variant="body2">{respuesta.mensaje}</Typography>}
            {respuesta.total !== null && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>Total: {formatoPesos(respuesta.total)}</Typography>
            )}
        </Alert>
    );
};

export const MisCotizaciones = () => {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const solicitudes = useSolicitudes()
        .filter((s) => s.usuario === usuario)
        .sort((a, b) => b.numero - a.numero);

    if (solicitudes.length === 0) {
        return (
            <Card>
                <CardContent sx={{ textAlign: "center", py: 6 }}>
                    <Typography variant="h6" gutterBottom>Aún no has solicitado cotizaciones</Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Cuando envíes tu carrito a la empresa, verás aquí su respuesta.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate("/cliente/disenar")}>Diseñar una ventana</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Box>
            {solicitudes.map((solicitud, indice) => (
                <Accordion key={solicitud.numero} defaultExpanded={indice === 0} disableGutters>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", width: "100%" }}>
                            <Typography sx={{ fontWeight: 600 }}>Cotización N°{solicitud.numero}</Typography>
                            <Typography variant="body2" color="text.secondary">{formatoFecha(solicitud.fecha)}</Typography>
                            <ChipEstado estado={solicitud.estado} />
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <RespuestaEmpresa solicitud={solicitud} />

                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                            <Typography variant="body2" color="text.secondary">Servicios:</Typography>
                            {solicitud.servicios.map((s) => <Chip key={s} size="small" variant="outlined" label={etiquetaServicio(s)} />)}
                        </Box>

                        {solicitud.itemsOriginales && (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>Lo que solicitaste</Typography>
                                <TablaItems items={solicitud.itemsOriginales} />
                            </Box>
                        )}
                        <Box>
                            {solicitud.itemsOriginales && <Typography variant="subtitle2" gutterBottom>Propuesta de la empresa</Typography>}
                            <TablaItems items={solicitud.items} />
                        </Box>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};
