import React from 'react';
import {
    TableRow,
    TableCell,
    IconButton,
    Collapse,
    Typography,
    Box,
    Alert
} from '@mui/material';
import {
    Edit,
    KeyboardArrowDown,
    KeyboardArrowUp
} from '@mui/icons-material';
import {Cotizacion} from "../crear-cotizacion/service/interface.ts";

interface CotizacionRowProps {
    cotizacion: Cotizacion;
    expanded: boolean;
    onToggle: () => void;
    onEdit: (id: number | null) => void;
}

const CotizacionRow: React.FC<CotizacionRowProps> = ({
                                                         cotizacion,
                                                         expanded,
                                                         onToggle,
                                                         onEdit,
                                                     }) => {
    const campos = [
        { nombre: 'ganancia', label: 'Porcentaje de Ganancia', valor: cotizacion.ganancia },
        { nombre: 'descuento', label: 'Descuento', valor: cotizacion.descuento },
        { nombre: 'valorFlete', label: 'Valor Flete', valor: cotizacion.valorFlete },
        { nombre: 'valorInstalacion', label: 'Valor Instalación', valor: cotizacion.valorInstalacion },
        { nombre: 'otrosGastos', label: 'Otros Gastos', valor: cotizacion.otrosGastos },
        { nombre: 'valorOtrosGastos', label: 'Valor Otros Gastos', valor: cotizacion.valorOtrosGastos },
        { nombre: 'valorManoDeObra', label: 'Valor Mano de Obra', valor: cotizacion.valorManoDeObra },
        { nombre: 'totalm2', label: 'Total Metros Cuadrados', valor: cotizacion.totalm2 },
        { nombre: 'cantidadProductos', label: 'Cantidad Productos', valor: cotizacion.cantidadProductos },
        { nombre: 'cliente', label: 'cliente', valor: cotizacion?.cliente?.nombre },
    ];

    const camposNoNulos = campos.filter(campo => campo.valor !== null && campo.valor !== undefined);

    return (
        <>
            {/* Fila principal */}
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell sx={{
                    backgroundColor: "#f5f5f5",
                    width: 90,
                }}>
                    <IconButton aria-label="expand row" size="small" onClick={onToggle}>
                        {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                    {cotizacion.cotizacionId}
                </TableCell>
                <TableCell>{cotizacion.neto}</TableCell>
                <TableCell>{cotizacion.estado}</TableCell>
                <TableCell>{cotizacion.fecha}</TableCell>
                <TableCell>
                    <IconButton color="info" size="small" onClick={() => onEdit(cotizacion.cotizacionId)}>
                        <Edit />
                    </IconButton>
                </TableCell>
            </TableRow>

            {/* Fila expandida */}
            <TableRow>
                <TableCell sx={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse sx={{ mb: 3 }} in={expanded} timeout="auto" unmountOnExit>
                        {camposNoNulos.length === 0 ? (
                            <Alert severity="warning">No se encontraron Datos adicionales</Alert>
                        ) : (
                            <>
                                <Typography variant="h6" gutterBottom component="div">
                                    Datos adicionales
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 3, mb: 1, flexWrap: 'wrap' }}>
                                    {camposNoNulos.map((campo, index) => (
                                        <Typography key={index} variant="body2" color="text.secondary">
                                            <strong>{campo.label}:</strong> {campo.valor}
                                        </Typography>
                                    ))}
                                </Box>
                            </>
                        )}
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

export default CotizacionRow;
