// src/components/ColorRow.tsx (ajusta la ruta según tu estructura)
import React from 'react';
import { TableRow, TableCell, IconButton } from '@mui/material';
import {Vidrio} from './service/interface.ts';
import {Edit} from '@mui/icons-material';

interface Props {
    vidrio: Vidrio;
    onEdit: (vidrio: Vidrio) => void;
}

const VidrioRow: React.FC<Props> = ({ vidrio , onEdit }) => {
    return (
        <TableRow sx={{ '& > *': { borderBottom: '1px solid #e0e0e0' } }}>
            <TableCell>{vidrio.nombre}</TableCell>
            <TableCell>${vidrio.valor.toLocaleString()}</TableCell>
            <TableCell>
                <IconButton color="info" size="small" onClick={() => onEdit(vidrio)}>
                    <Edit />
                </IconButton>
            </TableCell>
        </TableRow>
    );
};

export default VidrioRow;
