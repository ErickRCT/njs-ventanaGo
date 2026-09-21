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
import { Pauta } from "./service/interface.ts";
import {
    Edit,
    KeyboardArrowDown,
    KeyboardArrowUp,
    Image,
    Delete
} from '@mui/icons-material';

interface PautaRowProps {
    pauta: Pauta;
    expanded: boolean;
    onToggle: () => void;
    editPauta: (pauta: Pauta) => void;
    deletePauta: () => void;
}
const PautaRow: React.FC<PautaRowProps> = ({ pauta, expanded, onToggle ,editPauta , deletePauta }) => {
    const [openImageDialog, setOpenImageDialog] = useState(false);

    const handleOpenImage = () => setOpenImageDialog(true);
    const handleCloseImage = () => setOpenImageDialog(false);

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={onToggle}
                    >
                        {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>

                </TableCell>
                <TableCell>{pauta.serie?.nombre ?? 'Sin serie'}</TableCell>
                <TableCell>{pauta.nombre ?? 'Sin nombre'}</TableCell>
                <TableCell>{pauta.descripcion ?? 'Sin descripción'}</TableCell>
                <TableCell>
                    <IconButton color="info" onClick={() => editPauta(pauta)}>
                        <Edit />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={deletePauta}>
                        <Delete />
                    </IconButton>
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell sx={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Typography variant="h6" gutterBottom component="div">
                            Datos adicionales
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3, mb: 1, alignItems: "center" }}>

                            <Typography variant="body2" color="text.secondary">
                                <strong>Reforzado:</strong> {pauta.isReforzada ? "Si" : "No"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Tipo pauta:</strong> {pauta.tipoPauta?.nombre ?? 'Sin tipo'}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Imagen:</strong>
                                </Typography>
                                <IconButton color="primary" size="small" onClick={handleOpenImage}>
                                    <Image />
                                </IconButton>
                            </Box>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>

            {/* Dialog para mostrar la imagen */}
            <Dialog open={openImageDialog} onClose={handleCloseImage} maxWidth="md">
                <DialogContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <img
                            src={
                                pauta.tipoPauta?.rutaImagen
                                    ? `http://147.93.35.74/${pauta.tipoPauta.rutaImagen}`
                                    : '/placeholder.jpg'
                            }
                            alt="Imagen de la pauta"
                            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PautaRow;
