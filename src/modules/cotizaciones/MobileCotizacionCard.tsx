// MobileCotizacionCard.tsx
import {
    Card as MuiCard,
    CardContent,
    Typography,
    Chip,
    CardActions,
    IconButton,
    Collapse,
    Divider,
    Box,
    Button
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Cotizacion } from "../crear-cotizacion/service/interface";

interface MobileCotizacionCardProps {
    cotizacion: Cotizacion;
    expanded: boolean;
    onToggle: () => void;
}

export const MobileCotizacionCard = ({
                                         cotizacion,
                                         expanded,
                                         onToggle
                                     }: MobileCotizacionCardProps) => {
    return (
        <MuiCard sx={{ mb: 2 }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" component="div">
                        ID: {cotizacion.cotizacionId}
                    </Typography>
                    <Chip
                        label={cotizacion.estado}
                        color={
                            cotizacion.estado === 'Aprobada' ? 'success' :
                                cotizacion.estado === 'Rechazada' ? 'error' : 'default'
                        }
                        size="small"
                    />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Fecha: {cotizacion.fecha}
                </Typography>

                <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                    Neto: ${cotizacion.neto?.toLocaleString()}
                </Typography>
            </CardContent>

            <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                <Button size="small">Acciones</Button>
                <IconButton size="small" onClick={onToggle}>
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </CardActions>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                        <Typography variant="body2">
                            <strong>Ganancia:</strong> ${cotizacion.ganancia?.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Descuento:</strong> ${cotizacion.descuento?.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Flete:</strong> ${cotizacion.valorFlete?.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Instalación:</strong> ${cotizacion.valorInstalacion?.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Mano de obra:</strong> ${cotizacion.valorManoDeObra?.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Otros gastos:</strong> ${cotizacion.valorOtrosGastos?.toLocaleString()}
                        </Typography>
                    </Box>

                    {cotizacion.condiciones && (
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            <strong>Condiciones:</strong> {cotizacion.condiciones}
                        </Typography>
                    )}

                    <Typography variant="body2" sx={{ mt: 2 }}>
                        <strong>Total m²:</strong> {cotizacion.totalm2}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Cantidad productos:</strong> {cotizacion.cantidadProductos}
                    </Typography>
                </CardContent>
            </Collapse>
        </MuiCard>
    );
};