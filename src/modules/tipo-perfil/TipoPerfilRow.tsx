import { TableRow, TableCell, IconButton } from '@mui/material';
import {Edit} from '@mui/icons-material';
import {TipoPerfilInterface} from './service/interface.ts';



interface Props {
    tipoPerfil: TipoPerfilInterface;
    onEdit: (tipoPerfil: TipoPerfilInterface) => void;
}

const TipoPerfilRow: React.FC<Props> = ({ tipoPerfil , onEdit}) => {
    return (
        <TableRow sx={{ '& > *': { borderBottom: '1px solid #e0e0e0' } }}>
            <TableCell>{tipoPerfil.nombre}</TableCell>
            <TableCell>
                <IconButton color="info" size="small" onClick={() => onEdit(tipoPerfil)}>
                    <Edit />
                </IconButton>
            </TableCell>
        </TableRow>
    );
};

export default TipoPerfilRow;
