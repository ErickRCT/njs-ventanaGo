import React, { useState } from 'react';
import {
    Box,
    Collapse,
    IconButton,
    TableCell,
    TableRow,
    Typography,
    Dialog,
    DialogContent
} from '@mui/material';
import { QuincalleriaInterface } from "./service/interface.ts";

import {Edit ,
    KeyboardArrowUp,
    KeyboardArrowDown ,
    Delete,
    Image
} from '@mui/icons-material';
import { urlImagen } from '../../utils/imagenes.ts';

interface QuincalleriaRowProps {
    quincalleria: QuincalleriaInterface;
    deleteQuincalleria: () => void;
    editQuincalleria: (quincaleria : QuincalleriaInterface) => void;
    expanded: boolean;
    onToggle: () => void;
}

const QuincalleriaRow: React.FC<QuincalleriaRowProps> = ({ quincalleria, deleteQuincalleria,editQuincalleria,expanded, onToggle }) => {
    const [openImageDialog, setOpenImageDialog] = useState(false);

    const handleOpenImage = () => setOpenImageDialog(true);
    const handleCloseImage = () => setOpenImageDialog(false);

    return (
        <>
            {/* Fila principal */}
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={onToggle}>
                        {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>

                </TableCell>
                <TableCell>{quincalleria.nombre}</TableCell>
                <TableCell>{quincalleria.unidad}</TableCell>
                <TableCell>${quincalleria.valor}</TableCell>
                <TableCell>
                    {quincalleria.rutaImagen ? (
                        <IconButton color="primary" size="small" onClick={handleOpenImage}>
                            <Image />
                        </IconButton>
                    ) : (
                        <Typography variant="body2" color="text.secondary">Sin imagen</Typography>
                    )}
                </TableCell>
                <TableCell>
                    <IconButton color="info" size="small" onClick={() => editQuincalleria(quincalleria)}>
                        <Edit />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={deleteQuincalleria}>
                        <Delete />
                    </IconButton>
                </TableCell>
            </TableRow>

            {/* Fila expandida */}
            <TableRow>
                <TableCell sx={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Typography variant="h6" gutterBottom component="div">
                            Datos Serie
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Serie:</strong> {quincalleria.serie?.nombre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Descripcion:</strong> {quincalleria.serie?.descripcion}
                            </Typography>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>

            {/* Dialog para mostrar imagen */}
            <Dialog open={openImageDialog} onClose={handleCloseImage} maxWidth="md">
                <DialogContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <img
                            src={urlImagen(quincalleria.rutaImagen)}
                            alt="Imagen quincallería"
                            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default QuincalleriaRow;
