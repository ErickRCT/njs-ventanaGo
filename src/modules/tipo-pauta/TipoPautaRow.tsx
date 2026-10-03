import React, { useState } from 'react';
import {
    IconButton,
    TableCell,
    TableRow,
    Typography,
    Dialog,
    DialogContent,
    Box
} from '@mui/material';
import { TipoPautaInterface } from "./service/interface.ts";

import {Edit ,
    Image
} from '@mui/icons-material';
import { urlImagen } from '../../utils/imagenes.ts';

interface TipoPautaRowProps {
    tipoPauta: TipoPautaInterface;
    expanded: boolean;
    onToggle: () => void;
    onEdit: () => void;
}

const TipoPautaRow: React.FC<TipoPautaRowProps> = ({ tipoPauta , onEdit }) => {
    const [openImageDialog, setOpenImageDialog] = useState(false);

    const handleOpenImage = () => setOpenImageDialog(true);
    const handleCloseImage = () => setOpenImageDialog(false);

    return (
        <>
            {/* Fila principal */}
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>{tipoPauta.nombre}</TableCell>
                <TableCell>
                    {tipoPauta.rutaImagen ? (
                        <IconButton color="primary" size="small" onClick={handleOpenImage}>
                            <Image />
                        </IconButton>
                    ) : (
                        <Typography variant="body2" color="text.secondary">Sin imagen</Typography>
                    )}
                </TableCell>
                <TableCell>
                    <IconButton color="info" size="small" onClick={onEdit}>
                        <Edit />
                    </IconButton>
                </TableCell>
            </TableRow>

            {/* Dialog para mostrar imagen */}
            <Dialog open={openImageDialog} onClose={handleCloseImage} maxWidth="md">
                <DialogContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <img
                            src={urlImagen(tipoPauta.rutaImagen)}
                            alt="Imagen tipo pauta"
                            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TipoPautaRow;
