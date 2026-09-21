
import {
    TableRow,
    TableCell,
    IconButton,
    Collapse,
    Typography,
    Box,
} from '@mui/material';
import {PerfilInterface} from "./service/interface.ts";
import {Edit ,
    KeyboardArrowUp,
    KeyboardArrowDown ,
    Delete
} from '@mui/icons-material';

interface Props {
    perfil: PerfilInterface;
    expanded: boolean;
    onToggle: () => void;
    editPerfil: (perfil : PerfilInterface) => void;
    deletePerfil: () => void;

}

const PerfilRow: React.FC<Props> = ({ perfil, expanded, onToggle , editPerfil , deletePerfil }) => {

    return (
        <>
            {/* Fila principal */}
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={onToggle}>
                        {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                <TableCell>{perfil.codigo}</TableCell>
                <TableCell>{perfil.descripcion}</TableCell>
                <TableCell>{perfil.peso}</TableCell>
                <TableCell>
                    <IconButton color="info" size="small" onClick={() => editPerfil(perfil)}>
                        <Edit />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={deletePerfil}>
                        <Delete />
                    </IconButton>
                </TableCell>
            </TableRow>

            {/* Fila expandida */}
            <TableRow>
                <TableCell sx={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse sx={{ m: 3 }} in={expanded} timeout="auto" unmountOnExit>
                        <Typography variant="h6" gutterBottom component="div">
                            Datos adicionales
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3, mb: 1, alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Tipo Perfil:</strong> {perfil.tipoPerfil?.nombre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Serie:</strong> {perfil.serie?.nombre}
                            </Typography>

                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>

        </>
    );
};

export default PerfilRow;