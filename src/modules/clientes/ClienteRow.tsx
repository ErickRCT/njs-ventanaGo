import React from 'react';
import {
    Box,
    Collapse,
    IconButton,
    TableCell,
    TableRow,
    Typography,
} from '@mui/material';

import {
    Edit,
    KeyboardArrowDown,
    KeyboardArrowUp
} from '@mui/icons-material';
import {Cliente} from "../../components/service/inteface.ts";

interface ClienteRowProps {
    cliente: Cliente;
    expanded: boolean;
    onToggle: () => void;
}

const ClienteRow: React.FC<ClienteRowProps> = ({ cliente, expanded, onToggle }) => {
    return (
        <>
            {/* Fila principal */}
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={onToggle}>
                        {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                    {cliente.rut}
                </TableCell>
                <TableCell>{cliente.nombre}</TableCell>
                <TableCell>{cliente.direccion}</TableCell>
                <TableCell>{cliente.telefono}</TableCell>
                <TableCell>
                    <IconButton color="info" size="small">
                        <Edit />
                    </IconButton>
                </TableCell>
            </TableRow>

            {/* Fila expandida */}
            <TableRow>
                <TableCell sx={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Typography variant="h6" gutterBottom component="div">
                            Datos adicionales
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Email:</strong> {cliente.email}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Comuna:</strong> {cliente.comuna?.nombre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Región:</strong> {cliente.comuna?.region?.nombre}
                            </Typography>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

export default ClienteRow;
