// src/components/ColorRow.tsx (ajusta la ruta según tu estructura)
import React from 'react';
import { TableRow, TableCell, IconButton } from '@mui/material';
import {Edit} from '@mui/icons-material';
import { ColorInterface } from './service/interface.ts';

interface Props {
    color: ColorInterface;
    onEdit: (color: ColorInterface) => void;
}

const ColorRow: React.FC<Props> = ({ color , onEdit }) => {
    return (
        <TableRow key={color.colorId} sx={{ '& > *': { borderBottom: '1px solid #e0e0e0' } }}>
            <TableCell>{color.nombre}</TableCell>
            <TableCell>${color.valor.toLocaleString()}</TableCell>
            <TableCell>
                <IconButton color="info" size="small" onClick={() => onEdit(color)}>
                    <Edit />
                </IconButton>
            </TableCell>
        </TableRow>
    );
};

export default ColorRow;
